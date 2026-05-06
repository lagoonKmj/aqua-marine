import Link from "next/link";
import { signOut } from "@/app/actions/salon";

const links = [
  { href: "/today", label: "오늘" },
  { href: "/customers", label: "고객" },
  { href: "/appointments", label: "예약" },
  { href: "/prepaid-products", label: "선불 상품" },
];

export function DashboardNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/today" className="text-lg font-semibold text-slate-900">
            Aqua Marine
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            로그아웃
          </button>
        </form>
      </div>
    </header>
  );
}
