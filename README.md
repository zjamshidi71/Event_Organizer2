# Weekendr – Youth Events App

A Next.js 14 (App Router) + Tailwind CSS app for discovering and organizing youth events.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000 (it redirects to `/home`).

## Deploying to Vercel

The Next.js app lives at the repository root, so no extra configuration is needed:

1. Import this repository in Vercel.
2. Framework preset: **Next.js** (auto-detected). Leave **Root Directory** empty (`./`).
3. Leave Build / Install commands at their defaults (`npm install`, `next build`).

## Backend

The app uses [Supabase](https://supabase.com) for its database and log-in (email & password, Google and GitHub). Setup steps: [`supabase/README.md`](supabase/README.md).

## Project structure

- `src/app` – pages (`/home`, `/organizer`, `/create-event`, `/search`, `/my-weekend`, `/profile`)
- `src/components` – shared UI (top bar, bottom nav)
- `src/lib/supabase` – database connection helpers
- `supabase/` – database schema (`migrations/`) and sample data (`seed.sql`)
- `stitch_weekendr_youth_events_app/` – original design mockups (HTML + screenshots), not part of the build
