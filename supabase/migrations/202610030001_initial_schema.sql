create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  profession text not null default 'Other',
  mobile text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projection_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_name text not null,
  sector text not null,
  status text not null default 'completed' check (status in ('draft', 'completed')),
  input jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projection_reports_user_updated_idx
  on public.projection_reports (user_id, updated_at desc);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  plan_id text not null check (plan_id in ('monthly', 'annual')),
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  status text not null default 'created' check (status in ('created', 'captured', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  captured_at timestamptz
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null check (plan_id in ('monthly', 'annual')),
  payment_transaction_id uuid not null unique references public.payment_transactions (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists subscriptions_user_end_idx
  on public.subscriptions (user_id, ends_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, profession)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'profession', 'Other')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        profession = excluded.profession,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projection_reports enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.subscriptions enable row level security;

create policy "Users view own profile or admins view all"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
create policy "Users insert own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

create policy "Users view own reports or admins view all"
  on public.projection_reports for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "Active subscribers create reports"
  on public.projection_reports for insert to authenticated
  with check (
    (user_id = (select auth.uid()) and exists (
      select 1 from public.subscriptions
      where subscriptions.user_id = (select auth.uid())
        and subscriptions.ends_at > now()
    ))
    or (select public.is_admin())
  );
create policy "Users update own reports"
  on public.projection_reports for update to authenticated
  using (
    (user_id = (select auth.uid()) and exists (
      select 1 from public.subscriptions
      where subscriptions.user_id = (select auth.uid())
        and subscriptions.ends_at > now()
    ))
    or (select public.is_admin())
  )
  with check (
    (user_id = (select auth.uid()) and exists (
      select 1 from public.subscriptions
      where subscriptions.user_id = (select auth.uid())
        and subscriptions.ends_at > now()
    ))
    or (select public.is_admin())
  );
create policy "Users delete own reports"
  on public.projection_reports for delete to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Users view own payments or admins view all"
  on public.payment_transactions for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Users view own subscriptions or admins view all"
  on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create or replace function public.activate_subscription_for_payment(
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_captured_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  transaction_row public.payment_transactions%rowtype;
  subscription_id uuid;
  validity_days integer;
begin
  select * into transaction_row
  from public.payment_transactions
  where razorpay_order_id = p_razorpay_order_id
  for update;

  if not found then
    raise exception 'Payment order not found';
  end if;

  validity_days := case transaction_row.plan_id when 'annual' then 365 else 30 end;

  update public.payment_transactions
  set status = 'captured',
      razorpay_payment_id = p_razorpay_payment_id,
      captured_at = coalesce(captured_at, p_captured_at)
  where id = transaction_row.id;

  insert into public.subscriptions (user_id, plan_id, payment_transaction_id, starts_at, ends_at)
  values (
    transaction_row.user_id,
    transaction_row.plan_id,
    transaction_row.id,
    p_captured_at,
    p_captured_at + make_interval(days => validity_days)
  )
  on conflict (payment_transaction_id) do update
    set plan_id = excluded.plan_id
  returning id into subscription_id;

  return subscription_id;
end;
$$;

revoke all on function public.activate_subscription_for_payment(text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.activate_subscription_for_payment(text, text, timestamptz) to service_role;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.projection_reports to authenticated;
grant select on public.payment_transactions to authenticated;
grant select on public.subscriptions to authenticated;