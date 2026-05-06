import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-xl font-semibold text-slate-900">
          Aqua Marine CRM
        </h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          관리자 로그인
        </p>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-slate-500">
          계정은 Supabase 대시보드에서 생성합니다.{" "}
          <Link href="/" className="underline">
            홈
          </Link>
        </p>
      </div>
    </div>
  );
}
