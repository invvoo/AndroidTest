-- ============================================================
-- Boba app — Postgres / Supabase schema (v1)
-- Three layers: catalog, personal logging, live matching
-- ============================================================

create extension if not exists postgis;
create extension if not exists pg_cron;

-- ------------------------------------------------------------
-- 1. IDENTITY
-- ------------------------------------------------------------

create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  username      text unique not null,
  display_name  text,
  avatar_url    text,
  bio           text,
  home_city     text,
  phone_verified_at timestamptz,          -- gate for matching features
  is_adult      boolean not null default false,
  created_at    timestamptz not null default now()
);

create table follows (
  follower_id   uuid references profiles on delete cascade,
  followee_id   uuid references profiles on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create table blocks (
  blocker_id    uuid references profiles on delete cascade,
  blocked_id    uuid references profiles on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

-- symmetric block check — used in every matching query & RLS policy
create or replace function is_blocked(a uuid, b uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from blocks
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  );
$$;

-- ------------------------------------------------------------
-- 2. CATALOG  (shop -> location -> drink)
-- ------------------------------------------------------------

-- Brand-level. "Sunright Tea Studio" is one row.
create table shops (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique not null,
  is_chain      boolean not null default false,
  logo_url      text,
  created_at    timestamptz not null default now()
);

-- Physical storefronts. Google Places is the source of truth for these.
create table shop_locations (
  id            uuid primary key default gen_random_uuid(),
  shop_id       uuid not null references shops on delete cascade,
  google_place_id text unique,
  address       text,
  city          text not null,
  geo           geography(point, 4326) not null,
  created_at    timestamptz not null default now()
);
create index on shop_locations using gist (geo);
create index on shop_locations (city);

-- The "film" of this app. Ratings and reviews attach HERE, not to shops.
create table drinks (
  id            uuid primary key default gen_random_uuid(),
  shop_id       uuid not null references shops on delete cascade,
  name          text not null,
  category      text,                    -- milk tea / fruit tea / latte / slush
  base_tea      text,
  description   text,
  image_url     text,
  created_by    uuid references profiles on delete set null,
  is_verified   boolean not null default false,  -- true for hand-seeded chains
  created_at    timestamptz not null default now(),
  unique (shop_id, name)
);
create index on drinks (shop_id);

-- ------------------------------------------------------------
-- 3. LOGGING  (the Letterboxd core)
-- ------------------------------------------------------------

create table logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles on delete cascade,
  drink_id      uuid not null references drinks on delete cascade,
  location_id   uuid references shop_locations on delete set null,

  drank_on      date not null default current_date,
  rating        smallint check (rating between 1 and 10),  -- half-stars = 1..10
  review        text,
  photo_url     text,
  is_relog      boolean not null default false,

  -- customization: what makes YOUR order yours
  sugar_pct     smallint check (sugar_pct between 0 and 125),
  ice_level     text check (ice_level in ('none','less','regular','extra')),
  toppings      text[],
  price_cents   integer,

  created_at    timestamptz not null default now()
);
create index on logs (user_id, drank_on desc);
create index on logs (drink_id);
create index on logs (location_id);

-- "want to try" — passive, no expiry, no matching
create table want_to_try (
  user_id       uuid references profiles on delete cascade,
  drink_id      uuid references drinks on delete cascade,
  shop_id       uuid references shops on delete cascade,
  note          text,
  created_at    timestamptz not null default now(),
  -- entry is either drink-level or shop-level, not both
  check (num_nonnulls(drink_id, shop_id) = 1)
);
create unique index on want_to_try (user_id, drink_id) where drink_id is not null;
create unique index on want_to_try (user_id, shop_id) where shop_id is not null;

-- ------------------------------------------------------------
-- 4. MATCHING  ("want to go get boba today")
-- ------------------------------------------------------------
-- Deliberately separate from want_to_try. Ephemeral, expiring,
-- and the ONLY table that touches user geography.

create table boba_status (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles on delete cascade,

  -- null location_id = "anywhere near me" bucket
  location_id   uuid references shop_locations on delete cascade,
  city          text not null,
  area_geo      geography(point, 4326) not null,  -- COARSE. Neighborhood
                                                  -- centroid, never live GPS.
  note          text,
  window_label  text check (window_label in ('now','afternoon','evening')),

  expires_at    timestamptz not null,
  cancelled_at  timestamptz,
  created_at    timestamptz not null default now()
);
create index on boba_status (city, expires_at);
create index on boba_status using gist (area_geo);
-- one active status per user
create unique index on boba_status (user_id)
  where cancelled_at is null;

-- expiry = now + 6h, capped at local midnight
create or replace function set_status_expiry()
returns trigger language plpgsql as $$
declare eod timestamptz;
begin
  eod := date_trunc('day', now() at time zone 'America/Los_Angeles')
         + interval '1 day';
  new.expires_at := least(now() + interval '6 hours', eod);
  return new;
end;
$$;
create trigger trg_status_expiry before insert on boba_status
  for each row execute function set_status_expiry();

select cron.schedule('expire-status', '*/15 * * * *',
  $$delete from boba_status where expires_at < now() - interval '1 day'$$);

-- browse, then request. No auto-pairing.
create table meetup_requests (
  id            uuid primary key default gen_random_uuid(),
  from_status_id uuid not null references boba_status on delete cascade,
  to_status_id   uuid not null references boba_status on delete cascade,
  from_user_id  uuid not null references profiles on delete cascade,
  to_user_id    uuid not null references profiles on delete cascade,
  message       text,
  state         text not null default 'pending'
                  check (state in ('pending','accepted','declined','expired')),
  created_at    timestamptz not null default now(),
  responded_at  timestamptz,
  unique (from_user_id, to_status_id)
);

-- thread exists only after mutual accept; dies with the meetup
create table meetup_threads (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null unique references meetup_requests on delete cascade,
  location_id   uuid references shop_locations,
  expires_at    timestamptz not null default now() + interval '24 hours',
  created_at    timestamptz not null default now()
);

create table meetup_messages (
  id            uuid primary key default gen_random_uuid(),
  thread_id     uuid not null references meetup_threads on delete cascade,
  sender_id     uuid not null references profiles on delete cascade,
  body          text not null,
  created_at    timestamptz not null default now()
);

create table reports (
  id            uuid primary key default gen_random_uuid(),
  reporter_id   uuid not null references profiles on delete cascade,
  reported_id   uuid not null references profiles on delete cascade,
  thread_id     uuid references meetup_threads on delete set null,
  reason        text not null,
  detail        text,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. STATS  (profile counters — read models, refreshed nightly)
-- ------------------------------------------------------------

create materialized view user_stats as
select
  l.user_id,
  count(*)                            as total_logs,
  count(distinct l.drink_id)          as unique_drinks,
  count(distinct d.shop_id)           as unique_shops,
  count(distinct l.location_id)       as unique_locations,
  round(avg(l.rating)::numeric, 2)    as avg_rating,
  min(l.drank_on)                     as first_log_on
from logs l
join drinks d on d.id = l.drink_id
group by l.user_id;
create unique index on user_stats (user_id);

-- map of boba history = select logs joined to shop_locations.geo
-- for the current user; no extra table needed.

-- ------------------------------------------------------------
-- 6. RLS
-- ------------------------------------------------------------

alter table profiles         enable row level security;
alter table logs             enable row level security;
alter table want_to_try      enable row level security;
alter table boba_status      enable row level security;
alter table meetup_requests  enable row level security;
alter table meetup_threads   enable row level security;
alter table meetup_messages  enable row level security;
alter table blocks           enable row level security;

-- logs are public (it's a social review app) but never to a blocked party
create policy logs_read on logs for select
  using (not is_blocked(auth.uid(), user_id));
create policy logs_write on logs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- want_to_try is private
create policy wtt_own on want_to_try for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- CRITICAL: block-filtering lives here, not in app code.
-- Also gates matching behind phone verification + adult flag.
create policy status_browse on boba_status for select
  using (
    cancelled_at is null
    and expires_at > now()
    and not is_blocked(auth.uid(), user_id)
    and exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.phone_verified_at is not null
        and p.is_adult
    )
  );
create policy status_own on boba_status for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy requests_visible on meetup_requests for select
  using (auth.uid() in (from_user_id, to_user_id));

create policy thread_members on meetup_threads for select
  using (exists (
    select 1 from meetup_requests r
    where r.id = request_id
      and r.state = 'accepted'
      and auth.uid() in (r.from_user_id, r.to_user_id)
  ));

create policy messages_members on meetup_messages for all
  using (exists (
    select 1 from meetup_threads t
    join meetup_requests r on r.id = t.request_id
    where t.id = thread_id
      and t.expires_at > now()
      and auth.uid() in (r.from_user_id, r.to_user_id)
  ));
