import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatKrw } from "@/lib/money";
import { AddTreatmentLineForm } from "@/components/AddTreatmentLineForm";
import { PhotoUploadForm } from "@/components/PhotoUploadForm";
import { completeVisitFromForm } from "@/app/actions/salon";

const paymentLabel: Record<string, string> = {
  wallet: "선불 지갑",
  cash: "현금",
  card: "카드",
  transfer: "이체",
};

export default async function VisitPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  const supabase = await createClient();

  const { data: visit, error: vErr } = await supabase
    .from("visits")
    .select("*")
    .eq("id", visitId)
    .single();

  if (vErr || !visit) notFound();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", visit.customer_id)
    .single();

  if (!customer) notFound();

  const { data: lines } = await supabase
    .from("treatment_lines")
    .select("*")
    .eq("visit_id", visitId)
    .order("created_at");

  const lineIds = (lines ?? []).map((l) => l.id);
  const { data: photos } =
    lineIds.length > 0
      ? await supabase.from("treatment_photos").select("*").in("treatment_line_id", lineIds)
      : { data: [] as { id: string; treatment_line_id: string; storage_path: string }[] };

  const urlByPath = new Map<string, string>();
  await Promise.all(
    (photos ?? []).map(async (p) => {
      const { data } = await supabase.storage
        .from("treatment-photos")
        .createSignedUrl(p.storage_path, 3600);
      if (data?.signedUrl) urlByPath.set(p.storage_path, data.signedUrl);
    }),
  );

  const photosByLine = new Map<string, typeof photos>();
  for (const p of photos ?? []) {
    const arr = photosByLine.get(p.treatment_line_id) ?? [];
    arr.push(p);
    photosByLine.set(p.treatment_line_id, arr);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            <Link href={`/customers/${customer.id}`} className="underline">
              {customer.name}
            </Link>
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">방문</h1>
          <p className="text-sm text-slate-600">
            {new Date(visit.visited_at).toLocaleString("ko-KR")} · 상태 {visit.status}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            지갑 잔액 {formatKrw(customer.wallet_balance)}
          </p>
        </div>
        {visit.status === "open" ? (
          <form action={completeVisitFromForm} className="flex flex-col items-end gap-2">
            <input type="hidden" name="visit_id" value={visitId} />
            <input type="hidden" name="customer_id" value={customer.id} />
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
            >
              방문 완료
            </button>
            <span className="max-w-xs text-right text-xs text-slate-500">
              시술·결제를 마쳤다면 눌러 방문을 종료합니다.
            </span>
          </form>
        ) : (
          <span className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-600">
            완료됨
          </span>
        )}
      </div>

      {visit.status === "open" ? <AddTreatmentLineForm visitId={visitId} /> : null}

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-900">시술 내역</h2>
        <ul className="space-y-4">
          {(lines ?? []).length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              등록된 시술이 없습니다.
            </li>
          ) : (
            (lines ?? []).map((line) => {
              const linePhotos = photosByLine.get(line.id) ?? [];
              return (
                <li
                  key={line.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{line.description}</p>
                      <p className="text-sm text-slate-600">
                        {formatKrw(line.amount)} ·{" "}
                        {paymentLabel[line.payment_method] ?? line.payment_method}
                      </p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(line.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  {visit.status === "open" ? (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <PhotoUploadForm
                        treatmentLineId={line.id}
                        visitId={visitId}
                        customerId={customer.id}
                      />
                    </div>
                  ) : null}
                  {linePhotos.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {linePhotos.map((ph) => {
                        const url = urlByPath.get(ph.storage_path);
                        return url ? (
                          <a key={ph.id} href={url} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element -- signed URL */}
                            <img
                              src={url}
                              alt=""
                              className="h-24 w-24 rounded-md object-cover ring-1 ring-slate-200"
                            />
                          </a>
                        ) : null;
                      })}
                    </div>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      </section>

      <p className="text-sm text-slate-500">
        <Link href="/today" className="underline">
          오늘
        </Link>
        {" · "}
        <Link href={`/customers/${customer.id}`} className="underline">
          고객 카드
        </Link>
      </p>
    </div>
  );
}
