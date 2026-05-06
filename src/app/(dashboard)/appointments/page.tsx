import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { embedOne } from "@/lib/embed";
import { AppointmentCreateForm } from "@/components/AppointmentCreateForm";
import {
  cancelAppointmentForm,
  completeAppointmentForm,
} from "@/app/actions/salon";

export default async function AppointmentsPage() {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone")
    .order("name")
    .limit(200);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, starts_at, status, notes, customer_id, customers(name, phone)")
    .order("starts_at", { ascending: false })
    .limit(80);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">예약</h1>
        <p className="text-sm text-slate-600">전화 예약을 등록하고 상태를 관리합니다.</p>
      </div>

      <AppointmentCreateForm customers={customers ?? []} />

      <section>
        <h2 className="mb-3 text-lg font-medium text-slate-900">최근 예약</h2>
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
