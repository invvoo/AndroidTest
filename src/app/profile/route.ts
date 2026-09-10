import { NextResponse } from "next/server";
import { getCurrentUserAndProfile } from "@/lib/profile";

/**
 * Convenience redirect: /profile -> the current user's public profile,
 * or to login / onboarding when there's no session or profile yet.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const { user, profile } = await getCurrentUserAndProfile();

  if (!user) return NextResponse.redirect(`${origin}/login?next=/profile`);
  if (!profile) return NextResponse.redirect(`${origin}/onboarding`);
  return NextResponse.redirect(`${origin}/u/${profile.username}`);
}
