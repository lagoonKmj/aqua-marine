-- aqua-marine: 피부·두피 샵 CRM MVP 스키마
-- Supabase SQL Editor 또는 CLI로 적용

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- tables
-- ---------------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  birthday date,
  notes text,
  wallet_balance bigint not null default 0 check (wallet_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prepaid_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pay_amount bigint not null check (pay_amount > 0),
  credit_amount bigint not null check (credit_amount > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  starts_at timestamptz not null,
  notes text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  visited_at timestamptz not null default now(),
  status text not null default 'open' check (status in ('open', 'completed')),
  created_at timestamptz not null default now()
);

create table public.treatment_lines (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits(id) on delete cascade,
  description text not null,
  amount bigint not null check (amount >= 0),
  payment_method text not null
    check (payment_method in ('wallet', 'cash', 'card', 'transfer')),
  created_at timestamptz not null default now()
);

create table public.wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  kind text not null check (kind in ('topup', 'spend')),
  credits_added bigint,
  cash_received bigint,
  income_method text check (income_method is null or income_method in ('cash', 'card', 'transfer')),
  prepaid_product_id uuid references public.prepaid_products(id),
  spend_amount bigint,
  treatment_line_id uuid references public.treatment_lines(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint wallet_ledger_topup_chk check (
    kind <> 'topup'
    or (
      credits_added is not null
      and credits_added > 0
      and prepaid_product_id is not null
      and cash_received is not null
      and cash_received > 0
      and income_method is not null
    )
  ),
  constraint wallet_ledger_spend_chk check (
    kind <> 'spend'
    or (
      spend_amount is not null
      and spend_amount > 0
      and treatment_line_id is not null
    )
  )
);

create table public.treatment_photos (
  id uuid primary key default gen_random_uuid(),
  treatment_line_id uuid not null references public.treatment_lines(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index idx_customers_phone on public.customers (phone);
create index idx_appointments_starts on public.appointments (starts_at);
create index idx_visits_customer on public.visits (customer_id, visited_at desc);
create index idx_treatment_lines_visit on public.treatment_lines (visit_id);

-- ---------------------------------------------------------------------------
-- RPC: 선불 충전
-- ---------------------------------------------------------------------------

create or replace function public.wallet_topup(
  p_customer_id uuid,
  p_product_id uuid,
  p_income_method text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pay bigint;
  v_credit bigint;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if p_income_method not in ('cash', 'card', 'transfer') then
    raise exception 'invalid_income_method';
  end if;

  select pay_amount, credit_amount
    into v_pay, v_credit
  from prepaid_products
  where id = p_product_id and active = true;

  if v_pay is null then
    raise exception 'product_not_found';
  end if;

  update customers
    set wallet_balance = wallet_balance + v_credit,
        updated_at = now()
  where id = p_customer_id;

  if not found then
    raise exception 'customer_not_found';
  end if;

  insert into wallet_ledger (
    customer_id, kind, credits_added, cash_received, income_method, prepaid_product_id
  ) values (
    p_customer_id, 'topup', v_credit, v_pay, p_income_method, p_product_id
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: 시술 라인 추가 (지갑 시 잔액 검사 + 원장)
-- ---------------------------------------------------------------------------

create or replace function public.add_treatment_line(
  p_visit_id uuid,
  p_description text,
  p_amount bigint,
  p_payment_method text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_line_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if p_payment_method not in ('wallet', 'cash', 'card', 'transfer') then
    raise exception 'invalid_payment_method';
  end if;

  if p_amount < 0 then
    raise exception 'invalid_amount';
  end if;

  select customer_id into v_customer_id
  from visits
  where id = p_visit_id;

  if v_customer_id is null then
    raise exception 'visit_not_found';
  end if;

  if p_payment_method = 'wallet' and p_amount > 0 then
    update customers
      set wallet_balance = wallet_balance - p_amount,
          updated_at = now()
    where id = v_customer_id
      and wallet_balance >= p_amount;

    if not found then
      raise exception 'insufficient_wallet';
    end if;
  end if;

  insert into treatment_lines (visit_id, description, amount, payment_method)
  values (p_visit_id, p_description, p_amount, p_payment_method)
  returning id into v_line_id;

  if p_payment_method = 'wallet' and p_amount > 0 then
    insert into wallet_ledger (
      customer_id, kind, spend_amount, treatment_line_id
    ) values (
      v_customer_id, 'spend', p_amount, v_line_id
    );
  end if;

  return v_line_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: 방문 시작
-- ---------------------------------------------------------------------------

create or replace function public.start_visit(
  p_customer_id uuid,
  p_appointment_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  insert into visits (customer_id, appointment_id)
  values (p_customer_id, p_appointment_id)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.wallet_topup(uuid, uuid, text) to authenticated;
grant execute on function public.add_treatment_line(uuid, text, bigint, text) to authenticated;
grant execute on function public.start_visit(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.customers enable row level security;
alter table public.prepaid_products enable row level security;
alter table public.appointments enable row level security;
alter table public.visits enable row level security;
alter table public.treatment_lines enable row level security;
alter table public.wallet_ledger enable row level security;
alter table public.treatment_photos enable row level security;

create policy "auth_all_customers"
  on public.customers for all to authenticated using (true) with check (true);

create policy "auth_all_prepaid_products"
  on public.prepaid_products for all to authenticated using (true) with check (true);

create policy "auth_all_appointments"
  on public.appointments for all to authenticated using (true) with check (true);

create policy "auth_all_visits"
  on public.visits for all to authenticated using (true) with check (true);

create policy "auth_all_treatment_lines"
  on public.treatment_lines for all to authenticated using (true) with check (true);

create policy "auth_all_wallet_ledger"
  on public.wallet_ledger for all to authenticated using (true) with check (true);

create policy "auth_all_treatment_photos"
  on public.treatment_photos for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Storage: 대시보드에서 버킷 `treatment-photos`(비공개) 생성 후 아래 정책 적용
-- ---------------------------------------------------------------------------

create policy "auth_read_treatment_photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'treatment-photos');

create policy "auth_insert_treatment_photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'treatment-photos');

create policy "auth_update_treatment_photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'treatment-photos');

create policy "auth_delete_treatment_photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'treatment-photos');
