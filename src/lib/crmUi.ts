/**
 * 뷰티샵 원장용 CRM 톤 — 라운드 카드·핑크 포인트·부드러운 면 UI
 * (타사 앱과 동일한 자산/레이아웃 복제가 아닌, 유사한 UX 패턴용)
 */
export const crmUi = {
  pageWrap: "space-y-6",
  pageTitle: "text-2xl font-bold tracking-tight text-neutral-900",
  pageDesc: "text-sm text-neutral-500",
  sectionTitle: "text-base font-semibold tracking-tight text-neutral-900",
  sectionDesc: "text-xs text-neutral-500",

  surface: "rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]",
  surfacePad: "rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]",

  listWrap: "overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]",
  listRow:
    "flex flex-col gap-2 px-4 py-3.5 transition sm:flex-row sm:items-center sm:justify-between",
  listRowHover: "hover:bg-neutral-50/90",
  listEmpty: "px-4 py-10 text-center text-sm text-neutral-500",

  input:
    "w-full rounded-xl border-0 bg-neutral-100 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:bg-white focus:ring-2 focus:ring-brand-500/30 focus:outline-none",
  label: "mb-1.5 block text-xs font-medium text-neutral-500",

  btnPrimary:
    "inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-45",
  btnPrimarySm:
    "inline-flex items-center justify-center rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-45",
  btnSecondary:
    "inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-45",
  btnSecondarySm:
    "inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50",

  badge:
    "inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-600",
  badgeMuted: "inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600",
  badgeWarn:
    "inline-flex rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-950",

  linkSubtle: "text-sm font-medium text-brand-600 underline-offset-4 hover:underline",
  hintBox: "rounded-2xl bg-brand-50/60 p-4 text-sm text-neutral-600 ring-1 ring-brand-500/10",
} as const;
