import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCustomer } from "@/app/actions/salon";
import { formatKrw } from "@/lib/money";
import { WalletTopupForm } from "@/components/WalletTopupForm";
import { StartVisitForm } from "@/components/StartVisitForm";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !customer) notFound();

  const { data: products } = await supabase
    .from("prepaid_products")
    .select("id, name, pay_amount, credit_amount")
    .eq("active", true)
    .order("pay_amount");

  const { data: visits } = await supabase
    .from("visits")
    .select("id, visited_at, status")
    .eq("customer_id", id)
    .order("visited_at", { ascending: false })
    .limit(30);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{customer.name}</h1>
          <p className="text-sm text-slate-600">
            지갑 잔액{" "}
            <span className="font-medium text-slate-900">
              {formatKrw(customer.wallet_balance)}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StartVisitForm customerId={id} />
          <Link
            href="/customers"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            목록
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 font-medium text-slate-900">프로필</h2>
          <form action={updateCustomer} className="space-y-3">
            <input type="hidden" name="customer_id" value={id} />
            <div>
              <label className="mb-1 block text-sm text-slate-600">이름</label>
              <input
                name="name"
                required
                defaultValue={customer.name}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">전화</label>
              <input
                name="phone"
                defaultValue={customer.phone ?? ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">생일</label>
              <input
                name="birthday"
                type="date"
                defaultValue={customer.birthday ?? ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-600">메모</label>
              <textarea
                name="notes"
                rows={4}
                defaultValue={customer.notes ?? ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              저장
            </button>
          </form>
        </section>

        <WalletTopupForm customerId={id} products={products ?? []} />
      </div>

      <section>
        <h2 className="mb-3 font-medium text-slate-900">최근 방문</h2>
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {(visits ?? []).length === 0 ? (
            <li className="px-4 py-6 text-sm text-slate-500">방문 기록이 없습니다.</li>
          ) : (
            (visits ?? []).map((v) => (
              <li key={v.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-slate-600">
                    {new Date(v.visited_at).toLocaleString("ko-KR")}
                  </p>
                  <p className="text-xs text-slate-400">{v.status}</p>
                </div>
                <Link
                  href={`/visits/${v.id}`}
                  className="text-sm font-medium text-slate-900 underline"
                >
                  열기
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
