-- Deployment template, not applied to a live database in this release.
-- Run against a dedicated Poçitel Supabase project after its privacy/setup gate.
begin;
create table public.customer_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null check (
    jsonb_typeof(preferences) = 'object'
    and preferences ?& array['drink','milk','syrup','serving']
    and (preferences - array['drink','milk','syrup','serving']::text[]) = '{}'::jsonb
    and preferences->>'drink' in ('cappuccino','latte','americano','iced-latte','iced-americano','tea')
    and preferences->>'milk' in ('standard','oat','almond')
    and preferences->>'syrup' in ('none','vanilla','caramel','hazelnut','coconut')
    and preferences->>'serving' in ('cafe','takeaway')
    and jsonb_typeof(preferences->'drink') = 'string'
    and jsonb_typeof(preferences->'milk') = 'string'
    and jsonb_typeof(preferences->'syrup') = 'string'
    and jsonb_typeof(preferences->'serving') = 'string'
  ),
  updated_at timestamptz not null default now()
);
alter table public.customer_preferences enable row level security;
revoke all on public.customer_preferences from anon, public;
grant select,insert,update,delete on public.customer_preferences to authenticated;
create policy own_preferences_select on public.customer_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy own_preferences_insert on public.customer_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy own_preferences_update on public.customer_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_preferences_delete on public.customer_preferences for delete to authenticated using ((select auth.uid()) = user_id);
commit;
