create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_key text,
  name text not null,
  category text not null default 'other',
  plan_name text not null default '',
  note text not null default '',
  amount numeric(14, 2) not null,
  currency text not null default 'CNY',
  billing_interval_count smallint not null default 1,
  billing_interval_unit text not null default 'month',
  tracking_started_on date not null,
  renewal_anchor_on date not null,
  reminder_offsets smallint[] not null default array[0, 7]::smallint[],
  status text not null default 'active',
  archived_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_name_length check (char_length(trim(name)) between 1 and 80),
  constraint subscriptions_plan_name_length check (char_length(plan_name) <= 80),
  constraint subscriptions_note_length check (char_length(note) <= 500),
  constraint subscriptions_amount_non_negative check (amount >= 0),
  constraint subscriptions_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint subscriptions_category_valid check (category in ('ai', 'video', 'music', 'storage', 'productivity', 'other')),
  constraint subscriptions_interval_count_valid check (billing_interval_count between 1 and 3650),
  constraint subscriptions_interval_unit_valid check (billing_interval_unit in ('day', 'month', 'year')),
  constraint subscriptions_reminder_offsets_valid check (
    reminder_offsets <@ array[0, 1, 3, 7, 14, 30]::smallint[]
    and cardinality(reminder_offsets) > 0
  ),
  constraint subscriptions_status_valid check (status in ('active', 'archived')),
  constraint subscriptions_archive_state_valid check (
    (status = 'active' and archived_on is null)
    or (status = 'archived' and archived_on is not null)
  )
);

create index if not exists subscriptions_user_status_renewal_idx
on public.subscriptions using btree (user_id, status, renewal_anchor_on);

grant select, insert, update, delete on table public.subscriptions to authenticated;
grant select, insert, update, delete on table public.subscriptions to service_role;

alter table public.subscriptions enable row level security;

drop policy if exists "Users can read their own subscriptions" on public.subscriptions;
drop policy if exists "Users can create their own subscriptions" on public.subscriptions;
drop policy if exists "Users can update their own subscriptions" on public.subscriptions;
drop policy if exists "Users can delete their own subscriptions" on public.subscriptions;

create policy "Users can read their own subscriptions"
on public.subscriptions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own subscriptions"
on public.subscriptions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own subscriptions"
on public.subscriptions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own subscriptions"
on public.subscriptions
for delete
to authenticated
using ((select auth.uid()) = user_id);
