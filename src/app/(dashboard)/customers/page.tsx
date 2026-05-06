import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createCustomer } from "@/app/actions/salon";

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">고객</h1>
        <p className="text-sm text-slate-600">이름·전화로 검색합니다.</p>
      </div>

      <form className="flex flex-wrap gap-2" method="get">
        <input
          type="search"
          name="q"
          placeholder="검색"
          defaultValue={term}
          className="min-w-[200px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-slate-900"
        />
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
        >
          검색
        </button>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 font-medium text-slate-900">신규 고객</h2>
        <form action={createCustomer} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-slate-600">이름 *</label>
            <input
              name="name"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">전화</label>
            <input name="phone" className="w-full rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-600">생일</label>
            <input
              name="birthday"
              type="date"
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm text-slate-600">메모</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              저장 후 카드로 이동
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-medium text-slate-900">목록</h2>
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {(customers ?? []).length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-500">고객이 없습니다.</li>
          ) : (
            (customers ?? []).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/customers/${c.id}`}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-medium text-slate-900">{c.name}</span>
                    {c.phone ? (
                      <span className="ml-2 text-sm text-slate-500">{c.phone}</span>
                    ) : null}
                    {c.birthday ? (
                      <span className="ml-2 text-xs text-slate-400">
                        생일 {c.birthday}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-slate-600">
                    지갑 {new Intl.NumberFormat("ko-KR").format(c.wallet_balance)}원
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
