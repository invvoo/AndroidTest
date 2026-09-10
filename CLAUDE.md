# Boba App

A Letterboxd for boba. Users log drinks they've had, rate and review them, keep a
want-to-try list, and see stats and a map of their boba history. Separately, users
can set a live "want to get boba today" status that matches them with other users
nearby who are also out for boba.

Solo-developer project. Prefer working, shippable increments over abstraction.
Do not build for scale we don't have.

---

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind** for styling
- **Supabase** — Postgres, Auth, Storage, RLS. PostGIS enabled.
- **Vercel** — deploy target
- **PWA** — installable, offline-capable log capture

Generate DB types with:
`supabase gen types typescript --linked > src/types/db.ts`
Regenerate after every migration. Never hand-write DB types.

---

## The two features people confuse — keep them separate

There are two distinct "I want this" concepts. They are NOT the same table, the
same UI, or the same mental model. Do not merge them, do not add a shortcut that
turns one into the other automatically.

**1. Want to try** (`want_to_try`)
Passive. No expiry. Private to the user. A wishlist of drinks and shops.
Zero social behavior. Zero location. This is the Letterboxd watchlist.

**2. Boba status** (`boba_status`)
Active, expiring, public to eligible users. "I want to go get boba today."
This is the only thing that drives matching. Expires on a rolling 6-hour window
capped at local midnight. One active status per user.

The bridge between them: when a user sets a status, offer shops from their
want-to-try list as suggestions. That is the only coupling. Nothing automatic.

---

## Hard rules — do not violate these without asking

1. **Never store or transmit precise user location.** `boba_status.area_geo` is a
   coarse neighborhood centroid, chosen by the user or snapped from a rough
   geolocate. Never live GPS, never continuous tracking, never lat/lng at
   building precision. No other table stores user geography at all.

2. **Matching is gated in RLS, not in application code.** The `status_browse`
   policy already filters blocked users, unverified users, non-adults, and
   expired rows. If you find yourself adding a `.neq('user_id', ...)` filter in a
   client query to hide someone, stop — that belongs in the policy.

3. **Blocks are symmetric.** Use the `is_blocked(a, b)` SQL function. Never
   check the `blocks` table directly in app code.

4. **Meetup chat is ephemeral.** Threads exist only after an accepted request and
   expire 24h later. Do not build persistent DMs between strangers. Do not add a
   general inbox.

5. **Matching features require `phone_verified_at` and `is_adult`.** Logging,
   rating, reviewing, and stats are open to everyone. Gate at the feature, not
   at signup.

6. **Browse then request. Never auto-pair.** Users see a list of active statuses
   and send a request. The recipient accepts or declines. No automatic matching,
   no swipe queue, no "you've been matched" push.

---

## Data model, in one breath

`shops` (brand) → `shop_locations` (storefront, Google Places-backed) →
`drinks` (menu item; this is the reviewable unit, the "film") → `logs`
(one user drinking one drink once, with sugar/ice/toppings customization).

Ratings and reviews attach to **drinks**, not shops. A shop's rating is derived.

`want_to_try` is drink-level OR shop-level, never both (CHECK constraint).

`boba_status` → `meetup_requests` → `meetup_threads` → `meetup_messages`.

`user_stats` is a materialized view refreshed nightly. If a screen needs live
counts, query `logs` directly instead of adding a counter column.

Full schema lives in `supabase/migrations/`. Read it before writing queries.

---

## Menu data

`drinks` rows are the hard part. There is no menu API. Strategy:

- Hand-seed the ~40 major chains (Sunright, Ten Ren, Boba Guys, Happy Lemon,
  Chatime, Gong Cha, Yifang, Tiger Sugar, etc.) with `is_verified = true`.
- Everything else is user-submitted with `is_verified = false`.
- Any new-drink UI must show existing drinks at that shop first, with fuzzy
  matching, to prevent "Brown Sugar Milk Tea" / "brown sugar milktea" duplicates.

---

## Conventions

- Server Components by default. `'use client'` only where there is interaction.
- Supabase queries in server components or route handlers. The anon client in the
  browser is for realtime and auth only.
- Never bypass RLS with the service role key in anything user-facing.
- Colocate: `app/(feature)/_components/`, not a global components dump.
- Forms: server actions. No client-side form libraries.
- Dates: store `date` for `drank_on` (a log is a day, not an instant).
  Store `timestamptz` for everything system-generated.
- Money in integer cents. Never floats.

---

## Offline behavior

Logging a drink must work offline. Queue to IndexedDB, sync on reconnect via
Background Sync with a `visibilitychange` fallback for iOS Safari.
Matching features are online-only — do not attempt to queue a status or a
meetup request.

---

## Build order

1. Auth + profiles + onboarding
2. Shop and drink catalog, search, seed script
3. Log a drink: rating, review, customization, photo
4. Profile: log feed, stats, boba history map
5. Want-to-try list
6. Boba status: set, browse, request, accept, thread
7. Block, report, phone verification
8. PWA shell + offline log queue

Do not start 6 until 7's tables and policies exist.

---

## Commands

```
npm run dev
npm run build
npm run lint
supabase db push
supabase gen types typescript --linked > src/types/db.ts
```
