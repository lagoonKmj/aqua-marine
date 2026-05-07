import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatKrw } from "@/lib/money";
import { AddTreatmentLineForm } from "@/components/AddTreatmentLineForm";
import { PhotoUploadForm } from "@/components/PhotoUploadForm";
import { completeVisitFromForm } from "@/app/actions/salon";
import { crmUi } from "@/lib/crmUi";

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
    <div className={crmUi.pageWrap}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm">
            <Link href={`/customers/${customer.id}`} className={crmUi.linkSubtle}>
              {customer.name}
            </Link>
          </p>
          <h1 className={`mt-1 ${crmUi.pageTitle}`}>방문</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {new Date(visit.visited_at).toLocaleString("ko-KR")} · 상태 {visit.status}
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            지갑 잔액 <span className="font-semibold text-brand-600">{formatKrw(customer.wallet_balance)}</span>
          </p>
        </div>
        {visit.status === "open" ? (
          <form action={completeVisitFromForm} className="flex max-w-xs flex-col items-stretch gap-2 sm:items-end">
            <input type="hidden" name="visit_id" value={visitId} />
            <input type="hidden" name="customer_id" value={customer.id} />
            <button type="submit" className={crmUi.btnSecondary}>
              방문 완료
            </button>
            <span className="text-right text-xs leading-relaxed text-neutral-500">
              시술·결제 후 눌러 방문을 종료합니다.
            </span>
          </form>
        ) : (
          <span className={crmUi.badgeMuted}>완료됨</span>
        )}
      </div>

      {visit.status === "open" ? <AddTreatmentLineForm visitId={visitId} /> : null}

      <section>
        <h2 className={`mb-3 ${crmUi.sectionTitle}`}>시술 내역</h2>
        <ul className="space-y-4">
          {(lines ?? []).length === 0 ? (
            <li className={`${crmUi.surface} py-14 text-center text-sm text-neutral-500`}>
              등록된 시술이 없습니다.
            </li>
          ) : (
            (lines ?? []).map((line) => {
              const linePhotos = photosByLine.get(line.id) ?? [];
              return (
                <li
                  key={line.id}
                  className={crmUi.surfacePad}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-neutral-900">{line.description}</p>
                      <p className="mt-0.5 text-sm text-neutral-600">
                        {formatKrw(line.amount)} ·{" "}
                        {paymentLabel[line.payment_method] ?? line.payment_method}
                      </p>
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      {new Date(line.created_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  {visit.status === "open" ? (
                    <div className="mt-4 border-t border-neutral-100 pt-4">
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
                              className="h-24 w-24 rounded-xl object-cover ring-1 ring-neutral-200"
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

      <nav className="flex flex-wrap gap-3 text-sm">
        <Link href="/today" className={crmUi.linkSubtle}>
          오늘
        </Link>
        <span className="text-neutral-300">|</span>
        <Link href={`/customers/${customer.id}`} className={crmUi.linkSubtle}>
          고객 카드
        </Link>
      </nav>
    </div>
  );
}
