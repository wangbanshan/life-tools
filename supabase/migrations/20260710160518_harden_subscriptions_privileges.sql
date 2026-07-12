revoke all privileges on table public.subscriptions from anon;
revoke truncate, references, trigger on table public.subscriptions from authenticated;

grant select, insert, update, delete on table public.subscriptions to authenticated;
