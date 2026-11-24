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

---

## Part 3 – "Continue with Google" and "Continue with GitHub"

The buttons appear on `/login` and `/signup` automatically once a provider is switched on in Supabase
(the app re-checks every 5 minutes). Until then they're hidden, so nothing breaks.

### 0. Update the database (once)
In **SQL Editor**, run [`migrations/0002_oauth_profiles.sql`](migrations/0002_oauth_profiles.sql).
It makes new Google/GitHub accounts get the right name and photo.

### 1. Find your Supabase callback URL
**Authentication → Sign In / Providers → Google** (or GitHub). The panel shows a **Callback URL**, like
`https://<your-project-ref>.supabase.co/auth/v1/callback`. Copy it – both Google and GitHub need it.

### 2. Google
1. Go to https://console.cloud.google.com and create (or pick) a project.
2. Open **Google Auth Platform** (search for "OAuth consent screen" if you can't find it).
   - **Branding**: app name "Weekendr", your support email, then save.
   - **Audience**: user type **External**.
   - **Clients → Create client** → type **Web application**:
     - **Authorized JavaScript origins**: `https://your-app.vercel.app`
     - **Authorized redirect URIs**: the Supabase **Callback URL** from step 1
   - Copy the **Client ID** and **Client secret**.
3. In Supabase: **Authentication → Sign In / Providers → Google** → turn on, paste the Client ID and
   secret → **Save**.
4. Back in Google: **Audience → Publish app**. While the app is in "Testing", only the test users you list
   there can log in.

### 3. GitHub
1. Go to https://github.com/settings/developers → **OAuth Apps** → **New OAuth App**.
   - **Homepage URL**: `https://your-app.vercel.app`
   - **Authorization callback URL**: the Supabase **Callback URL** from step 1
2. Click **Register application**, then **Generate a new client secret**. Copy the **Client ID** and the secret
   (GitHub only shows the secret once).
3. In Supabase: **Authentication → Sign In / Providers → GitHub** → turn on, paste both → **Save**.

### How it behaves
- On `/signup`, choosing **Hosting events** before clicking Google/GitHub makes a *new* account an organizer.
  Existing accounts are never changed this way (they can use **Become an organizer** on the profile page).
- If someone already has an email/password account and then uses Google with the same (verified) email,
  Supabase links them to the same account.
- Cancelling on the Google/GitHub screen brings people back to `/login` with a friendly message.

---

## Part 4 – Creating events (cover photos)

Organizers can now publish events and save drafts from `/create-event`.
For cover-photo uploads, run [`migrations/0003_event_images.sql`](migrations/0003_event_images.sql) once in
**SQL Editor**. It creates a public **event-images** storage bucket (5 MB max, JPG/PNG/WebP) where only
organizers can upload, each into their own folder. Check it under **Storage** afterwards.

Without this step everything else works, but photo uploads fail with "Upload failed".

### Optional: support email
Add `NEXT_PUBLIC_SUPPORT_EMAIL` (e.g. `hello@yourdomain.com`) in Vercel → Settings → Environment Variables
and redeploy. It shows a **Contact** button on the organizer dashboard and a report address on `/guidelines`.

---

## Troubleshooting: "I never got the confirmation email"

1. **Check spam / promotions.** Supabase's built-in emails often land there.
2. **Use "Resend confirmation email"** – it appears on the sign-up success screen and when you try to log
   in with an unconfirmed account.
3. **Check the logs:** Supabase → **Logs → Auth**. "email rate limit exceeded" means the built-in sender's
   hourly limit (only a few emails per hour) was hit – wait an hour, or set up your own SMTP (below).
4. **Check URL settings:** Authentication → URL Configuration → Site URL must be your Vercel address
   (see Part 2), otherwise the link in the email points to the wrong place.
5. **Confirm an account by hand** (for yourself / testers): SQL Editor →
   ```sql
   update auth.users set email_confirmed_at = now() where email = 'person@example.com';
   ```
6. **While testing**, you can turn off **Confirm email** (Authentication → Sign In / Providers → Email)
   so new accounts can log in straight away. Turn it back on before launch.

**Before real users sign up**, add your own email provider (e.g. Resend, Postmark, SendGrid) under
**Project Settings → Authentication → SMTP Settings**. It removes the tiny hourly limit and makes emails far
less likely to go to spam.

---

## Demo data (synthetic)

To fill the app with realistic test data, run [`demo_data.sql`](demo_data.sql) in **SQL Editor**:

- 8 demo organizers and 250 demo youth members (`demo-…@example.com`, no password – they can't log in)
- 24 London events over this weekend and the next three, across every category: free and paid, featured,
  age-restricted, almost full, sold out, hidden addresses, plus one draft
- ~900 RSVPs and ~300 saved events from the demo members, so "going" counts are real

Re-run it any time (e.g. weekly) to move the events to the current weekends – it replaces the previous demo
data. RSVPs that real users made to demo events are removed when it re-runs.
To remove all demo data, run [`remove_demo_data.sql`](remove_demo_data.sql). Real users and events are never touched.

---

## Google Maps (venue search, maps, distances)

What it adds: venue suggestions as organizers type on `/create-event` (fills in the map pin and area),
a map + **Get directions** on event pages, and **Near me** distances on Home.
Without a key, the app still works: plain venue box, no maps (Get directions still works).

### 1. Google Cloud
1. Go to https://console.cloud.google.com and pick your project (the one you used for Google log-in is fine).
2. **Billing**: Google Maps needs a billing account linked to the project, even for the free monthly usage.
   Then set a safety limit: **Billing → Budgets & alerts → Create budget** (e.g. £10/month with email alerts).
3. **APIs & Services → Library** – search for and **Enable** each of:
   - **Maps JavaScript API**
   - **Places API (New)**
   - **Maps Embed API**
4. **APIs & Services → Credentials → Create credentials → API key**. Then click the new key to edit it:
   - **Application restrictions → Websites**, add: `https://your-app.vercel.app/*` and `http://localhost:3000/*`
   - **API restrictions → Restrict key** → tick the three APIs above → **Save**

   The key is visible in the browser by design – these restrictions are what stop others using it.
5. Optional: **APIs & Services → Places API (New) → Quotas** – set a daily cap on autocomplete requests.

### 2. Vercel
**Settings → Environment Variables** → add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = your key (all environments),
then **Deployments → ⋯ → Redeploy**. (The key is built into the app, so a redeploy is required.)

### 3. Demo data
Re-run [`demo_data.sql`](demo_data.sql) so the demo events get map pins.

### Costs
The embedded maps (Maps Embed API) are free. Venue suggestions (Places API) are billed per search session
after a free monthly allowance – check Google's current Maps Platform pricing page, and keep the budget alert on.
