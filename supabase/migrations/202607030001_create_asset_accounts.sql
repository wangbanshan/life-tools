create table if not exists public.asset_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type_id text not null,
  name text not null,
  note text not null default '',
  balance numeric(14, 2) not null default 0,
  currency text not null default 'CNY',
  include_in_total boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint asset_accounts_name_length check (char_length(trim(name)) between 1 and 80),
  constraint asset_accounts_balance_non_negative check (balance >= 0),
  constraint asset_accounts_currency_cny check (currency = 'CNY')
);

create index if not exists asset_accounts_user_id_idx
on public.asset_accounts using btree (user_id);

create index if not exists asset_accounts_user_sort_idx
on public.asset_accounts using btree (user_id, sort_order, created_at desc);

grant select, insert, update, delete on table public.asset_accounts to authenticated;
grant select, insert, update, delete on table public.asset_accounts to service_role;

alter table public.asset_accounts enable row level security;

drop policy if exists "Users can read their own asset accounts" on public.asset_accounts;
drop policy if exists "Users can create their own asset accounts" on public.asset_accounts;
drop policy if exists "Users can update their own asset accounts" on public.asset_accounts;
drop policy if exists "Users can delete their own asset accounts" on public.asset_accounts;

create policy "Users can read their own asset accounts"
on public.asset_accounts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own asset accounts"
on public.asset_accounts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own asset accounts"
on public.asset_accounts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own asset accounts"
on public.asset_accounts
for delete
to authenticated
using ((select auth.uid()) = user_id);
