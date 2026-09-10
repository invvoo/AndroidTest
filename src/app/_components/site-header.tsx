import Link from "next/link";
import { getCurrentUserAndProfile } from "@/lib/profile";
import { signOut } from "@/app/(auth)/login/actions";

export default async function SiteHeader() {
  const { user, profile } = await getCurrentUserAndProfile();

  return (
    <header className="border-b border-tea/10 bg-milk/80 backdrop-blur sticky top-0 z-10">
      <nav className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-tea-dark">
          🧋 Boba
        </Link>
        <Link href="/shops" className="text-sm text-tea hover:text-tea-dark">
          Shops
        </Link>
        <Link href="/search" className="text-sm text-tea hover:text-tea-dark">
          Search
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-tea">
                {profile?.username ? `@${profile.username}` : user.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-tea/30 px-3 py-1 text-sm text-tea hover:bg-tea/5"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-tea px-4 py-1.5 text-sm font-medium text-milk hover:bg-tea-dark"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
