import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Returns the signed-in auth user and their profile row (if onboarding is
 * complete). Both may be null. Use `getUser()` (not `getSession()`) so the
 * user is verified against the auth server.
 */
export async function getCurrentUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null as Profile | null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: profile as Profile | null };
}
