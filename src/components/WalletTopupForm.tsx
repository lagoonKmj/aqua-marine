"use client";

import { useActionState } from "react";
import { walletTopupForm } from "@/app/actions/salon";
import { formatKrw } from "@/lib/money";

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
    <form action={action} className="space-y-3 rounded-lg border border-slate-200 p-4">
      <h3 className="font-medium text-slate-900">선불 충전</h3>
      <input type="hidden" name="customer_id" value={customerId} />
      <div>
        <label className="mb-1 block text-sm text-slate-600">상품</label>
        <select
          name="product_id"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
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
        <label className="mb-1 block text-sm text-slate-600">실제 입금 수단</label>
        <select
          name="income_method"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
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
        className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {pending ? "처리 중…" : "충전 반영"}
      </button>
    </form>
  );
}
