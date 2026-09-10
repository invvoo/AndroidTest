"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { userHasLogged } from "@/lib/logs";

export type LogFormState = { error: string | null };

const ICE_LEVELS = ["none", "less", "regular", "extra"];
const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB

function toIntOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

export async function createLog(
  _prev: LogFormState,
  formData: FormData,
): Promise<LogFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const drinkId = String(formData.get("drink_id") ?? "");
  if (!drinkId) return { error: "Missing drink." };

  if (!user) redirect(`/login?next=/drinks/${drinkId}/log`);

  // Logging requires a profile row (logs.user_id references profiles).
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/onboarding");

  // --- parse + validate ---
  const rating = toIntOrNull(formData.get("rating"));
  if (rating != null && (rating < 1 || rating > 10)) {
    return { error: "Rating is out of range." };
  }

  const sugarPct = toIntOrNull(formData.get("sugar_pct"));
  if (sugarPct != null && (sugarPct < 0 || sugarPct > 125)) {
    return { error: "Sugar % must be between 0 and 125." };
  }

  const iceRaw = String(formData.get("ice_level") ?? "").trim();
  const iceLevel = iceRaw === "" ? null : iceRaw;
  if (iceLevel != null && !ICE_LEVELS.includes(iceLevel)) {
    return { error: "Invalid ice level." };
  }

  const review = String(formData.get("review") ?? "").trim() || null;

  const drankOnRaw = String(formData.get("drank_on") ?? "").trim();
  const drankOn = /^\d{4}-\d{2}-\d{2}$/.test(drankOnRaw) ? drankOnRaw : null;

  const locationRaw = String(formData.get("location_id") ?? "").trim();
  const locationId = locationRaw === "" ? null : locationRaw;

  const toppings = formData
    .getAll("toppings")
    .map((t) => String(t).trim())
    .filter(Boolean);

  // Money in integer cents. Form takes dollars.
  const priceRaw = String(formData.get("price") ?? "").trim();
  let priceCents: number | null = null;
  if (priceRaw !== "") {
    const dollars = Number(priceRaw);
    if (!Number.isFinite(dollars) || dollars < 0) {
      return { error: "Price must be a non-negative number." };
    }
    priceCents = Math.round(dollars * 100);
  }

  // --- photo upload (optional) ---
  let photoUrl: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return { error: "Photo must be an image." };
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return { error: "Photo must be 10 MB or smaller." };
    }
    const ext = (photo.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("log-photos")
      .upload(path, photo, { contentType: photo.type, upsert: false });
    if (uploadError) {
      return { error: `Photo upload failed: ${uploadError.message}` };
    }
    photoUrl = supabase.storage.from("log-photos").getPublicUrl(path)
      .data.publicUrl;
  }

  const isRelog = await userHasLogged(user.id, drinkId);

  const { error: insertError } = await supabase.from("logs").insert({
    user_id: user.id,
    drink_id: drinkId,
    location_id: locationId,
    rating,
    review,
    photo_url: photoUrl,
    sugar_pct: sugarPct,
    ice_level: iceLevel,
    toppings: toppings.length ? toppings : null,
    price_cents: priceCents,
    is_relog: isRelog,
    ...(drankOn ? { drank_on: drankOn } : {}),
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath(`/drinks/${drinkId}`);
  redirect(`/drinks/${drinkId}`);
}
