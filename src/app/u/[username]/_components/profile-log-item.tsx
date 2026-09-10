import Link from "next/link";
import RatingStars from "@/app/_components/rating-stars";
import type { FeedLog } from "@/lib/logs";

const ICE_LABEL: Record<string, string> = {
  none: "no ice",
  less: "less ice",
  regular: "regular ice",
  extra: "extra ice",
};

function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ProfileLogItem({ log }: { log: FeedLog }) {
  const drink = log.drinks;
  const chips: string[] = [];
  if (log.sugar_pct != null) chips.push(`${log.sugar_pct}% sugar`);
  if (log.ice_level) chips.push(ICE_LABEL[log.ice_level] ?? log.ice_level);
  if (log.toppings) chips.push(...log.toppings);

  return (
    <article className="rounded-xl border border-tea/10 bg-white/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {drink ? (
            <Link
              href={`/drinks/${drink.id}`}
              className="font-medium text-tea-dark hover:underline"
            >
              {drink.name}
            </Link>
          ) : (
            <span className="font-medium text-tea-dark">A drink</span>
          )}
          {drink?.shops && (
            <div>
              <Link
                href={`/shops/${drink.shops.slug}`}
                className="text-xs text-tea hover:underline"
              >
                {drink.shops.name}
              </Link>
            </div>
          )}
        </div>
        <time className="shrink-0 text-xs text-tea/50">
          {formatDate(log.drank_on)}
        </time>
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <RatingStars value={log.rating} />
        {log.is_relog && (
          <span className="rounded-full bg-tea/10 px-2 py-0.5 text-xs text-tea/70">
            relog
          </span>
        )}
      </div>

      {log.review && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-tea/90">
          {log.review}
        </p>
      )}

      {log.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={log.photo_url}
          alt=""
          className="mt-3 max-h-72 rounded-lg object-cover"
        />
      )}

      {(chips.length > 0 ||
        log.price_cents != null ||
        log.shop_locations?.city) && (
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-tea/70">
          {chips.map((c) => (
            <span key={c} className="rounded-full bg-tea/5 px-2 py-0.5">
              {c}
            </span>
          ))}
          {log.price_cents != null && (
            <span className="rounded-full bg-tea/5 px-2 py-0.5">
              ${(log.price_cents / 100).toFixed(2)}
            </span>
          )}
          {log.shop_locations?.city && (
            <span className="rounded-full bg-tea/5 px-2 py-0.5">
              📍 {log.shop_locations.city}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
