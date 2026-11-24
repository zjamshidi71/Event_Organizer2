-- =====================================================================
-- Weekendr – DEMO DATA (synthetic)
--
-- Fills the app with realistic fake data for testing and demos:
--   • 8 demo organizers and 250 demo youth members (they cannot log in)
--   • 24 London events over this weekend and the next three (+1 draft)
--   • RSVPs and saved events from the demo members (counts are real)
--
-- Run in Supabase: SQL Editor → New query → paste → Run
-- (after migrations 0001–0003).
--
-- Re-running is safe: it deletes the previous demo data first and creates
-- fresh events dated from the current weekend – run it weekly to keep the
-- Home feed full. To remove everything, run remove_demo_data.sql.
--
-- All demo accounts use @example.com addresses and are tagged
-- app_metadata.demo = true. Your real users and events are never touched.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. Remove the previous demo data
-- ---------------------------------------------------------------------
delete from public.events
where organizer_id in (
  select id from auth.users where raw_app_meta_data ->> 'demo' = 'true'
);
delete from auth.users where raw_app_meta_data ->> 'demo' = 'true';

-- Also remove the 4 older sample events from seed.sql (the demo includes them), to avoid duplicates.
delete from public.events
where organizer_id is null
  and host_name in ('SubGround Sound', 'Hackney Hoops Collective', 'Canal Guardians', 'Darkroom Collective');

-- Same random choices every run, so the demo looks the same each week.
select setseed(0.42);

-- ---------------------------------------------------------------------
-- 2. Demo accounts (profiles are created automatically by the sign-up trigger)
-- ---------------------------------------------------------------------
create temporary table demo_organizers (n int primary key, name text, username text, verified boolean, interests text[]) on commit drop;
insert into demo_organizers values
  (1, 'SubGround Sound',          'subground.sound',  true,  array['music']),
  (2, 'Hackney Hoops Collective', 'hackney.hoops',    true,  array['sports']),
  (3, 'Canal Guardians',          'canal.guardians',  false, array['volunteer']),
  (4, 'Darkroom Collective',      'darkroom.collective', false, array['arts','workshops']),
  (5, 'Peckham Plates',           'peckham.plates',   true,  array['food']),
  (6, 'Code & Chill London',      'code.and.chill',   false, array['workshops','meetup']),
  (7, 'South Bank Skate Club',    'southbank.skate',  false, array['sports','arts']),
  (8, 'Open Verse Collective',    'open.verse',       true,  array['arts','music']);

create temporary table demo_users (id uuid primary key, kind text, n int, full_name text, username text) on commit drop;

insert into demo_users (id, kind, n, full_name, username)
select gen_random_uuid(), 'organizer', n, name, username from demo_organizers;

insert into demo_users (id, kind, n, full_name, username)
select gen_random_uuid(), 'youth', g,
       f.name || ' ' || l.letter || '.',
       lower(f.name) || '.' || lower(l.letter) || g
from generate_series(1, 250) g
cross join lateral (
  select (array['Aisha','Ben','Chloe','Dev','Ella','Femi','Grace','Hamza','Isla','Jay','Kemi','Leo','Maya',
                'Nia','Omar','Priya','Quinn','Ravi','Sofia','Theo','Uma','Vik','Willow','Xander','Yara','Zane',
                'Amara','Callum','Deji','Esme','Finn','Hana','Ibrahim','Jade','Kai','Lola','Mo','Noor','Ollie','Rosa'])[1 + (g * 7) % 40] as name
) f
cross join lateral (select chr(65 + (g * 11) % 26) as letter) l;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated',
  format('demo-%s-%s@example.com', u.kind, lpad(u.n::text, 3, '0')),
  '',  -- no password: demo accounts can't be logged into
  now(),
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email'), 'demo', true),
  jsonb_build_object('full_name', u.full_name, 'role', case when u.kind = 'organizer' then 'organizer' else 'youth' end),
  now() - (random() * interval '120 days'), now(),
  '', '', '', '', '', '', '', ''
from demo_users u;

-- Fill in profile details
update public.profiles p
set username = u.username,
    city = 'London',
    is_verified = coalesce(o.verified, false),
    interests = coalesce(o.interests, (
      select array_agg(c) from unnest(array['music','sports','arts','volunteer','food','workshops','meetup']) c
      where random() < 0.35 and u.id is not null  -- mentions u.id so it's re-run for each person
    ), '{}'),
    birth_year = case when u.kind = 'youth' then 2002 + floor(random() * 9)::int end
