"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function mapRpcError(message: string | undefined): string {
  if (!message) return "요청 처리 중 오류가 났습니다.";
  if (message.includes("insufficient_wallet")) {
    return "지갑 잔액이 부족합니다. 결제 수단을 바꿔 주세요.";
  }
  if (message.includes("not_authenticated")) return "로그인이 필요합니다.";
  if (message.includes("product_not_found")) return "선불 상품을 찾을 수 없습니다.";
  if (message.includes("customer_not_found")) return "고객을 찾을 수 없습니다.";
  if (message.includes("visit_not_found")) return "방문 정보를 찾을 수 없습니다.";
  return message;
}

export async function createCustomer(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const birthday = String(formData.get("birthday") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!name) return;

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name,
      phone,
      birthday: birthday || null,
      notes,
    })
    .select("id")
    .single();

  if (error || !data) return;
  revalidatePath("/customers");
  redirect(`/customers/${data.id}`);
}

export async function updateCustomer(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const customerId = String(formData.get("customer_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const birthday = String(formData.get("birthday") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!customerId || !name) return;

  const { error } = await supabase
    .from("customers")
    .update({
      name,
      phone,
      birthday: birthday || null,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) return;
  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
}

export async function createPrepaidProduct(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const pay = Number(formData.get("pay_amount"));
  const credit = Number(formData.get("credit_amount"));
  if (!name) return;
  if (!Number.isFinite(pay) || pay <= 0) return;
  if (!Number.isFinite(credit) || credit <= 0) return;

  const { error } = await supabase.from("prepaid_products").insert({
    name,
    pay_amount: Math.round(pay),
    credit_amount: Math.round(credit),
    active: true,
  });

  if (error) return;
  revalidatePath("/prepaid-products");
}

export async function togglePrepaidProduct(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("prepaid_products")
    .update({ active })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/prepaid-products");
  return { ok: true as const };
}

export async function setPrepaidProductActiveForm(formData: FormData): Promise<void> {
  const id = String(formData.get("product_id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!id) return;
  await togglePrepaidProduct(id, active);
}

export async function walletTopup(
  customerId: string,
  productId: string,
  incomeMethod: "cash" | "card" | "transfer",
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("wallet_topup", {
    p_customer_id: customerId,
    p_product_id: productId,
    p_income_method: incomeMethod,
  });
  if (error) return { error: mapRpcError(error.message) };
  revalidatePath(`/customers/${customerId}`);
  revalidatePath(`/visits`);
  revalidatePath("/today");
  return { ok: true as const };
}

export async function walletTopupForm(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const customerId = String(formData.get("customer_id") ?? "");
  const productId = String(formData.get("product_id") ?? "");
  const incomeMethod = String(formData.get("income_method") ?? "") as
    | "cash"
    | "card"
    | "transfer";
  if (!customerId || !productId) return { error: "고객·상품 정보가 없습니다." };
  if (!["cash", "card", "transfer"].includes(incomeMethod)) {
    return { error: "입금 수단을 선택해 주세요." };
  }
  return walletTopup(customerId, productId, incomeMethod);
}

export async function startVisit(customerId: string, appointmentId?: string | null) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_visit", {
    p_customer_id: customerId,
    p_appointment_id: appointmentId ?? null,
  });
  if (error) return { error: mapRpcError(error.message) };
  const visitId = data as string;
  revalidatePath("/today");
  revalidatePath(`/customers/${customerId}`);
  redirect(`/visits/${visitId}`);
}

export async function startVisitFromForm(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const customerId = String(formData.get("customer_id") ?? "");
  const appointmentIdRaw = String(formData.get("appointment_id") ?? "").trim();
  const appointmentId = appointmentIdRaw || null;
  if (!customerId) return { error: "고객 정보가 없습니다." };
  const res = await startVisit(customerId, appointmentId);
  if (res && typeof res === "object" && "error" in res) {
    return { error: res.error };
  }
  return null;
}

export async function addTreatmentLineForm(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: true }> {
  const visitId = String(formData.get("visit_id") ?? "");
  if (!visitId) return { error: "방문 정보가 없습니다." };
  return addTreatmentLine(visitId, formData);
}

export async function addTreatmentLine(
  visitId: string,
  formData: FormData,
): Promise<{ error?: string; ok?: true }> {
  const supabase = await createClient();
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const paymentMethod = String(formData.get("payment_method") ?? "") as
    | "wallet"
    | "cash"
    | "card"
    | "transfer";
  if (!description) return { error: "시술 내용을 입력해 주세요." };
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "금액이 올바르지 않습니다." };
  }
  if (!["wallet", "cash", "card", "transfer"].includes(paymentMethod)) {
    return { error: "결제 수단을 선택해 주세요." };
  }

  const { error } = await supabase.rpc("add_treatment_line", {
    p_visit_id: visitId,
    p_description: description,
    p_amount: Math.round(amount),
    p_payment_method: paymentMethod,
  });
  if (error) return { error: mapRpcError(error.message) };
  revalidatePath(`/visits/${visitId}`);
  revalidatePath("/today");
  return { ok: true };
}

