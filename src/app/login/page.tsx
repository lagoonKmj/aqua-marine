import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px] overflow-hidden rounded-[1.75rem] bg-white p-9 shadow-[0_24px_60px_-20px_rgba(244,63,124,0.18)] ring-1 ring-black/[0.05]">
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold tracking-wide text-brand-600">
            CRM for beauty
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">
            Aqua Marine
          </h1>
          <p className="mt-1 text-sm text-neutral-500">원장님 화면 · 관리자 로그인</p>
        </div>
        <LoginForm />
        <p className="mt-8 text-center text-xs leading-relaxed text-neutral-500">
          계정은 Supabase 대시보드에서 생성합니다.{" "}
          <Link href="/today" className="font-semibold text-brand-600 underline-offset-4 hover:underline">
            바로 시작
          </Link>
        </p>
      </div>
    </div>
  );
}
