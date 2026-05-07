"use client";

import { useActionState } from "react";
import { addTreatmentLineForm } from "@/app/actions/salon";
import { crmUi } from "@/lib/crmUi";

export function AddTreatmentLineForm({ visitId }: { visitId: string }) {
  const [state, action, pending] = useActionState(addTreatmentLineForm, null);

  return (
    <form action={action} className={`space-y-4 ${crmUi.surfacePad}`}>
      <h3 className={crmUi.sectionTitle}>시술 추가</h3>
      <input type="hidden" name="visit_id" value={visitId} />
      <div>
        <label className={crmUi.label}>시술 내용</label>
        <input
          name="description"
          required
          placeholder="예: 두피 케어"
          className={crmUi.input}
        />
      </div>
      <div>
        <label className={crmUi.label}>금액 (원)</label>
        <input
          name="amount"
          type="number"
          min={0}
          step={1000}
          required
          defaultValue={0}
          className={crmUi.input}
        />
      </div>
      <div>
        <label className={crmUi.label}>결제 수단 (한 가지)</label>
        <select
          name="payment_method"
          required
          className={`${crmUi.input} appearance-none`}
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
        className={`w-full ${crmUi.btnPrimary}`}
      >
        {pending ? "저장 중…" : "시술 저장"}
      </button>
    </form>
  );
}
