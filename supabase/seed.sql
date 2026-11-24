-- =====================================================================
-- Weekendr – sample events (optional)
-- Superseded by demo_data.sql, which has many more events, users and RSVPs.
-- Run AFTER 0001_init.sql to see the Home feed populated.
-- Dates are placed on the coming Saturday so they always show as "this weekend".
-- Safe to re-run: existing sample events are replaced.
-- =====================================================================
delete from public.events where organizer_id is null and host_name in
  ('SubGround Sound', 'Hackney Hoops Collective', 'Canal Guardians', 'Darkroom Collective');

with sat as (
  -- The coming Saturday (today if today is Saturday), at midnight London time
  select ((current_date + ((6 - extract(isodow from current_date)::int + 7) % 7))::timestamp
          at time zone 'Europe/London') as d
)
insert into public.events
  (host_name, host_verified, title, description, categories, starts_at, ends_at, venue, area,
   capacity, ticket_type, price_pence, age_group, safe_space_accepted, image_url, perk,
   is_featured, rsvp_count)
select v.host_name, v.host_verified, v.title, v.description, v.categories,
       sat.d + v.starts, sat.d + v.ends, v.venue, v.area,
       v.capacity, v.ticket_type, v.price_pence, v.age_group, true, v.image_url, v.perk,
       v.is_featured, v.rsvp_count
from sat, (values
  ('SubGround Sound', true, 'Warehouse Indie & Electronic Night',
   'Student bands and DJs in a converted Hackney warehouse. Under-18 friendly, no alcohol served.',
   array['music'], interval '21 hours', interval '23 hours 30 minutes',
   'Warehouse 9, Hackney Wick', 'E1 London', 167, 'paid', 1200, 'all',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAuvFzkr2owLVW9PwiQC09HFaENHFR0pog4T-MtkOtT7GAt7nG0o9_-es6JhOQLF-x0dww_nWotzdCZbWaiVnYnEWWUNpTK1685Yomlncc91jqDA3-a-_E_Q0ICgG2MzWBBOLRqPB_PvhIPfwt48floxDjA3AvUuDCORZjLJNy9r9mMLaoG5z_sasB_qmADT_nOM35W5-FbGeGtEqLiP-XSELBB9wP8C7DxxiFqDsu0',
   null, true, 142),
  ('Hackney Hoops Collective', true, 'Sunset 3v3 Street Basketball Tournament',
   'Showcase your squad or join solo. DJ set, hydration station & prizes.',
   array['sports'], interval '14 hours', interval '18 hours',
   'London Fields Courts', 'E8 London', 96, 'free', 0, 'all',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuCn3T7KDlAfvniF_UEsUw8XRTC05RkuB1DYlbRA3GIZej09FBhdNHBELRYsjmhDHE4gkORmfIO-D0xvs7OBJl7s5JFULiWfkD5zrGox9uYeUHwEVf4uVDaUVeldlMpLtkNKg_uA9iD9Ea2ALJjimhkLIzBZAPwcQF_sfPZYuj4Zxk1EM_0bmnCBTcAw3pnTzpnFQ0uAzrQ3wDPITz-TBbjYjzfq7GW9CCe0y9dpURMN',
   null, false, 64),
  ('Canal Guardians', false, 'Canal Clean-Up & Pizza Picnic',
   'Protect Hackney''s water birds, pick litter with new mates, then demolish sourdough wood-fired pizza.',
   array['volunteer', 'food'], interval '11 hours', interval '14 hours',
   'Regent''s Canal, Broadway Market', 'E8 London', 60, 'free', 0, 'all',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuB-p0jfy722Hz6L02eQ6PT1fmky6hzRPeiYUA0vR7l34JMnDJXRNucpvUvr3b8u0-8jMB5ulejSvZBVxRvs4lrm6Dw3LrNKu2LFu9KxpGP_5Oq14OuhsvI4RicEkSKZI1Z8gtGtRcXrYpc2_p8fqDs3eJQ9NM-ur1xM5k467yPMallJ-kKJ7EX5Z9OujHkzV5xzKN4ktpEuO9V28CaI52QsxGUMd-3qFqhLo7nBT-Ca',
   'Free Slices 🍕', false, 45),
  ('Darkroom Collective', false, 'Analog Film Photography & Zine Workshop',
   'Bring your prints or negatives. Free paper stock, photocopiers & riso color drums included.',
   array['arts', 'workshops'], interval '15 hours 30 minutes', interval '18 hours',
   'Darkroom Studio, Dalston', 'E8 London', 28, 'paid', 500, '16-18',
   'https://lh3.googleusercontent.com/aida-public/AB6AXuAhIrFlAEv5_XoIaNHyhdLDChVBzs-jsUZNyepFx27PxMYU52_8GSHUCDIaiiaOOO6S5sYwpcZCXTlxVqVZyij4Dx3z5dKn2LQwytrfYbClLNBlX06I8mQ-6VB-4lC0FqZcXe3OJQeeDYpHz6RAI4OVGuc6m8NxeXqBhQ7_PtK2pUa5ei6qPWZV5W5KAmsFP3dX6KcL03vchu9_vTAasPKsokbYVBEYIcH9Qx6yf7ri',
   null, false, 24)
) as v(host_name, host_verified, title, description, categories, starts, ends, venue, area,
       capacity, ticket_type, price_pence, age_group, image_url, perk, is_featured, rsvp_count);
