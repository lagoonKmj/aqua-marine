import { createClient } from "@/lib/supabase/server";
import {
  createPrepaidProduct,
  setPrepaidProductActiveForm,
} from "@/app/actions/salon";
import { formatKrw } from "@/lib/money";
import { crmUi } from "@/lib/crmUi";

export default async function PrepaidProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("prepaid_products")
    .select("*")
    .order("pay_amount");

  return (
    <div className={crmUi.pageWrap}>
      <div>
        <h1 className={crmUi.pageTitle}>선불 상품</h1>
        <p className={crmUi.pageDesc}>
          실수령과 지갑 적립 금액을 묶음으로 등록합니다. 예: 30만 실수령 → 33만 적립
        </p>
      </div>

      <section className={crmUi.surface}>
        <h2 className={`mb-4 ${crmUi.sectionTitle}`}>상품 추가</h2>
        <form action={createPrepaidProduct} className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className={crmUi.label}>상품명</label>
            <input
              name="name"
              required
              placeholder="예: 정기 패키지 A"
              className={crmUi.input}
            />
          </div>
          <div>
            <label className={crmUi.label}>실수령 (원)</label>
            <input
              name="pay_amount"
              type="number"
              min={10000}
              step={10000}
              required
              className={crmUi.input}
            />
          </div>
          <div>
            <label className={crmUi.label}>적립 (원)</label>
            <input
              name="credit_amount"
              type="number"
              min={10000}
              step={10000}
              required
              className={crmUi.input}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className={`w-full ${crmUi.btnPrimary}`}>
              등록
            </button>
          </div>
        </form>
        <p className={`mt-3 ${crmUi.sectionDesc}`}>1만 원 단위만 입력 · 예시 200000</p>
      </section>

      <section>
        <h2 className={`mb-3 ${crmUi.sectionTitle}`}>목록</h2>
        <ul className={`${crmUi.listWrap} divide-y divide-neutral-100`}>
          {(products ?? []).length === 0 ? (
            <li className={crmUi.listEmpty}>등록된 상품이 없습니다. 위에서 추가해 주세요.</li>
          ) : (
            (products ?? []).map((p) => (
              <li
                key={p.id}
                className={`${crmUi.listRow} ${crmUi.listRowHover}`}
              >
                <div>
                  <p className="font-semibold text-neutral-900">{p.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      className={
                        p.active
                          ? "inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                          : crmUi.badgeMuted
                      }
                    >
                      {p.active ? "사용 중" : "중지"}
                    </span>
                    <span className="text-sm text-neutral-600">
                      실수령 {formatKrw(p.pay_amount)} → 적립 {formatKrw(p.credit_amount)}
                    </span>
                  </div>
                </div>
                <form action={setPrepaidProductActiveForm}>
                  <input type="hidden" name="product_id" value={p.id} />
                  <input type="hidden" name="active" value={p.active ? "false" : "true"} />
                  <button type="submit" className={crmUi.btnSecondarySm}>
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
