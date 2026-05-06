"use client";

import { useActionState } from "react";
import { addTreatmentLineForm } from "@/app/actions/salon";

export function AddTreatmentLineForm({ visitId }: { visitId: string }) {
  const [state, action, pending] = useActionState(addTreatmentLineForm, null);

  return (
    <form action={action} className="space-y-3 rounded-lg border border-slate-200 p-4">
      <h3 className="font-medium text-slate-900">시술 추가</h3>
      <input type="hidden" name="visit_id" value={visitId} />
      <div>
        <label className="mb-1 block text-sm text-slate-600">시술 내용</label>
        <input
          name="description"
          required
          placeholder="예: 두피 케어"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">금액 (원)</label>
        <input
          name="amount"
          type="number"
          min={0}
          step={1000}
          required
          defaultValue={0}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">결제 수단 (한 가지)</label>
        <select
          name="payment_method"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          defaultValue="card"
        >
          <option value="wallet">선불 지갑</option>
          <option value="card">카드</option>
          <option value="cash">현금</option>
          <option value="transfer">이체</option>
        </select>
      </div>
      {state?.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-emerald-700">시술이 추가되었습니다.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "저장 중…" : "시술 저장"}
      </button>
    </form>
  );
}
