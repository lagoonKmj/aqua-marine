"use client";

import { useActionState } from "react";
import { createAppointmentForm } from "@/app/actions/salon";
import { crmUi } from "@/lib/crmUi";

type Customer = { id: string; name: string; phone: string | null };

export function AppointmentCreateForm({ customers }: { customers: Customer[] }) {
  const [state, action, pending] = useActionState(createAppointmentForm, null);

  return (
    <form action={action} className={`space-y-4 ${crmUi.surface}`}>
      <h2 className={crmUi.sectionTitle}>예약 등록</h2>
      <div>
        <label className={crmUi.label}>고객</label>
        <select
          name="customer_id"
          required
          className={`${crmUi.input} appearance-none`}
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
        <label className={crmUi.label}>일시 (로컬 입력)</label>
        <input
          type="datetime-local"
          name="starts_at"
          required
          className={crmUi.input}
        />
      </div>
      <div>
        <label className={crmUi.label}>메모</label>
        <textarea
          name="notes"
          rows={2}
          className={crmUi.input}
        />
      </div>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.ok ? (
        <p className="text-sm font-medium text-emerald-700">등록되었습니다.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending || customers.length === 0}
        className={`w-full ${crmUi.btnPrimary}`}
      >
        {pending ? "저장 중…" : "예약 저장"}
      </button>
    </form>
  );
}
