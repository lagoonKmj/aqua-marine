import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { embedOne } from "@/lib/embed";
import { seoulDayRangeIso } from "@/lib/kst";
import { StartVisitForm } from "@/components/StartVisitForm";

export default async function TodayPage() {
  const supabase = await createClient();
  const { start, end } = seoulDayRangeIso();

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, starts_at, status, notes, customer_id, customers(name, phone)")
    .gte("starts_at", start)
    .lt("starts_at", end)
    .order("starts_at");

  const { data: visits } = await supabase
    .from("visits")
    .select("id, visited_at, status, customer_id, customers(name, phone)")
    .gte("visited_at", start)
    .lt("visited_at", end)
    .order("visited_at", { ascending: false });

  const openVisits = (visits ?? []).filter((v) => v.status === "open");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">오늘</h1>
        <p className="text-sm text-slate-600">
          서울 기준 오늘 예약과 방문입니다.
        </p>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-medium text-slate-900">오늘 예약</h2>
          <Link
            href="/appointments"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
          >
            전체 예약 캘린더 보기
          </Link>
        </div>
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {(appointments ?? []).length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-500">예약이 없습니다.</li>
          ) : (
            (appointments ?? []).map((a) => {
              const cust = embedOne(a.customers) as {
                name: string;
                phone: string | null;
              } | null;
              return (
                <li
                  key={a.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {cust?.name ?? "고객"}
                      {cust?.phone ? (
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          {cust.phone}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(a.starts_at).toLocaleString("ko-KR")}
                    </p>
                    {a.notes ? (
                      <p className="text-sm text-slate-500">{a.notes}</p>
                    ) : null}
                    <p className="text-xs text-slate-400">상태: {a.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/customers/${a.customer_id}`}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                    >
                      고객 카드
                    </Link>
                    {a.status === "scheduled" ? (
                      <StartVisitForm
                        customerId={a.customer_id}
                        appointmentId={a.id}
                        label="접수·방문 시작"
                      />
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-900">오늘 방문</h2>
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {(visits ?? []).length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-500">방문 기록이 없습니다.</li>
          ) : (
            (visits ?? []).map((v) => {
              const cust = embedOne(v.customers) as {
                name: string;
                phone: string | null;
              } | null;
              return (
                <li
                  key={v.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {cust?.name ?? "고객"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(v.visited_at).toLocaleString("ko-KR")} · {v.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/visits/${v.id}`}
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      {v.status === "open" ? "시술·결제" : "보기"}
                    </Link>
                    <Link
                      href={`/customers/${v.customer_id}`}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                    >
                      고객
                    </Link>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-900">진행 중 방문</h2>
        {openVisits.length === 0 ? (
          <p className="text-sm text-slate-500">진행 중인 방문이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {openVisits.map((v) => {
              const cust = embedOne(v.customers) as { name: string } | null;
              return (
                <li key={v.id}>
                  <Link
                    href={`/visits/${v.id}`}
                    className="block rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 hover:bg-amber-100"
                  >
                    {cust?.name ?? "고객"} — 시술·결제 계속하기
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-800">빠른 안내</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>선불 충전·지갑 결제는 고객 카드에서 처리합니다.</li>
          <li>지갑 잔액 부족 시 결제 수단을 바꿔 주세요.</li>
        </ul>
      </section>
    </div>
  );
}
