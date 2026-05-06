# Aqua Marine CRM

피부·두피 케어 샵용 **웹 CRM MVP** (Next.js + Supabase).

## 기능

- 관리자 로그인 (Supabase Auth)
- 고객 CRUD, 검색, **선불 지갑** 충전(등록 상품)
- 예약 등록·상태(취소/완료)
- **오늘** 예약·방문 요약
- 방문(Visit) → 시술 라인(금액·**단일 결제 수단**) → **시술 사진 업로드**(모바일 촬영)
- 선불 상품 카탈로그 관리

## 사전 준비

1. [Supabase](https://supabase.com) 프로젝트 생성
2. 대시보드 **Storage**에서 버킷 `treatment-photos`를 **비공개(Private)** 로 먼저 생성  
3. SQL Editor에서 `supabase/migrations/20260506143000_init_salon_crm.sql` 전체 실행  
   - 파일 하단 `storage.objects` 정책은 버킷이 있어야 적용됩니다.
4. **Authentication → Users**에서 관리자 이메일·비밀번호로 사용자 1명 생성  
5. 프로젝트 루트에 `.env.local` 생성 (`.env.local.example` 참고)

```bash
cp .env.local.example .env.local
# 값 채우기
```

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) → 로그인.

## 배포 (Vercel)

- Vercel에 Git 연동 후 환경 변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
- Supabase Auth URL에 배포 도메인(Vercel URL)을 Site URL / Redirect URLs에 추가

## 설계 문서

- `docs/superpowers/specs/2026-05-06-salon-crm-web-mvp-design.md`

## 스택

- Next.js 15 (App Router), TypeScript, Tailwind CSS 4
- Supabase (PostgreSQL, Auth, Row Level Security, Storage)
