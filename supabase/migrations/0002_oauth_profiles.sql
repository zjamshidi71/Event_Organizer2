-- =====================================================================
-- Weekendr – support Google & GitHub log-in
-- Run once in Supabase: SQL Editor → New query → paste → Run
-- (after 0001_init.sql). Safe to run again.
-- =====================================================================

-- Google sends "full_name"/"name" and "avatar_url"/"picture";
-- GitHub sends "name" (may be empty), "user_name" and "avatar_url".
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(
      nullif(meta ->> 'full_name', ''),
      nullif(meta ->> 'name', ''),
      nullif(meta ->> 'user_name', ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(nullif(meta ->> 'avatar_url', ''), nullif(meta ->> 'picture', '')),
    case when meta ->> 'role' = 'organizer' then 'organizer' else 'youth' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
