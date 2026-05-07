"use client";

import { useActionState } from "react";
import { walletTopupForm } from "@/app/actions/salon";
import { formatKrw } from "@/lib/money";
import { crmUi } from "@/lib/crmUi";

type Product = {
  id: string;
  name: string;
  pay_amount: number;
  credit_amount: number;
};

export function WalletTopupForm({
  customerId,
  products,
}: {
  customerId: string;
  products: Product[];
}) {
  const [state, action, pending] = useActionState(walletTopupForm, null);

  return (
    <form action={action} className={`space-y-4 ${crmUi.surfacePad}`}>
      <h3 className={crmUi.sectionTitle}>선불 충전</h3>
      <input type="hidden" name="customer_id" value={customerId} />
      <div>
        <label className={crmUi.label}>상품</label>
        <select
          name="product_id"
          required
          className={`${crmUi.input} appearance-none`}
          defaultValue=""
        >
          <option value="" disabled>
            선택
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (실수령 {formatKrw(p.pay_amount)} → 적립{" "}
              {formatKrw(p.credit_amount)})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={crmUi.label}>실제 입금 수단</label>
        <select
          name="income_method"
          required
          className={`${crmUi.input} appearance-none`}
          defaultValue="card"
        >
          <option value="card">카드</option>
          <option value="cash">현금</option>
          <option value="transfer">이체</option>
        </select>
      </div>
      {state?.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-emerald-700">충전이 반영되었습니다.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending || products.length === 0}
        className={`w-full ${crmUi.btnPrimary}`}
      >
        {pending ? "처리 중…" : "충전 반영"}
      </button>
    </form>
  );
}
