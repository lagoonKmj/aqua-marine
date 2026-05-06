"use client";

import { useActionState } from "react";
import { createAppointmentForm } from "@/app/actions/salon";

type Customer = { id: string; name: string; phone: string | null };

export function AppointmentCreateForm({ customers }: { customers: Customer[] }) {
  const [state, action, pending] = useActionState(createAppointmentForm, null);

  return (
    <form action={action} className="space-y-3 rounded-lg border border-slate-200 p-4">
      <h2 className="font-medium text-slate-900">예약 등록</h2>
      <div>
        <label className="mb-1 block text-sm text-slate-600">고객</label>
        <select
          name="customer_id"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          defaultValue=""
        >
          <option value="" disabled>
            선택
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.phone ? ` (${c.phone})` : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">일시 (로컬 입력)</label>
        <input
          type="datetime-local"
          name="starts_at"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">메모</label>
        <textarea
          name="notes"
          rows={2}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-emerald-700">등록되었습니다.</p> : null}
      <button
        type="submit"
        disabled={pending || customers.length === 0}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "저장 중…" : "예약 저장"}
      </button>
    </form>
  );
}
