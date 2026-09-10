import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/profile";

export default async function HomePage() {
  const { user, profile } = await getCurrentUserAndProfile();

  // Signed in but hasn't finished onboarding yet.
  if (user && !profile) redirect("/onboarding");

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white/60 p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-tea-dark">
          A Letterboxd for boba 🧋
        </h1>
        <p className="mt-2 max-w-xl text-tea">
          Log the drinks you have, rate and review them, and keep a want-to-try
          list. Ratings attach to <em>drinks</em> — the reviewable unit — not
          shops.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/shops"
            className="rounded-full bg-tea px-5 py-2 font-medium text-milk hover:bg-tea-dark"
          >
            Browse shops
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-tea/30 px-5 py-2 font-medium text-tea hover:bg-tea/5"
          >
            Search drinks
          </Link>
          {!user && (
            <Link
              href="/login"
              className="rounded-full border border-tea/30 px-5 py-2 font-medium text-tea hover:bg-tea/5"
            >
              Sign in
            </Link>
          )}
        </div>
      </section>

      {profile && (
        <section className="rounded-2xl bg-white/60 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-tea-dark">
            Welcome back, {profile.display_name || `@${profile.username}`}
          </h2>
          <p className="mt-1 text-sm text-tea">
            <Link href={`/u/${profile.username}`} className="underline">
              Your profile
            </Link>{" "}
            has your logs, stats, and boba map.
          </p>
        </section>
      )}
    </div>
  );
}
