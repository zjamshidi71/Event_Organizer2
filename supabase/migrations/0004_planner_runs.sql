-- =====================================================================
-- Weekendr – AI Weekend Planner usage log (used for rate limiting)
-- Run once in Supabase: SQL Editor → New query → paste → Run. Safe to run again.
-- =====================================================================
create table if not exists public.planner_runs (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  status      text not null default 'started' check (status in ('started', 'succeeded', 'failed')),
  tokens      int
);
create index if not exists planner_runs_user_time_idx on public.planner_runs (user_id, created_at desc);

alter table public.planner_runs enable row level security;

-- Users can log and see only their own runs. No delete policy, so the log can't be wiped to dodge the limit.
drop policy if exists "Users read own planner runs" on public.planner_runs;
create policy "Users read own planner runs" on public.planner_runs
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Users log own planner runs" on public.planner_runs;
create policy "Users log own planner runs" on public.planner_runs
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "Users finish own planner runs" on public.planner_runs;
create policy "Users finish own planner runs" on public.planner_runs
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Only the outcome columns can be changed (not who or when).
revoke update on public.planner_runs from anon, authenticated;
grant update (status, tokens) on public.planner_runs to authenticated;
