"use client";

import { useActionState } from "react";
import { startVisitFromForm } from "@/app/actions/salon";

export function StartVisitForm({
  customerId,
  appointmentId,
  label = "방문 시작",
}: {
  customerId: string;
  appointmentId?: string | null;
  label?: string;
}) {
  const [state, action, pending] = useActionState(startVisitFromForm, null);

  return (
    <form action={action} className="inline">
      <input type="hidden" name="customer_id" value={customerId} />
      {appointmentId ? (
        <input type="hidden" name="appointment_id" value={appointmentId} />
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "처리 중…" : label}
      </button>
      {state?.error ? (
        <span className="ml-2 text-sm text-red-600">{state.error}</span>
      ) : null}
    </form>
  );
}
