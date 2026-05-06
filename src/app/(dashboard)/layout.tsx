import { DashboardNav } from "@/components/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardNav />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </>
  );
}
