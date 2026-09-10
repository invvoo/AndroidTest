"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export type OnboardingState = { error: string | null };

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/onboarding");

  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const homeCity = String(formData.get("home_city") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!USERNAME_RE.test(username)) {
    return {
      error:
        "Username must be 3–20 characters: lowercase letters, numbers, or underscores.",
    };
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username,
    display_name: displayName || null,
    home_city: homeCity || null,
    bio: bio || null,
  });

  if (error) {
    // 23505 = unique_violation (username already taken).
    if (error.code === "23505") {
      return { error: "That username is taken. Try another." };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
