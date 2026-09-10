-- ============================================================
-- 0002 — Policies the v1 schema left open, needed for build
-- steps 1 (auth/profiles/onboarding) and 2 (catalog + search).
--
-- The v1 schema enabled RLS on `profiles` but defined no policy,
-- which locks the table entirely. Onboarding can't create a
-- profile and nobody can read one. Add the profile policies here.
-- Catalog tables (shops / shop_locations / drinks) are public
-- reference data; give them RLS with public read so the anon
-- browser client and unauthenticated visitors can browse.
-- ============================================================

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
-- Public app: profiles are readable, but never to a blocked party
-- (mirrors logs_read). auth.uid() is null for anon visitors, and
-- is_blocked(null, id) is false, so public browsing still works.
create policy profiles_read on profiles for select
  using (not is_blocked(auth.uid(), id));

-- A user creates exactly their own profile row during onboarding.
create policy profiles_insert on profiles for insert
  with check (id = auth.uid());

-- A user edits only their own profile.
create policy profiles_update on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- ------------------------------------------------------------
-- CATALOG — public read
-- ------------------------------------------------------------
alter table shops           enable row level security;
alter table shop_locations  enable row level security;
alter table drinks          enable row level security;

create policy shops_read on shops for select using (true);
create policy shop_locations_read on shop_locations for select using (true);
create policy drinks_read on drinks for select using (true);

-- User-submitted drinks (is_verified = false). The seeded/verified
-- chains are inserted with the service role, bypassing RLS.
-- An authenticated user may add a drink, stamped as themselves and
-- never pre-verified.
create policy drinks_insert on drinks for insert
  with check (
    created_by = auth.uid()
    and is_verified = false
  );
