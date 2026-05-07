import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCustomer } from "@/app/actions/salon";
import { formatKrw } from "@/lib/money";
import { WalletTopupForm } from "@/components/WalletTopupForm";
import { StartVisitForm } from "@/components/StartVisitForm";
import { crmUi } from "@/lib/crmUi";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !customer) notFound();

  const { data: products } = await supabase
    .from("prepaid_products")
    .select("id, name, pay_amount, credit_amount")
    .eq("active", true)
    .order("pay_amount");

  const { data: visits } = await supabase
    .from("visits")
    .select("id, visited_at, status")
    .eq("customer_id", id)
    .order("visited_at", { ascending: false })
    .limit(30);

  return (
    <div className={crmUi.pageWrap}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className={crmUi.pageTitle}>{customer.name}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            지갑 잔액{" "}
            <span className="font-semibold text-brand-600">{formatKrw(customer.wallet_balance)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StartVisitForm customerId={id} />
          <Link href="/customers" className={crmUi.btnSecondary}>
            목록
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={crmUi.surfacePad}>
          <h2 className={`mb-4 ${crmUi.sectionTitle}`}>프로필</h2>
          <form action={updateCustomer} className="space-y-4">
            <input type="hidden" name="customer_id" value={id} />
            <div>
              <label className={crmUi.label}>이름</label>
              <input
                name="name"
                required
                defaultValue={customer.name}
                className={crmUi.input}
              />
            </div>
            <div>
              <label className={crmUi.label}>전화</label>
              <input
                name="phone"
                defaultValue={customer.phone ?? ""}
                className={crmUi.input}
              />
            </div>
            <div>
              <label className={crmUi.label}>생일</label>
              <input
                name="birthday"
                type="date"
                defaultValue={customer.birthday ?? ""}
                className={crmUi.input}
              />
            </div>
            <div>
              <label className={crmUi.label}>메모</label>
              <textarea
                name="notes"
                rows={4}
                defaultValue={customer.notes ?? ""}
                className={`${crmUi.input} min-h-[120px] resize-y`}
              />
            </div>
            <button type="submit" className={crmUi.btnPrimary}>
              저장
            </button>
          </form>
        </section>

        <WalletTopupForm customerId={id} products={products ?? []} />
      </div>

      <section>
        <h2 className={`mb-3 ${crmUi.sectionTitle}`}>최근 방문</h2>
        <ul className={`${crmUi.listWrap} divide-y divide-neutral-100`}>
          {(visits ?? []).length === 0 ? (
            <li className={crmUi.listEmpty}>방문 기록이 없습니다.</li>
          ) : (
            (visits ?? []).map((v) => (
              <li
                key={v.id}
                className={`${crmUi.listRow} items-center justify-between sm:flex-row`}
              >
                <div>
                  <p className="text-sm font-medium text-neutral-800">
                    {new Date(v.visited_at).toLocaleString("ko-KR")}
                  </p>
                  <span className={crmUi.badgeMuted}>{v.status}</span>
                </div>
                <Link href={`/visits/${v.id}`} className={crmUi.btnPrimarySm}>
                  열기
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
