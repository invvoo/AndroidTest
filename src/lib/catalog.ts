import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

export type Shop = Database["public"]["Tables"]["shops"]["Row"];
export type ShopLocation =
  Database["public"]["Tables"]["shop_locations"]["Row"];
export type Drink = Database["public"]["Tables"]["drinks"]["Row"];

/** Escape LIKE wildcards so user input is matched literally. */
function likeTerm(q: string): string {
  return `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
}

export async function listShops(q?: string): Promise<Shop[]> {
  const supabase = await createClient();
  let query = supabase.from("shops").select("*").order("name");
  if (q?.trim()) query = query.ilike("name", likeTerm(q.trim()));
  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function getShopBySlug(slug: string): Promise<Shop | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shops")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ?? null;
}

export async function getShopLocations(
  shopId: string,
): Promise<ShopLocation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shop_locations")
    .select("*")
    .eq("shop_id", shopId)
    .order("city");
  if (error) throw error;
  return data ?? [];
}

export async function getShopDrinks(shopId: string): Promise<Drink[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drinks")
    .select("*")
    .eq("shop_id", shopId)
    .order("is_verified", { ascending: false })
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export type DrinkWithShop = Drink & { shops: Pick<Shop, "name" | "slug"> | null };

/** Cross-catalog drink search by name, with the parent shop joined in. */
export async function searchDrinks(q: string): Promise<DrinkWithShop[]> {
  if (!q.trim()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drinks")
    .select("*, shops(name, slug)")
    .ilike("name", likeTerm(q.trim()))
    .order("is_verified", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as unknown as DrinkWithShop[];
}
