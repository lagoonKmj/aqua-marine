import { createClient } from "@/lib/supabase/server";
import {
  createPrepaidProduct,
  setPrepaidProductActiveForm,
} from "@/app/actions/salon";
import { formatKrw } from "@/lib/money";

export default async function PrepaidProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("prepaid_products")
    .select("*")
    .order("pay_amount");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">선불 상품</h1>
        <p className="text-sm text-slate-600">
          실수령 금액과 지갑 적립액을 미리 등록합니다. (예: 30만 실수령 → 33만 적립)
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-medium text-slate-900">상품 추가</h2>
        <form action={createPrepaidProduct} className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="mb-1 block text-sm text-slate-600">상품명</label>
            <input
              name="name"
              required
              placeholder="예: 정기 패키지 A"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">실수령 (원)</label>
            <input
              name="pay_amount"
              type="number"
              min={10000}
              step={10000}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">적립 (원)</label>
            <input
              name="credit_amount"
              type="number"
              min={10000}
              step={10000}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              등록
            </button>
          </div>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          금액은 1만원 단위만 입력할 수 있습니다. (예: 200000)
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-medium text-slate-900">목록</h2>
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {(products ?? []).length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-500">
              등록된 상품이 없습니다. 위에서 추가해 주세요.
            </li>
          ) : (
            (products ?? []).map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {p.name}{" "}
                    <span
                      className={
                        p.active
                          ? "ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800"
                          : "ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      }
                    >
                      {p.active ? "사용" : "중지"}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600">
                    실수령 {formatKrw(p.pay_amount)} → 적립 {formatKrw(p.credit_amount)}
                  </p>
                </div>
                <form action={setPrepaidProductActiveForm}>
                  <input type="hidden" name="product_id" value={p.id} />
                  <input type="hidden" name="active" value={p.active ? "false" : "true"} />
                  <button
                    type="submit"
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    {p.active ? "중지" : "다시 사용"}
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
