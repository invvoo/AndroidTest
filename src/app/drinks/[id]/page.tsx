import Link from "next/link";
import { notFound } from "next/navigation";
import RatingStars from "@/app/_components/rating-stars";
import { getCurrentUserAndProfile } from "@/lib/profile";
import {
  getDrink,
  getDrinkRating,
  getRecentLogsForDrink,
} from "@/lib/logs";
import LogItem from "./_components/log-item";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drink = await getDrink(id);
  return { title: drink ? `${drink.name} — Boba` : "Drink — Boba" };
}

export default async function DrinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drink = await getDrink(id);
  if (!drink) notFound();

  const [{ avg, count }, logs, { user }] = await Promise.all([
    getDrinkRating(id),
    getRecentLogsForDrink(id),
    getCurrentUserAndProfile(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        {drink.shops && (
          <Link
            href={`/shops/${drink.shops.slug}`}
            className="text-sm text-tea hover:underline"
          >
            ← {drink.shops.name}
          </Link>
        )}
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-tea-dark">{drink.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-tea/70">
              {drink.category && <span>{drink.category}</span>}
              {drink.base_tea && drink.base_tea !== "none" && (
                <span>· {drink.base_tea} tea</span>
              )}
              {drink.is_verified ? (
                <span className="rounded-full bg-taro/25 px-2 py-0.5 text-xs text-tea-dark">
                  ✓ verified
                </span>
              ) : (
                <span className="rounded-full bg-tea/10 px-2 py-0.5 text-xs text-tea/70">
                  community
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/drinks/${drink.id}/log`}
            className="rounded-full bg-tea px-5 py-2 font-medium text-milk hover:bg-tea-dark"
          >
            Log this drink
          </Link>
        </div>

        {drink.description && (
          <p className="mt-3 max-w-2xl text-tea/90">{drink.description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-white/60 p-4">
        {avg != null ? (
          <>
            <RatingStars value={Math.round(avg)} showNumber={false} />
            <span className="text-lg font-semibold text-tea-dark">
              {(avg / 2).toFixed(1)}
            </span>
            <span className="text-sm text-tea/60">
              from {count} {count === 1 ? "log" : "logs"}
            </span>
          </>
        ) : (
          <span className="text-sm text-tea/60">
            No logs yet — be the first.
          </span>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-tea-dark">
          Recent logs
        </h2>
        {logs.length === 0 ? (
          <p className="rounded-xl bg-white/60 p-4 text-sm text-tea">
            No one has logged this yet.{" "}
            {user ? (
              <Link
                href={`/drinks/${drink.id}/log`}
                className="text-tea-dark underline"
              >
                Log it
              </Link>
            ) : (
              <Link
                href={`/login?next=/drinks/${drink.id}/log`}
                className="text-tea-dark underline"
              >
                Sign in to log it
              </Link>
            )}
            .
          </p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
