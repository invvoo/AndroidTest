# Boba App 🧋

A Letterboxd for boba — log drinks, rate and review them, keep a want-to-try
list, and (later) find people out for boba nearby. See [`CLAUDE.md`](./CLAUDE.md)
for the product spec, hard rules, and build order.

Stack: **Next.js** (App Router) + **TypeScript** + **Tailwind** + **Supabase**
(Postgres / Auth / RLS, PostGIS enabled).

## What's built so far

Build steps 1–4 from `CLAUDE.md`:

1. **Auth + profiles + onboarding** — email/password sign in & sign up, session
   refresh in middleware, a route to create your profile (username, display
   name, home city, bio).
2. **Shop & drink catalog + search + seed** — browse shops, view a shop's menu
   and locations, and search drinks/shops by name. Verified (chain) drinks are
   badged; the seed script hand-seeds the major chains.
3. **Log a drink** — each drink has a detail page (derived rating + recent
   logs); from there a log form captures a half-star rating, review, drink
   date, sugar/ice/toppings/price customization, optional location, and a
   photo uploaded to Supabase Storage. Server actions only, no client form
   library. Re-logging the same drink is flagged automatically.
4. **Profile** (`/u/[username]`, public) — header, live stats (logs, unique
   drinks/shops, avg rating computed straight from `logs`), a reverse-chron
   log feed, and a boba-history map (Leaflet + OpenStreetMap) pinning the
   storefronts you logged. `/profile` redirects to your own.

Steps 5+ (want-to-try, matching, block/report/phone, PWA) are not built yet.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a Supabase project, then copy the env template and fill it in:
   ```
   cp .env.local.example .env.local
   ```
   Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API.

3. Apply the schema and seed data.

   **Local (Supabase CLI):** `supabase db reset` runs the migrations in
   `supabase/migrations/` then `supabase/seed.sql`.

   **Hosted project:** push migrations with `supabase db push`, then run
   `supabase/seed.sql` against the database (SQL editor or
   `psql "$DATABASE_URL" -f supabase/seed.sql`).

4. Regenerate DB types after linking (do this after every migration):
   ```
   supabase gen types typescript --linked > src/types/db.ts
   ```
   > `src/types/db.ts` currently holds a hand-shaped placeholder so the app
   > compiles before a project is linked. Overwrite it with the generated file.

5. Add your app URL to Supabase Auth → URL Configuration → Redirect URLs,
   including `<origin>/auth/callback`.

6. Run the dev server:
   ```
   npm run dev
   ```

## Commands

```
npm run dev        # start the dev server
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Layout

```
src/
  app/
    _components/            # site header, search box (shared, colocated)
    (auth)/login/           # sign in / sign up (server actions)
    (onboarding)/onboarding/# profile creation
    auth/callback/          # email-confirmation / OAuth code exchange
    shops/                  # catalog list + [slug] detail + drink/shop cards
    drinks/[id]/            # drink detail + logs; [id]/log/ is the log form
    u/[username]/           # public profile: stats, log feed, boba map
    profile/                # redirect to the current user's profile
    search/                 # cross-catalog search
  lib/
    supabase/               # server, browser, and middleware clients (@supabase/ssr)
    profile.ts              # current user + profile helper
    catalog.ts              # catalog queries (server-side)
    logs.ts                 # drink + log queries, profile stats/feed/map
  types/db.ts               # generated DB types (placeholder until linked)
supabase/
  migrations/               # 0001 schema, 0002 policies, 0003 storage, 0004 map view
  seed.sql                  # hand-seeded verified chains
```
