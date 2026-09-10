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
