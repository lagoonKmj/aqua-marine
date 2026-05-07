"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { crmUi } from "@/lib/crmUi";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    // 배포 환경에서 클라이언트 세션 쿠키가 서버/미들웨어에 반영되기 전에
    // client router 전환만 하면 /today에서 다시 /login으로 튕길 수 있음 → 전체 이동으로 동기화
    window.location.assign("/today");
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <div>
        <label className={crmUi.label}>이메일</label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={crmUi.input}
        />
      </div>
      <div>
        <label className={crmUi.label}>비밀번호</label>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={crmUi.input}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className={`${crmUi.btnPrimary} w-full py-3 text-base`}
      >
        {loading ? "로그인 중…" : "로그인"}
      </button>
    </form>
  );
}
