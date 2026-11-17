-- =====================================================================
-- Weekendr – initial database schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- PROFILES: one row per signed-up user (linked to Supabase Auth)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  full_name    text,
  username     text unique check (username ~ '^[a-z0-9_.]{3,30}$'),
  avatar_url   text,
  city         text,
  birth_year   int check (birth_year between 1990 and 2030),
  role         text not null default 'youth' check (role in ('youth', 'organizer')),
  interests    text[] not null default '{}',
  is_verified  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- EVENTS
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id                  uuid primary key default gen_random_uuid(),
  organizer_id        uuid references public.profiles (id) on delete set null,
  host_name           text not null,
  host_verified       boolean not null default false,
  title               text not null check (char_length(title) between 3 and 70),
  description         text check (char_length(description) <= 2000),
  categories          text[] not null default '{}'
                        check (categories <@ array['music','sports','arts','volunteer','food','workshops','meetup']),
  starts_at           timestamptz not null,
  ends_at             timestamptz,
  venue               text,
  area                text,                -- short location label, e.g. 'E1 London'
  city                text not null default 'London',
  latitude            double precision,
  longitude           double precision,
  show_exact_location boolean not null default true,
  capacity            int not null default 100 check (capacity between 1 and 10000),
  ticket_type         text not null default 'free' check (ticket_type in ('free', 'paid')),
  price_pence         int not null default 0 check (price_pence >= 0),  -- £12.00 = 1200
  currency            text not null default 'GBP',
  age_group           text not null default 'all' check (age_group in ('all', '16-18', '18-24')),
  verified_host_onsite boolean not null default true,
  safe_space_accepted boolean not null default false,
  image_url           text,
  perk                text,                -- e.g. 'Free Slices 🍕'
  is_featured         boolean not null default false,
  status              text not null default 'published' check (status in ('draft', 'published', 'cancelled')),
  rsvp_count          int not null default 0,   -- kept up to date automatically by a trigger
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint ends_after_start check (ends_at is null or ends_at > starts_at),
  constraint price_matches_ticket check (
    (ticket_type = 'free' and price_pence = 0) or (ticket_type = 'paid' and price_pence > 0)
  )
);

create index if not exists events_starts_at_idx  on public.events (starts_at);
create index if not exists events_city_idx       on public.events (city);
create index if not exists events_organizer_idx  on public.events (organizer_id);
create index if not exists events_categories_idx on public.events using gin (categories);

-- ---------------------------------------------------------------------
-- RSVPS: who is going to which event
-- ---------------------------------------------------------------------
create table if not exists public.rsvps (
  event_id    uuid not null references public.events (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  checked_in  boolean not null default false,
  primary key (event_id, user_id)
);
create index if not exists rsvps_user_idx on public.rsvps (user_id);

-- ---------------------------------------------------------------------
-- SAVED EVENTS: the heart / bookmark button
-- ---------------------------------------------------------------------
create table if not exists public.saved_events (
  event_id    uuid not null references public.events (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (event_id, user_id)
);
create index if not exists saved_events_user_idx on public.saved_events (user_id);

-- =====================================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================================

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();

-- Create a profile automatically whenever someone signs up.
-- Role/name can be passed in the sign-up "options.data" metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    case when new.raw_user_meta_data ->> 'role' = 'organizer' then 'organizer' else 'youth' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep events.rsvp_count in sync and refuse RSVPs once an event is full.
create or replace function public.handle_rsvp_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  ev public.events%rowtype;
begin
  if tg_op = 'INSERT' then
    select * into ev from public.events where id = new.event_id for update;
    if ev.status <> 'published' then
      raise exception 'This event is not open for RSVPs';
    end if;
    if ev.rsvp_count >= ev.capacity then
      raise exception 'This event is full';
    end if;
    update public.events set rsvp_count = rsvp_count + 1 where id = new.event_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.events set rsvp_count = greatest(rsvp_count - 1, 0) where id = old.event_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists rsvps_count on public.rsvps;
create trigger rsvps_count after insert or delete on public.rsvps
  for each row execute function public.handle_rsvp_change();

-- Stop users from making themselves "verified" or editing the RSVP counter directly.
create or replace function public.protect_system_columns()
returns trigger language plpgsql as $$
begin
  -- Requests from the dashboard / service role are allowed to change anything.
  if coalesce(auth.role(), 'service_role') = 'service_role' or current_user = 'postgres' then
    return new;
  end if;
  if tg_table_name = 'profiles' then
    new.is_verified := old.is_verified;
  elsif tg_table_name = 'events' then
    new.rsvp_count  := old.rsvp_count;
    new.host_verified := old.host_verified;
    new.is_featured := old.is_featured;
    new.organizer_id := old.organizer_id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_system_columns();

drop trigger if exists events_protect on public.events;
create trigger events_protect before update on public.events
  for each row execute function public.protect_system_columns();

-- On insert, organizers can't mark their own events verified/featured or fake a count.
create or replace function public.sanitize_new_event()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.role(), 'service_role') = 'service_role' then
    return new;
  end if;
  new.organizer_id  := auth.uid();
  new.rsvp_count    := 0;
  new.is_featured   := false;
  new.host_verified := coalesce((select is_verified from public.profiles where id = auth.uid()), false);
  return new;
end;
$$;

drop trigger if exists events_sanitize on public.events;
create trigger events_sanitize before insert on public.events
  for each row execute function public.sanitize_new_event();

-- =====================================================================
-- ROW LEVEL SECURITY (who can read / write what)
-- =====================================================================
alter table public.profiles     enable row level security;
alter table public.events       enable row level security;
alter table public.rsvps        enable row level security;
alter table public.saved_events enable row level security;

-- Profiles: anyone can view public profile info; you can only edit your own.
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Events: everyone sees published events; organizers also see their own drafts.
drop policy if exists "Published events are public" on public.events;
create policy "Published events are public" on public.events
  for select using (status = 'published' or organizer_id = auth.uid());

drop policy if exists "Organizers create events" on public.events;
create policy "Organizers create events" on public.events
  for insert to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'organizer')
  );

drop policy if exists "Organizers update own events" on public.events;
create policy "Organizers update own events" on public.events
  for update to authenticated
  using (organizer_id = auth.uid()) with check (organizer_id = auth.uid());

drop policy if exists "Organizers delete own events" on public.events;
create policy "Organizers delete own events" on public.events
  for delete to authenticated using (organizer_id = auth.uid());

-- RSVPs: you manage your own; organizers can see who RSVP'd to their events.
drop policy if exists "Users see own RSVPs" on public.rsvps;
create policy "Users see own RSVPs" on public.rsvps
  for select to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid())
  );

drop policy if exists "Users RSVP for themselves" on public.rsvps;
create policy "Users RSVP for themselves" on public.rsvps
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users cancel own RSVP" on public.rsvps;
create policy "Users cancel own RSVP" on public.rsvps
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "Organizers check in attendees" on public.rsvps;
create policy "Organizers check in attendees" on public.rsvps
  for update to authenticated using (
    exists (select 1 from public.events e where e.id = event_id and e.organizer_id = auth.uid())
  );

-- Saved events: completely private to each user.
drop policy if exists "Users manage own saved events" on public.saved_events;
create policy "Users manage own saved events" on public.saved_events
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Organizers may only flip the check-in flag on an RSVP, nothing else.
revoke update on public.rsvps from anon, authenticated;
grant update (checked_in) on public.rsvps to authenticated;
