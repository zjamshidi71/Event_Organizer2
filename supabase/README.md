# Backend setup (Supabase)

## Part 1 – Database

This connects the app to a Supabase database. It takes about 10 minutes.

## 1. Create a Supabase project
1. Sign in at https://supabase.com/dashboard and click **New project**.
2. Pick a name (e.g. `weekendr`), set a database password (save it somewhere safe),
   and choose the region closest to your users (e.g. *West EU (London)*).
3. Wait a minute or two for the project to finish setting up.

## 2. Create the database tables
1. In the project, open **SQL Editor** → **New query**.
2. Paste the whole contents of [`migrations/0001_init.sql`](migrations/0001_init.sql) and click **Run**.
   You should see "Success. No rows returned".
3. Optional, but recommended for now: open another new query, paste
   [`seed.sql`](seed.sql) and click **Run**. This adds the 4 sample events from the design.
4. Check **Table Editor**: you should see `profiles`, `events`, `rsvps` and `saved_events`.

## 3. Copy the connection keys into Vercel
1. In Supabase, click **Connect** at the top of the dashboard → **App Frameworks** → **Next.js**.
   Copy the values for `NEXT_PUBLIC_SUPABASE_URL` and the publishable (or anon) key.
2. In Vercel, open your project → **Settings** → **Environment Variables** and add:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` (or the long `eyJ…` anon key) |

   Tick **Production**, **Preview** and **Development** for both.
3. Go to **Deployments** → latest deployment → **⋯** → **Redeploy**.
   (Environment variable changes only take effect after a redeploy.)

> Only use the **publishable / anon** key. Never put the **secret / service_role** key into a
> `NEXT_PUBLIC_…` variable – it bypasses all security rules.

## 4. Check that it works
Open `https://<your-vercel-domain>/api/health`. You should see:

```json
{"ok":true,"message":"Connected to Supabase","publishedEvents":4}
```

If `ok` is `false`, the `message` tells you which part to fix.

## Running locally (optional)
```bash
cp .env.example .env.local   # then fill in the two values
npm run dev
```

## What the database contains
- **profiles** – one per user; created automatically on sign-up. Role is `youth` or `organizer`.
- **events** – everything on the Create Event form. Prices are stored in pence (`1200` = £12).
- **rsvps** – who is going. `events.rsvp_count` updates automatically, and RSVPs are refused once an event is full.
- **saved_events** – the ♥ button, private to each user.

Security rules (Row Level Security) mean: anyone can browse published events; only organizers can
create events and only edit their own; users can only RSVP/save for themselves; nobody can make
themselves "verified" or edit the attendee counter.

---

## Part 2 – Log-in (email & password)

The app's sign-up, log-in, log-out and password-reset pages use Supabase Auth.
Do these once in the Supabase dashboard:

### 1. Tell Supabase your site's address
**Authentication → URL Configuration**
- **Site URL**: your Vercel address, e.g. `https://your-app.vercel.app`
- **Redirect URLs** → *Add URL*, add both:
  - `https://your-app.vercel.app/**`
  - `http://localhost:3000/**` (for local development)

Without this, the links in confirmation and password-reset emails won't come back to your app.
If you use Vercel preview deployments, also add `https://*-your-vercel-team.vercel.app/**`.

### 2. Check the email provider is on
**Authentication → Sign In / Providers → Email**: enabled (the default), and
**Confirm email** on (recommended – users must click a link before they can log in).
For quicker testing you can turn *Confirm email* off: sign-up then logs people in straight away.

### 3. (Recommended) Make email links work on any device
By default, a confirmation link only works if it's opened in the same browser the person signed up in.
To make it work everywhere, go to **Authentication → Emails → Templates** and change the link in:

- **Confirm signup**:
  `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/home">Confirm your email</a>`
- **Reset password**:
  `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Reset your password</a>`

### 4. Email sending limits
Supabase's built-in email service only sends a few emails per hour and is meant for testing.
Before launching to real users, add your own email provider under
**Project Settings → Authentication → SMTP Settings** (e.g. Resend, Postmark, SendGrid).

### How it works in the app
| Page | What it does |
| --- | --- |
| `/signup` | Name, email, password, and "going to" or "hosting" events (sets the role) |
| `/login` | Email + password; returns you to the page you were trying to open |
| `/forgot-password` → email → `/reset-password` | Choose a new password |
| `/profile` | Your details, become an organizer, change password, log out |

Logged-out visitors are sent to `/login` from `/profile`, `/my-weekend`, `/create-event` and `/organizer`.
`/create-event` and `/organizer` are for organizer accounts only.
