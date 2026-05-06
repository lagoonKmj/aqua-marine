"use client";

import { useActionState } from "react";
import { registerTreatmentPhotoForm } from "@/app/actions/salon";

export function PhotoUploadForm({
  treatmentLineId,
  visitId,
  customerId,
}: {
  treatmentLineId: string;
  visitId: string;
  customerId: string;
}) {
  const [state, action, pending] = useActionState(registerTreatmentPhotoForm, null);

  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="treatment_line_id" value={treatmentLineId} />
      <input type="hidden" name="visit_id" value={visitId} />
      <input type="hidden" name="customer_id" value={customerId} />
      <label className="text-sm text-slate-600">
        <span className="mb-1 block">사진</span>
        <input
          type="file"
          name="file"
          accept="image/*"
          capture="environment"
          className="max-w-[220px] text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
      >
        {pending ? "업로드…" : "업로드"}
      </button>
      {state?.error ? (
        <span className="text-sm text-red-600">{state.error}</span>
      ) : null}
      {state?.ok ? (
        <span className="text-sm text-emerald-700">완료</span>
      ) : null}
    </form>
  );
}
