-- ============================================================
-- 0004 — Boba history map (build step 4).
--
-- CLAUDE.md: "map of boba history = select logs joined to
-- shop_locations.geo for the current user; no extra table needed."
-- Rather than teach the client to parse PostGIS EWKB, expose a thin
-- read view that pulls lat/lng out of the storefront geography. Only
-- logs that recorded a location appear.
--
-- NOTE: geo here is the *storefront* (public Google-Places business
-- data), not user geography — hard rule #1 is about user location and
-- does not apply. security_invoker keeps the underlying logs_read RLS
-- in force, so blocked parties still can't see each other's points.
-- ============================================================

create view log_map_points
  with (security_invoker = true)
as
select
  l.id           as log_id,
  l.user_id,
  l.drink_id,
  d.name         as drink_name,
  s.name         as shop_name,
  sl.city        as city,
  l.drank_on     as drank_on,
  l.rating       as rating,
  ST_Y(sl.geo::geometry) as lat,
  ST_X(sl.geo::geometry) as lng
from logs l
join shop_locations sl on sl.id = l.location_id
join drinks d          on d.id  = l.drink_id
join shops s           on s.id  = d.shop_id
where l.location_id is not null;
