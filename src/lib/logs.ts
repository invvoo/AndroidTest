import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";
import type { Drink, Shop } from "@/lib/catalog";

export type Log = Database["public"]["Tables"]["logs"]["Row"];

export type DrinkWithShop = Drink & {
  shops: Pick<Shop, "id" | "name" | "slug" | "is_chain"> | null;
};

export type LogWithAuthor = Log & {
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  shop_locations: { city: string } | null;
};

export async function getDrink(id: string): Promise<DrinkWithShop | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("drinks")
    .select("*, shops(id, name, slug, is_chain)")
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as DrinkWithShop) ?? null;
}

/** Derived rating for a drink: average and count over its logs. */
export async function getDrinkRating(
  drinkId: string,
): Promise<{ avg: number | null; count: number }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("logs")
    .select("rating")
    .eq("drink_id", drinkId)
    .not("rating", "is", null)
    .limit(1000);

  const ratings = (data ?? [])
    .map((r) => r.rating)
    .filter((r): r is number => r != null);
  if (ratings.length === 0) return { avg: null, count: 0 };
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return { avg, count: ratings.length };
}

export async function getRecentLogsForDrink(
  drinkId: string,
  limit = 20,
): Promise<LogWithAuthor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("logs")
    .select(
      "*, profiles(username, display_name, avatar_url), shop_locations(city)",
    )
    .eq("drink_id", drinkId)
    .order("drank_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as LogWithAuthor[];
}

export type FeedLog = Log & {
  drinks:
    | (Pick<Drink, "id" | "name" | "category"> & {
        shops: Pick<Shop, "name" | "slug"> | null;
      })
    | null;
  shop_locations: { city: string } | null;
};

/** A user's own log feed, newest first, with the drink + shop joined in. */
export async function getUserLogs(
  userId: string,
  limit = 50,
): Promise<FeedLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("logs")
    .select(
      "*, drinks(id, name, category, shops(name, slug)), shop_locations(city)",
    )
    .eq("user_id", userId)
    .order("drank_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as FeedLog[];
}

export type UserStats = {
  totalLogs: number;
  uniqueDrinks: number;
  uniqueShops: number;
  uniqueLocations: number;
  avgRating: number | null;
  firstLogOn: string | null;
};

/**
 * Live profile stats. `user_stats` is a nightly materialized view; per
 * CLAUDE.md we query `logs` directly for a screen that needs live counts.
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("logs")
    .select("drink_id, location_id, rating, drank_on, drinks(shop_id)")
    .eq("user_id", userId)
    .limit(5000);

  const rows = (data ?? []) as unknown as {
    drink_id: string;
    location_id: string | null;
    rating: number | null;
    drank_on: string;
    drinks: { shop_id: string } | null;
  }[];

  const drinks = new Set<string>();
  const shops = new Set<string>();
  const locations = new Set<string>();
  const ratings: number[] = [];
  let firstLogOn: string | null = null;

  for (const r of rows) {
    drinks.add(r.drink_id);
    if (r.drinks?.shop_id) shops.add(r.drinks.shop_id);
    if (r.location_id) locations.add(r.location_id);
    if (r.rating != null) ratings.push(r.rating);
    if (firstLogOn == null || r.drank_on < firstLogOn) firstLogOn = r.drank_on;
  }

  return {
    totalLogs: rows.length,
    uniqueDrinks: drinks.size,
    uniqueShops: shops.size,
    uniqueLocations: locations.size,
    avgRating: ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null,
    firstLogOn,
  };
}

export type MapPoint = {
  logId: string;
  drinkName: string;
  shopName: string;
  city: string;
  drankOn: string;
  rating: number | null;
  lat: number;
  lng: number;
};

/** Points for a user's boba-history map (logs that recorded a location). */
export async function getUserMapPoints(userId: string): Promise<MapPoint[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("log_map_points")
    .select("*")
    .eq("user_id", userId)
    .limit(1000);
  if (error) throw error;
  return (data ?? [])
    .filter((p) => p.lat != null && p.lng != null && p.log_id != null)
    .map((p) => ({
      logId: p.log_id as string,
      drinkName: p.drink_name ?? "",
      shopName: p.shop_name ?? "",
      city: p.city ?? "",
      drankOn: p.drank_on ?? "",
      rating: p.rating,
      lat: p.lat as number,
      lng: p.lng as number,
    }));
}

/** True if this user has already logged this drink (used to flag re-logs). */
export async function userHasLogged(
  userId: string,
  drinkId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("drink_id", drinkId);
  return (count ?? 0) > 0;
}