export async function completeVisit(visitId: string, customerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("visits")
    .update({ status: "completed" })
    .eq("id", visitId);
  if (error) return { error: error.message };
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/today");
  redirect(`/customers/${customerId}`);
}

export async function completeVisitFromForm(formData: FormData): Promise<void> {
  const visitId = String(formData.get("visit_id") ?? "");
  const customerId = String(formData.get("customer_id") ?? "");
  if (!visitId || !customerId) return;
  const result = await completeVisit(visitId, customerId);
  if (result && typeof result === "object" && "error" in result) return;
}

export async function createAppointment(formData: FormData) {
  const supabase = await createClient();
  const customerId = String(formData.get("customer_id") ?? "");
  const startsAt = String(formData.get("starts_at") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!customerId) return { error: "고객을 선택해 주세요." };
  if (!startsAt) return { error: "일시를 입력해 주세요." };

  const { error } = await supabase.from("appointments").insert({
    customer_id: customerId,
    starts_at: new Date(startsAt).toISOString(),
    notes,
    status: "scheduled",
  });
  if (error) return { error: error.message };
  revalidatePath("/appointments");
  revalidatePath("/today");
  return { ok: true as const };
}

export async function createAppointmentForm(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  return createAppointment(formData);
}

export async function setAppointmentStatus(
  id: string,
  status: "scheduled" | "cancelled" | "completed",
) {
  const supabase = await createClient();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/appointments");
  revalidatePath("/today");
  return { ok: true as const };
}

export async function cancelAppointmentForm(formData: FormData): Promise<void> {
  const id = String(formData.get("appointment_id") ?? "");
  if (!id) return;
  await setAppointmentStatus(id, "cancelled");
}

export async function completeAppointmentForm(formData: FormData): Promise<void> {
  const id = String(formData.get("appointment_id") ?? "");
  if (!id) return;
  await setAppointmentStatus(id, "completed");
}

export async function registerTreatmentPhotoForm(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const treatmentLineId = String(formData.get("treatment_line_id") ?? "");
  const visitId = String(formData.get("visit_id") ?? "");
  const customerId = String(formData.get("customer_id") ?? "");
  if (!treatmentLineId || !visitId || !customerId) {
    return { error: "업로드 정보가 부족합니다." };
  }
  return registerTreatmentPhoto(treatmentLineId, visitId, customerId, formData);
}

export async function registerTreatmentPhoto(
  treatmentLineId: string,
  visitId: string,
  customerId: string,
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const supabase = await createClient();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "이미지 파일을 선택해 주세요." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${customerId}/${treatmentLineId}/${randomUUID()}.${ext}`;

  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage
    .from("treatment-photos")
    .upload(path, buf, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (upErr) return { error: upErr.message };

  const { error: dbErr } = await supabase.from("treatment_photos").insert({
    treatment_line_id: treatmentLineId,
    storage_path: path,
  });
  if (dbErr) return { error: dbErr.message };

  revalidatePath(`/visits/${visitId}`);
  return { ok: true };
}
