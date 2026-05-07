import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createCustomer } from "@/app/actions/salon";
import { crmUi } from "@/lib/crmUi";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("id, name, phone, wallet_balance, birthday")
    .order("updated_at", { ascending: false })
    .limit(100);

  const term = (q ?? "").trim();
  if (term) {
    query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%`);
  }

  const { data: customers } = await query;

  return (
    <div className={crmUi.pageWrap}>
      <div>
        <h1 className={crmUi.pageTitle}>고객</h1>
        <p className={crmUi.pageDesc}>이름·전화로 빠르게 찾습니다.</p>
      </div>

      <form className="flex flex-wrap gap-2" method="get">
        <input
          type="search"
          name="q"
          placeholder="이름 또는 전화 검색"
          defaultValue={term}
          className={`min-w-[200px] flex-1 ${crmUi.input}`}
        />
        <button type="submit" className={crmUi.btnSecondary}>
          검색
        </button>
      </form>

      <section className={crmUi.surface}>
        <h2 className={`mb-4 ${crmUi.sectionTitle}`}>신규 고객</h2>
        <form action={createCustomer} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={crmUi.label}>이름 *</label>
            <input name="name" required className={crmUi.input} />
          </div>
          <div>
            <label className={crmUi.label}>전화</label>
            <input name="phone" className={crmUi.input} />
          </div>
          <div>
            <label className={crmUi.label}>생일</label>
            <input name="birthday" type="date" className={crmUi.input} />
          </div>
          <div className="sm:col-span-2">
            <label className={crmUi.label}>메모</label>
            <textarea name="notes" rows={2} className={crmUi.input} />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className={crmUi.btnPrimary}>
              저장 후 카드로 이동
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className={`mb-3 ${crmUi.sectionTitle}`}>고객 목록</h2>
        <ul className={`${crmUi.listWrap} divide-y divide-neutral-100`}>
          {(customers ?? []).length === 0 ? (
            <li className={crmUi.listEmpty}>고객이 없습니다.</li>
          ) : (
            (customers ?? []).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/customers/${c.id}`}
                  className={`${crmUi.listRow} ${crmUi.listRowHover}`}
                >
                  <div>
                    <span className="font-semibold text-neutral-900">{c.name}</span>
                    {c.phone ? (
                      <span className="ml-2 text-sm text-neutral-500">{c.phone}</span>
                    ) : null}
                    {c.birthday ? (
                      <span className="mt-1 block text-xs text-neutral-400">
                        생일 · {c.birthday}
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <span className={`${crmUi.badgeMuted} tabular-nums`}>
                      지갑 {new Intl.NumberFormat("ko-KR").format(c.wallet_balance)}원
                    </span>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
