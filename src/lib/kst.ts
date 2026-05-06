/** 서울 당일 [start, end) 를 UTC ISO 문자열로 반환 */
export function seoulDayRangeIso(now = new Date()): { start: string; end: string } {
  const tz = "Asia/Seoul";
  const ymd = new Intl.DateTimeFormat("sv-SE", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const start = new Date(`${ymd}T00:00:00+09:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}
