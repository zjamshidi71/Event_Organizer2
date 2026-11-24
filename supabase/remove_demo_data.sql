-- =====================================================================
-- Weekendr – remove all DEMO DATA created by demo_data.sql
-- Run in Supabase: SQL Editor → New query → paste → Run
-- Only touches accounts tagged app_metadata.demo = true (and their events,
-- RSVPs and saved events). Real users and events are not affected.
-- =====================================================================
begin;

delete from public.events
where organizer_id in (select id from auth.users where raw_app_meta_data ->> 'demo' = 'true');

-- Deleting the accounts also deletes their profiles, RSVPs and saved events.
delete from auth.users where raw_app_meta_data ->> 'demo' = 'true';

commit;

select count(*) as demo_accounts_left from auth.users where raw_app_meta_data ->> 'demo' = 'true';
