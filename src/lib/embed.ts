/** Supabase embed가 객체 또는 단일 FK 배열로 올 때 한 건만 꺼냄 */
export function embedOne<T>(row: T | T[] | null | undefined): T | null {
  if (row == null) return null;
  return Array.isArray(row) ? (row[0] ?? null) : row;
}
