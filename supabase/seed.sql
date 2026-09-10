-- ============================================================
-- Seed: hand-seeded major chains, is_verified = true.
-- Per CLAUDE.md: there is no menu API, so the ~40 big chains are
-- seeded by hand and everything else is user-submitted. This is a
-- starter subset — extend it as you go. Run via `supabase db reset`
-- (which applies migrations then this file) or `psql -f seed.sql`.
--
-- Idempotent: safe to re-run. Uses the service-role connection, so
-- RLS does not apply here.
-- ============================================================

-- ---------- SHOPS (brand level) ----------
insert into shops (name, slug, is_chain, logo_url) values
  ('Sunright Tea Studio', 'sunright-tea-studio', true, null),
  ('Boba Guys',           'boba-guys',           true, null),
  ('Happy Lemon',         'happy-lemon',         true, null),
  ('Gong Cha',            'gong-cha',            true, null),
  ('Chatime',             'chatime',             true, null),
  ('Tiger Sugar',         'tiger-sugar',         true, null),
  ('Ten Ren Tea',         'ten-ren-tea',         true, null),
  ('Yifang Taiwan Fruit Tea', 'yifang',          true, null),
  ('Sharetea',            'sharetea',            true, null),
  ('Kung Fu Tea',         'kung-fu-tea',         true, null)
on conflict (slug) do nothing;

-- ---------- SHOP LOCATIONS (one storefront each to start) ----------
-- geo = ST_Point(lng, lat) as geography(4326). Storefront precision is
-- fine here; the "never precise" rule applies to *user* geography only.
insert into shop_locations (shop_id, google_place_id, address, city, geo)
select s.id, v.place_id, v.address, v.city,
       ST_SetSRID(ST_MakePoint(v.lng, v.lat), 4326)::geography
from (values
  ('sunright-tea-studio', 'seed_place_sunright_arcadia', '1400 S Baldwin Ave', 'Arcadia',        -118.0501, 34.1181),
  ('boba-guys',           'seed_place_bobaguys_mission', '3491 19th St',       'San Francisco',  -122.4210, 37.7600),
  ('happy-lemon',         'seed_place_happylemon_cup',   '250 King St',        'San Francisco',  -122.3900, 37.7770),
  ('gong-cha',            'seed_place_gongcha_ktown',    '3500 W 6th St',      'Los Angeles',    -118.2960, 34.0640),
  ('chatime',             'seed_place_chatime_sgv',      '140 W Valley Blvd',  'San Gabriel',    -118.1010, 34.0900),
  ('tiger-sugar',         'seed_place_tigersugar_626',   '227 W Valley Blvd',  'San Gabriel',    -118.1050, 34.0900),
  ('ten-ren-tea',         'seed_place_tenren_flushing',  '135-18 Roosevelt Ave','Queens',        -73.8300, 40.7590),
  ('yifang',              'seed_place_yifang_westwood',  '1099 Westwood Blvd', 'Los Angeles',    -118.4440, 34.0610),
  ('sharetea',            'seed_place_sharetea_berkeley','2519 Durant Ave',    'Berkeley',       -122.2580, 37.8680),
  ('kung-fu-tea',         'seed_place_kft_manhattan',    '31 Waverly Pl',      'New York',       -73.9960, 40.7300)
) as v(slug, place_id, address, city, lng, lat)
join shops s on s.slug = v.slug
on conflict (google_place_id) do nothing;

