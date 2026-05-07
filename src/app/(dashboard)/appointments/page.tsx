import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { embedOne } from "@/lib/embed";
import { AppointmentCreateForm } from "@/components/AppointmentCreateForm";
import {
  cancelAppointmentForm,
  completeAppointmentForm,
} from "@/app/actions/salon";
import { crmUi } from "@/lib/crmUi";

const seoulYmd = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const seoulMonthLabel = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
});

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const now = new Date();
  const monthLabel = seoulMonthLabel.format(now);
  const [yearStr, monthStr] = seoulYmd.format(now).split("-") as [
    string,
    string,
    string,
  ];
  const year = Number(yearStr);
  const month = Number(monthStr);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone")
    .order("name")
    .limit(200);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, starts_at, status, notes, customer_id, customers(name, phone)")
    .order("starts_at", { ascending: false });

  const monthCounts = new Map<number, number>();
  for (const a of appointments ?? []) {
    const [aYear, aMonth, aDay] = seoulYmd.format(new Date(a.starts_at)).split("-");
    if (Number(aYear) !== year || Number(aMonth) !== month) continue;
    const day = Number(aDay);
    monthCounts.set(day, (monthCounts.get(day) ?? 0) + 1);
  }

  const calendarCells = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => {
    const day = index - firstWeekday + 1;
    if (day < 1 || day > daysInMonth) {
      return { day: null as number | null, count: 0 };
    }
    return { day, count: monthCounts.get(day) ?? 0 };
  });

  return (
    <div className={crmUi.pageWrap}>
      <div>
        <h1 className={crmUi.pageTitle}>예약</h1>
        <p className={crmUi.pageDesc}>
          전화 예약을 등록하고, 오늘 요약은 오늘 탭에서 · 전체는 캘린더와 목록에서 확인합니다.
        </p>
      </div>

      <AppointmentCreateForm customers={customers ?? []} />

      <section>
        <h2 className={`mb-3 ${crmUi.sectionTitle}`}>예약 캘린더 · {monthLabel}</h2>
        <div className={`${crmUi.listWrap}`}>
          <div className="grid grid-cols-7 border-b border-neutral-100 bg-neutral-50/80 text-center text-[11px] font-semibold text-neutral-500">
            {["일", "월", "화", "수", "목", "금", "토"].map((weekday, i) => (
              <div
                key={weekday}
                className={`py-2 ${i === 0 ? "text-red-400" : i === 6 ? "text-sky-500" : ""}`}
              >
                {weekday}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 bg-white">
            {calendarCells.map((cell, idx) => (
              <div
                key={`${cell.day ?? "empty"}-${idx}`}
                className="min-h-[5.25rem] border-b border-r border-neutral-100 p-2 text-sm last:border-r-0"
              >
                {cell.day ? (
                  <div className="space-y-1">
                    <p
                      className={`font-semibold tabular-nums ${
                        idx % 7 === 0 ? "text-red-500" : idx % 7 === 6 ? "text-sky-600" : "text-neutral-800"
                      }`}
                    >
                      {cell.day}
                    </p>
                    {cell.count > 0 ? (
                      <span className={crmUi.badge}>예약 {cell.count}</span>
                    ) : (
                      <p className="text-[11px] text-neutral-400">—</p>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className={`mb-3 ${crmUi.sectionTitle}`}>전체 예약 목록</h2>
        <ul className={`${crmUi.listWrap} divide-y divide-neutral-100`}>
          {(appointments ?? []).length === 0 ? (
            <li className={crmUi.listEmpty}>예약이 없습니다.</li>
          ) : (
            (appointments ?? []).map((a) => {
              const cust = embedOne(a.customers) as {
                name: string;
                phone: string | null;
              } | null;
              return (
                <li
                  key={a.id}
                  className={`${crmUi.listRow} ${crmUi.listRowHover}`}
                >
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {cust?.name ?? "고객"}
                      {cust?.phone ? (
                        <span className="ml-2 text-sm font-normal text-neutral-500">
                          {cust.phone}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {new Date(a.starts_at).toLocaleString("ko-KR")}
                    </p>
                    {a.notes ? (
                      <p className="text-sm text-neutral-500">{a.notes}</p>
                    ) : null}
                    <p className="text-xs text-neutral-400">상태 · {a.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/customers/${a.customer_id}`} className={crmUi.btnSecondarySm}>
                      고객
                    </Link>
                    {a.status === "scheduled" ? (
                      <form action={cancelAppointmentForm} className="inline">
                        <input type="hidden" name="appointment_id" value={a.id} />
                        <button
                          type="submit"
                          className="inline-flex rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          취소
                        </button>
                      </form>
                    ) : null}
                    {a.status === "scheduled" ? (
                      <form action={completeAppointmentForm} className="inline">
                        <input type="hidden" name="appointment_id" value={a.id} />
                        <button type="submit" className={crmUi.btnSecondarySm}>
                          완료
                        </button>
                      </form>
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </div>
  );
}