from demo_users u
left join demo_organizers o on u.kind = 'organizer' and o.n = u.n
where p.id = u.id;

-- ---------------------------------------------------------------------
-- 3. Events
--    Dates are relative to "this weekend" (the coming Fri–Sun, or the
--    current one if today is Fri/Sat/Sun), in London time.
-- ---------------------------------------------------------------------
create temporary table demo_weekend on commit drop as
with today as (select (now() at time zone 'Europe/London')::date as d),
     dow as (select d, (extract(isodow from d)::int - 5 + 7) % 7 as since_fri from today)
select case when since_fri <= 2 then d - since_fri else d + (7 - since_fri) end as friday from dow;

insert into public.events (
  organizer_id, host_name, host_verified, title, description, categories,
  starts_at, ends_at, venue, area, city, show_exact_location,
  capacity, ticket_type, price_pence, age_group,
  verified_host_onsite, safe_space_accepted, image_url, perk, is_featured, status, rsvp_count
)
select
  du.id, o.name, o.verified, e.title, e.description, e.categories,
  ((w.friday + e.week * 7 + e.day_offset) + e.start_time) at time zone 'Europe/London',
  ((w.friday + e.week * 7 + e.day_offset) + e.start_time + e.duration) at time zone 'Europe/London',
  e.venue, e.area, 'London', e.exact_location,
  e.capacity, case when e.price_pence > 0 then 'paid' else 'free' end, e.price_pence, e.age_group,
  true, true, e.image_url, e.perk, e.featured, e.status, 0