-- ---------- DRINKS (the reviewable unit) ----------
insert into drinks (shop_id, name, category, base_tea, description, is_verified)
select s.id, v.name, v.category, v.base_tea, v.description, true
from (values
  -- Sunright
  ('sunright-tea-studio', 'Sunright Milk Tea',        'milk tea',  'black',   'House milk tea with the burnt-sugar rim.'),
  ('sunright-tea-studio', 'Peach Oolong Tea',         'fruit tea', 'oolong',  'Oolong steeped with fresh peach.'),
  ('sunright-tea-studio', 'Brown Sugar Boba Milk',    'milk tea',  'none',    'Fresh milk with brown sugar and boba.'),
  -- Boba Guys
  ('boba-guys', 'Classic Milk Tea',                   'milk tea',  'black',   'Organic milk, house black tea.'),
  ('boba-guys', 'Strawberry Matcha Latte',            'latte',     'matcha',  'Strawberry purée under a matcha layer.'),
  ('boba-guys', 'Hong Kong Milk Tea',                 'milk tea',  'black',   'Strong, malty, traditional.'),
  -- Happy Lemon
  ('happy-lemon', 'Rock Salt Cheese Green Tea',       'fruit tea', 'green',   'Salted cheese foam over green tea.'),
  ('happy-lemon', 'Matcha Rock Salt Cheese',          'latte',     'matcha',  'Matcha with salted cheese cap.'),
  ('happy-lemon', 'Lemon Yakult',                     'fruit tea', 'none',    'Yakult with fresh lemon.'),
  -- Gong Cha
  ('gong-cha', 'Milk Foam Black Tea',                 'milk tea',  'black',   'Signature milk foam over black tea.'),
  ('gong-cha', 'Taro Milk Tea',                       'milk tea',  'none',    'Creamy taro.'),
  ('gong-cha', 'Wintermelon Milk Tea',               'milk tea',  'none',    'Wintermelon caramel notes.'),
  -- Chatime
  ('chatime', 'Pearl Milk Tea',                       'milk tea',  'black',   'Classic pearl milk tea.'),
  ('chatime', 'Roasted Milk Tea',                     'milk tea',  'roasted', 'Deep roasted oolong base.'),
  ('chatime', 'Mango Green Tea',                       'fruit tea', 'green',   'Mango with jasmine green.'),
  -- Tiger Sugar
  ('tiger-sugar', 'Brown Sugar Boba Milk',            'milk tea',  'none',    'The tiger-stripe original.'),
  ('tiger-sugar', 'Brown Sugar Boba Milk with Cream Mousse','milk tea','none','Topped with cream mousse.'),
  ('tiger-sugar', 'Brown Sugar Pearl Black Tea',      'milk tea',  'black',   'Brown sugar pearls in black tea.'),
  -- Ten Ren
  ('ten-ren-tea', 'Ten Ren Milk Tea',                 'milk tea',  'black',   'Classic house milk tea.'),
  ('ten-ren-tea', '913 King''s Oolong Tea',           'fruit tea', 'oolong',  'Premium roasted oolong.'),
  ('ten-ren-tea', 'Ginger Milk Tea',                  'milk tea',  'black',   'Warming ginger milk tea.'),
  -- Yifang
  ('yifang', 'Yifang Fruit Tea',                      'fruit tea', 'black',   'Seasonal fruit tea.'),
  ('yifang', 'Brown Sugar Pearl Latte',               'latte',     'none',    'Brown sugar pearls, fresh milk.'),
  ('yifang', 'Sugarcane Mojito',                      'fruit tea', 'green',   'Sugarcane, lime, mint.'),
  -- Sharetea
  ('sharetea', 'Classic Pearl Milk Tea',              'milk tea',  'black',   'Signature pearl milk tea.'),
  ('sharetea', 'Taro Ice Blended with Pudding',       'slush',     'none',    'Blended taro with pudding.'),
  ('sharetea', 'Mango Green Tea',                      'fruit tea', 'green',   'Mango and jasmine green.'),
  -- Kung Fu Tea
  ('kung-fu-tea', 'Kung Fu Milk Tea',                 'milk tea',  'black',   'House milk tea.'),
  ('kung-fu-tea', 'Oolong Milk Tea',                  'milk tea',  'oolong',  'Oolong-based milk tea.'),
  ('kung-fu-tea', 'Winter Melon Slush',               'slush',     'none',    'Blended wintermelon.')
) as v(slug, name, category, base_tea, description)
join shops s on s.slug = v.slug
on conflict (shop_id, name) do nothing;
