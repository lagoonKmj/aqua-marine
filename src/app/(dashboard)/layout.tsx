import { DashboardNav } from "@/components/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardNav />
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-4 md:pb-8">{children}</main>
    </>
  );
}