from demo_weekend w
cross join (values
  -- week, day (0 Fri,1 Sat,2 Sun), start, duration, organizer, title, description, categories, venue, area, exact?, capacity, price (pence), age, image, perk, featured, status
  -- ── This weekend ──
  (0, 0, time '19:00', interval '3 hours', 8, 'Open Verse: Poetry & Open Mic', 'Bring a poem, a song or just your ears. Five-minute slots, sign up on the door. Hot chocolate on us.', array['arts','music'], 'The Book Club, Shoreditch', 'Shoreditch, EC2', true, 60, 0, 'all', null, 'Free hot choc ☕', false, 'published'),
  (0, 0, time '20:00', interval '4 hours', 1, 'Bedroom DJs Showcase', 'Six young DJs play their first proper club sets. Alcohol-free bar, under-18s welcome until 23:00.', array['music'], 'Corsica Studios', 'Elephant & Castle, SE17', true, 200, 800, 'all', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR9TQosdNSIUg_Deajys6zfnMMonX_yAIWHcOXKQHpAfhS1FfPPcIPQXswViQRahi_xhc3hdjFIWdz7X7hPghwKUZsATUvy3D258-78HIysdZdpQPgkalQaMG6o4IODn-TiCEXKHoDEYCVMYWFtsxCbTyJ_QRlxTauZE-oa2BeIjpah0AhPAZIH7FZExyrd6KE1Mv6nKltKDYoBQr4iM1Xs_Zdln7sKWidPuKoVQV2', null, false, 'published'),
  (0, 1, time '11:00', interval '3 hours', 3, 'Canal Clean-Up & Pizza Picnic', 'Protect Hackney''s water birds, pick litter with new mates, then demolish sourdough wood-fired pizza. Gloves and grabbers provided.', array['volunteer','food'], 'Regent''s Canal, Broadway Market', 'Hackney, E8', true, 60, 0, 'all', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-p0jfy722Hz6L02eQ6PT1fmky6hzRPeiYUA0vR7l34JMnDJXRNucpvUvr3b8u0-8jMB5ulejSvZBVxRvs4lrm6Dw3LrNKu2LFu9KxpGP_5Oq14OuhsvI4RicEkSKZI1Z8gtGtRcXrYpc2_p8fqDs3eJQ9NM-ur1xM5k467yPMallJ-kKJ7EX5Z9OujHkzV5xzKN4ktpEuO9V28CaI52QsxGUMd-3qFqhLo7nBT-Ca', 'Free Slices 🍕', false, 'published'),
  (0, 1, time '14:00', interval '4 hours', 2, 'Sunset 3v3 Street Basketball', 'Showcase your squad or join solo – we''ll match you up. DJ set, hydration station & prizes for the top three teams.', array['sports'], 'London Fields Courts', 'Hackney, E8', true, 96, 0, 'all', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn3T7KDlAfvniF_UEsUw8XRTC05RkuB1DYlbRA3GIZej09FBhdNHBELRYsjmhDHE4gkORmfIO-D0xvs7OBJl7s5JFULiWfkD5zrGox9uYeUHwEVf4uVDaUVeldlMpLtkNKg_uA9iD9Ea2ALJjimhkLIzBZAPwcQF_sfPZYuj4Zxk1EM_0bmnCBTcAw3pnTzpnFQ0uAzrQ3wDPITz-TBbjYjzfq7GW9CCe0y9dpURMN', null, false, 'published'),
  (0, 1, time '15:30', interval '150 minutes', 4, 'Analog Film & Zine Workshop', 'Bring your prints or negatives. Free paper stock, photocopiers & riso colour drums included. Leave with your own zine.', array['arts','workshops'], 'Darkroom Studio, Dalston', 'Dalston, E8', true, 28, 500, '16-18', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhIrFlAEv5_XoIaNHyhdLDChVBzs-jsUZNyepFx27PxMYU52_8GSHUCDIaiiaOOO6S5sYwpcZCXTlxVqVZyij4Dx3z5dKn2LQwytrfYbClLNBlX06I8mQ-6VB-4lC0FqZcXe3OJQeeDYpHz6RAI4OVGuc6m8NxeXqBhQ7_PtK2pUa5ei6qPWZV5W5KAmsFP3dX6KcL03vchu9_vTAasPKsokbYVBEYIcH9Qx6yf7ri', null, false, 'published'),
  (0, 1, time '21:00', interval '150 minutes', 1, 'Warehouse Indie & Electronic Night', 'Student bands and DJs in a converted Hackney Wick warehouse. No alcohol served, free water all night.', array['music'], 'Warehouse 9, Hackney Wick', 'Hackney Wick, E9', true, 167, 1200, 'all', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuvFzkr2owLVW9PwiQC09HFaENHFR0pog4T-MtkOtT7GAt7nG0o9_-es6JhOQLF-x0dww_nWotzdCZbWaiVnYnEWWUNpTK1685Yomlncc91jqDA3-a-_E_Q0ICgG2MzWBBOLRqPB_PvhIPfwt48floxDjA3AvUuDCORZjLJNy9r9mMLaoG5z_sasB_qmADT_nOM35W5-FbGeGtEqLiP-XSELBB9wP8C7DxxiFqDsu0', null, true, 'published'),
  (0, 2, time '12:00', interval '3 hours', 5, 'Peckham Street Food Takeover', 'Young chefs from our kitchen programme run the stalls. Every dish £3, veggie and halal options at every stall.', array['food'], 'Bussey Building Rooftop', 'Peckham, SE15', true, 250, 0, 'all', null, '£3 dishes', false, 'published'),
  (0, 2, time '16:00', interval '2 hours', 6, 'Build Your First Website', 'Zero to a live website in two hours. No experience needed – laptops provided, mentors on every table.', array['workshops','meetup'], 'The Workshop Space, Aldgate', 'Aldgate, E1', true, 30, 0, '16-18', null, 'Laptops provided 💻', false, 'published'),
  -- ── Next weekend ──
  (1, 0, time '18:30', interval '2 hours', 7, 'Friday Night Skate Jam', 'All levels, all boards. Beginners'' corner with free coaching for the first hour. Helmets available to borrow.', array['sports'], 'Southbank Undercroft', 'South Bank, SE1', true, 80, 0, 'all', null, null, false, 'published'),
  (1, 1, time '10:00', interval '3 hours', 3, 'Community Garden Build', 'Help build raised beds and plant winter veg in a hidden central London garden. Lunch included.', array['volunteer'], 'Phoenix Garden, Covent Garden', 'Covent Garden, WC2', true, 40, 0, 'all', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-p0jfy722Hz6L02eQ6PT1fmky6hzRPeiYUA0vR7l34JMnDJXRNucpvUvr3b8u0-8jMB5ulejSvZBVxRvs4lrm6Dw3LrNKu2LFu9KxpGP_5Oq14OuhsvI4RicEkSKZI1Z8gtGtRcXrYpc2_p8fqDs3eJQ9NM-ur1xM5k467yPMallJ-kKJ7EX5Z9OujHkzV5xzKN4ktpEuO9V28CaI52QsxGUMd-3qFqhLo7nBT-Ca', 'Lunch included 🥪', false, 'published'),
  (1, 1, time '13:00', interval '3 hours', 6, 'Game Jam: 3 Hours, 1 Game', 'Team up and make a playable game in three hours. Prizes for the weirdest idea. Bring a laptop if you have one.', array['workshops','meetup'], 'The Workshop Space, Aldgate', 'Aldgate, E1', true, 50, 0, '16-18', null, null, false, 'published'),
  (1, 1, time '19:30', interval '3 hours', 1, 'Youth DJ Beginner Workshop', 'Learn beatmatching and build your first mix on pro decks, then play it to the room.', array['music','workshops'], 'SubGround Studio', 'Bermondsey, SE16', true, 30, 1000, '16-18', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg9myeYJBlT5rnNwYZs0OoWEc6SkeiAk_rUYA44WqSeGP9QaEnf72MCP0NFSImnJ4YDet2gLujtXVTr2d_zT88xDDrfX2tJVmh4nKqVO6GyCdgPuDPVSQSe1ep0leC37I3G2r3LP5vGql4CIatf0SDM-fv8maF35EZi-FJiy8961QxqnogX38kvaJ3nMw5Wws2-6IUrZ1SI-gXjS0OsWzWlvgFYir7zlgNQU3idBWT', null, false, 'published'),
  (1, 1, time '20:00', interval '4 hours', 8, 'Afrobeats & Amapiano Dance Night', 'Live percussion, guest dancers and a dance-off at midnight. 18+, bring ID.', array['music'], 'Rich Mix', 'Shoreditch, E1', true, 180, 1000, '18-24', null, null, true, 'published'),
  (1, 2, time '11:00', interval '2 hours', 2, '5-a-side Football Drop-in', 'Turn up, get put on a team, play. Bibs and balls provided.', array['sports'], 'Haggerston Park Pitches', 'Hoxton, E2', true, 40, 0, 'all', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn3T7KDlAfvniF_UEsUw8XRTC05RkuB1DYlbRA3GIZej09FBhdNHBELRYsjmhDHE4gkORmfIO-D0xvs7OBJl7s5JFULiWfkD5zrGox9uYeUHwEVf4uVDaUVeldlMpLtkNKg_uA9iD9Ea2ALJjimhkLIzBZAPwcQF_sfPZYuj4Zxk1EM_0bmnCBTcAw3pnTzpnFQ0uAzrQ3wDPITz-TBbjYjzfq7GW9CCe0y9dpURMN', null, false, 'published'),
  (1, 2, time '14:00', interval '3 hours', 5, 'Dumpling Making Class', 'Fold, steam and eat. Small group class in our community kitchen – address sent to attendees.', array['food','workshops'], 'Peckham Plates Kitchen, 14 Rye Lane', 'Peckham, SE15', false, 20, 1500, 'all', null, 'Take-home box 🥟', false, 'published'),
  -- ── In two weeks ──
  (2, 0, time '19:00', interval '3 hours', 4, 'Late-Night Life Drawing', 'Relaxed life drawing with music. Materials provided. 18+.', array['arts'], 'Darkroom Studio, Dalston', 'Dalston, E8', true, 25, 400, '18-24', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhIrFlAEv5_XoIaNHyhdLDChVBzs-jsUZNyepFx27PxMYU52_8GSHUCDIaiiaOOO6S5sYwpcZCXTlxVqVZyij4Dx3z5dKn2LQwytrfYbClLNBlX06I8mQ-6VB-4lC0FqZcXe3OJQeeDYpHz6RAI4OVGuc6m8NxeXqBhQ7_PtK2pUa5ei6qPWZV5W5KAmsFP3dX6KcL03vchu9_vTAasPKsokbYVBEYIcH9Qx6yf7ri', null, false, 'published'),
  (2, 1, time '12:00', interval '4 hours', 7, 'Skate & Paint: Mural Day', 'Help paint a new mural for the skate park, then skate it. Paint and brushes provided.', array['arts','sports'], 'Southbank Undercroft', 'South Bank, SE1', true, 60, 0, 'all', null, null, false, 'published'),
  (2, 1, time '18:00', interval '4 hours', 8, 'Battle of the Bands: Heats', 'Eight under-21 bands, two go through to the final. Audience vote counts.', array['music'], 'The Water Rats, King''s Cross', 'King''s Cross, WC1', true, 120, 600, 'all', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR9TQosdNSIUg_Deajys6zfnMMonX_yAIWHcOXKQHpAfhS1FfPPcIPQXswViQRahi_xhc3hdjFIWdz7X7hPghwKUZsATUvy3D258-78HIysdZdpQPgkalQaMG6o4IODn-TiCEXKHoDEYCVMYWFtsxCbTyJ_QRlxTauZE-oa2BeIjpah0AhPAZIH7FZExyrd6KE1Mv6nKltKDYoBQr4iM1Xs_Zdln7sKWidPuKoVQV2', null, false, 'published'),
  (2, 2, time '10:00', interval '3 hours', 3, 'Food Bank Sorting Shift', 'Sort and pack donations for local families. Counts towards volunteering hours – we''ll sign your form.', array['volunteer'], 'Hackney Foodbank Warehouse', 'Hackney, E8', false, 25, 0, 'all', null, null, false, 'published'),
  (2, 2, time '15:00', interval '2 hours', 6, 'Board Games & Bubble Tea', 'Hundreds of games, friendly hosts who''ll teach you the rules. First bubble tea free.', array['meetup','food'], 'Draughts Waterloo', 'Waterloo, SE1', true, 40, 300, 'all', null, 'Free bubble tea 🧋', false, 'published'),
  -- ── In three weeks ──
  (3, 1, time '13:00', interval '4 hours', 2, 'Winter 3v3 Tournament', 'Indoor tournament with a live DJ, refs and trophies. Register as a team of 3–4.', array['sports'], 'Copper Box Arena', 'Stratford, E20', true, 128, 500, 'all', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn3T7KDlAfvniF_UEsUw8XRTC05RkuB1DYlbRA3GIZej09FBhdNHBELRYsjmhDHE4gkORmfIO-D0xvs7OBJl7s5JFULiWfkD5zrGox9uYeUHwEVf4uVDaUVeldlMpLtkNKg_uA9iD9Ea2ALJjimhkLIzBZAPwcQF_sfPZYuj4Zxk1EM_0bmnCBTcAw3pnTzpnFQ0uAzrQ3wDPITz-TBbjYjzfq7GW9CCe0y9dpURMN', null, true, 'published'),
  (3, 1, time '19:00', interval '3 hours', 1, 'Lo-fi Listening Party', 'Beanbags, low lights and a new lo-fi album played front to back. Phones away.', array['music','meetup'], 'SubGround Studio', 'Bermondsey, SE16', true, 50, 0, 'all', null, null, false, 'published'),
  (3, 2, time '12:00', interval '4 hours', 5, 'Winter Street Feast', 'Our biggest market of the year: 20 young chefs, live music and a hot-chocolate bar.', array['food','music'], 'Bussey Building Rooftop', 'Peckham, SE15', true, 300, 0, 'all', null, 'Hot choc bar ☕', false, 'published'),
  (3, 2, time '18:00', interval '2 hours', 4, 'Photo Walk: Night Lights', 'Draft – route still being planned.', array['arts'], 'Meet at Tate Modern', 'Bankside, SE1', true, 20, 0, 'all', null, null, false, 'draft')
) as e(week, day_offset, start_time, duration, org, title, description, categories, venue, area, exact_location, capacity, price_pence, age_group, image_url, perk, featured, status)
join demo_organizers o on o.n = e.org
join demo_users du on du.kind = 'organizer' and du.n = e.org;

-- Map pins (approximate) so maps and "x mi away" distances work.
update public.events e
set latitude = c.lat, longitude = c.lng
from (values
  ('The Book Club, Shoreditch',            51.5246, -0.0830),
  ('Corsica Studios',                      51.4940, -0.0985),
  ('Regent''s Canal, Broadway Market',      51.5365, -0.0619),
  ('London Fields Courts',                 51.5418, -0.0605),
  ('Darkroom Studio, Dalston',             51.5462, -0.0754),
  ('Warehouse 9, Hackney Wick',            51.5434, -0.0244),
  ('Bussey Building Rooftop',              51.4693, -0.0688),
  ('The Workshop Space, Aldgate',          51.5142, -0.0755),
  ('Southbank Undercroft',                 51.5069, -0.1167),
  ('Phoenix Garden, Covent Garden',        51.5144, -0.1285),
  ('SubGround Studio',                     51.4980, -0.0640),
  ('Rich Mix',                             51.5238, -0.0727),
  ('Haggerston Park Pitches',              51.5320, -0.0670),
  ('Peckham Plates Kitchen, 14 Rye Lane',  51.4720, -0.0690),
  ('The Water Rats, King''s Cross',         51.5302, -0.1187),
  ('Hackney Foodbank Warehouse',           51.5450, -0.0550),
  ('Draughts Waterloo',                    51.5021, -0.1146),
  ('Copper Box Arena',                     51.5446, -0.0201),
  ('Meet at Tate Modern',                  51.5076, -0.0994)
) as c(venue, lat, lng)
where e.venue = c.venue
  and e.organizer_id in (select id from demo_users where kind = 'organizer');

-- ---------------------------------------------------------------------
-- 4. RSVPs – how full each event is (sold out, almost full, quiet…).
--    The RSVP trigger keeps events.rsvp_count correct.
-- ---------------------------------------------------------------------
create temporary table demo_fill (title text primary key, fill numeric) on commit drop;
insert into demo_fill values
  ('Open Verse: Poetry & Open Mic', 0.70), ('Bedroom DJs Showcase', 0.55), ('Canal Clean-Up & Pizza Picnic', 0.75),
  ('Sunset 3v3 Street Basketball', 0.67), ('Analog Film & Zine Workshop', 0.86), ('Warehouse Indie & Electronic Night', 0.85),
  ('Peckham Street Food Takeover', 0.45), ('Build Your First Website', 1.00), ('Friday Night Skate Jam', 0.40),
  ('Community Garden Build', 0.30), ('Game Jam: 3 Hours, 1 Game', 0.60), ('Youth DJ Beginner Workshop', 0.94),
  ('Afrobeats & Amapiano Dance Night', 0.50), ('5-a-side Football Drop-in', 0.50), ('Dumpling Making Class', 0.45),
  ('Late-Night Life Drawing', 0.30), ('Skate & Paint: Mural Day', 0.20), ('Battle of the Bands: Heats', 0.35),
  ('Food Bank Sorting Shift', 0.60), ('Board Games & Bubble Tea', 0.25), ('Winter 3v3 Tournament', 0.15),
  ('Lo-fi Listening Party', 0.10), ('Winter Street Feast', 0.05);

insert into public.rsvps (event_id, user_id, created_at)
select ev.id, pick.id, now() - random() * interval '14 days'
from public.events ev
join demo_fill f on f.title = ev.title
join demo_users org on org.id = ev.organizer_id
cross join lateral (
  select u.id from demo_users u
  where u.kind = 'youth'
    and (ev.age_group <> '18-24' or u.id in (select id from public.profiles where birth_year <= extract(year from now())::int - 18))
    and (ev.age_group <> '16-18' or u.id in (select id from public.profiles where birth_year >  extract(year from now())::int - 19))
  order by random()
  limit least(round(ev.capacity * f.fill)::int, ev.capacity)
) pick
where ev.status = 'published';

-- Some saved (♥) events
insert into public.saved_events (event_id, user_id)
select ev.id, u.id
from public.events ev
join demo_users org on org.id = ev.organizer_id
cross join demo_users u
where u.kind = 'youth' and ev.status = 'published' and random() < 0.06
on conflict do nothing;

commit;

-- Summary
select
  (select count(*) from auth.users where raw_app_meta_data ->> 'demo' = 'true' and email like 'demo-organizer-%') as demo_organizers,
  (select count(*) from auth.users where raw_app_meta_data ->> 'demo' = 'true' and email like 'demo-youth-%')     as demo_youth,
  (select count(*) from public.events where organizer_id in (select id from auth.users where raw_app_meta_data ->> 'demo' = 'true')) as demo_events,
  (select count(*) from public.rsvps where user_id in (select id from auth.users where raw_app_meta_data ->> 'demo' = 'true')) as demo_rsvps,
  (select count(*) from public.saved_events where user_id in (select id from auth.users where raw_app_meta_data ->> 'demo' = 'true')) as demo_saves;
