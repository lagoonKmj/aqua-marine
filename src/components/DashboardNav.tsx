"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/salon";

const tabs: readonly {
  href: string;
  label: string;
  Icon: ComponentType;
}[] = [
  {
    href: "/today",
    label: "오늘",
    Icon: IconToday,
  },
  {
    href: "/appointments",
    label: "예약",
    Icon: IconCalendar,
  },
  {
    href: "/customers",
    label: "고객",
    Icon: IconUsers,
  },
  {
    href: "/prepaid-products",
    label: "선불",
    Icon: IconPackage,
  },
];

function isRouteActive(pathname: string, href: string) {
  if (href === "/today") return pathname === "/today" || pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[52px] max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/today" className="flex min-w-0 items-center gap-2">
            <span className="truncate text-[17px] font-bold tracking-tight text-neutral-900">
              Aqua Marine
            </span>
            <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-600">
              CRM
            </span>
          </Link>

          <nav className="hidden flex-1 justify-center md:flex md:gap-1">
            {tabs.map(({ href, label }) => {
              const active = isRouteActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={
                    active
                      ? "rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600"
                      : "rounded-xl px-4 py-2 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                  }
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <form action={signOut} className="shrink-0">
            <button
              type="submit"
              className="rounded-xl px-3 py-2 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 md:text-sm"
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <nav
        aria-label="주요 메뉴"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-100 bg-white/95 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-1 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 px-1">
          {tabs.map(({ href, label, Icon }) => {
            const active = isRouteActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 py-1.5 text-[10px] font-semibold"
              >
                <span
                  className={
                    active
                      ? "text-brand-500"
                      : "text-neutral-400"
                  }
                >
                  <Icon />
                </span>
                <span className={active ? "text-brand-600" : "text-neutral-400"}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function IconToday() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18M8 14h4M8 18h8" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M17 14a3 3 0 013 3v1H3v-1a3 3 0 013-3h11z" />
      <circle cx="17" cy="7" r="2.25" />
    </svg>
  );
}

function IconPackage() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 4v6c0 4-3.5 7-8 7s-8-3-8-7V7l8-4z" />
      <path d="M12 12V3M4 7l8 5 8-5" />
    </svg>
  );
}
