import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { embedOne } from "@/lib/embed";
import { AppointmentCreateForm } from "@/components/AppointmentCreateForm";
import {
  cancelAppointmentForm,
  completeAppointmentForm,
} from "@/app/actions/salon";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">예약</h1>
        <p className="text-sm text-slate-600">
          전화 예약을 등록하고, 오늘 예약은 오늘 화면에서 확인하고 전체 예약은 여기서 관리합니다.
        </p>
      </div>

      <AppointmentCreateForm customers={customers ?? []} />

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-900">예약 캘린더 ({monthLabel})</h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-500">
            {["일", "월", "화", "수", "목", "금", "토"].map((weekday) => (
              <div key={weekday} className="py-2">
                {weekday}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarCells.map((cell, idx) => (
              <div
                key={`${cell.day ?? "empty"}-${idx}`}
                className="min-h-20 border-b border-r border-slate-100 p-2 text-sm"
              >
                {cell.day ? (
                  <div className="space-y-1">
                    <p className="font-medium text-slate-800">{cell.day}</p>
                    {cell.count > 0 ? (
                      <p className="inline-flex rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                        예약 {cell.count}건
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">예약 없음</p>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-900">전체 예약 목록</h2>
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
                  className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
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
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50"
                    >
                      고객
                    </Link>
                    {a.status === "scheduled" ? (
                      <form action={cancelAppointmentForm} className="inline">
                        <input type="hidden" name="appointment_id" value={a.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-red-200 px-2 py-1 text-sm text-red-700 hover:bg-red-50"
                        >
                          취소
                        </button>
                      </form>
                    ) : null}
                    {a.status === "scheduled" ? (
                      <form action={completeAppointmentForm} className="inline">
                        <input type="hidden" name="appointment_id" value={a.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50"
                        >
                          완료 처리
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
