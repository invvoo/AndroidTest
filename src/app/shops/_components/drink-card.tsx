import Link from "next/link";
import type { Drink } from "@/lib/catalog";

export default function DrinkCard({
  drink,
  shop,
}: {
  drink: Drink;
  shop?: { name: string; slug: string } | null;
}) {
  return (
    <div className="rounded-xl border border-tea/10 bg-white/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/drinks/${drink.id}`}
            className="font-medium text-tea-dark hover:underline"
          >
            {drink.name}
          </Link>
          {shop && (
            <div>
              <Link
                href={`/shops/${shop.slug}`}
                className="text-xs text-tea hover:underline"
              >
                {shop.name}
              </Link>
            </div>
          )}
        </div>
        {drink.is_verified ? (
          <span
            title="Verified chain menu item"
            className="shrink-0 rounded-full bg-taro/25 px-2 py-0.5 text-xs text-tea-dark"
          >
            ✓ verified
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-tea/10 px-2 py-0.5 text-xs text-tea/70">
            community
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-tea/70">
        {drink.category && (
          <span className="rounded-full bg-tea/5 px-2 py-0.5">
            {drink.category}
          </span>
        )}
        {drink.base_tea && drink.base_tea !== "none" && (
          <span className="rounded-full bg-tea/5 px-2 py-0.5">
            {drink.base_tea} tea
          </span>
        )}
      </div>

      {drink.description && (
        <p className="mt-2 text-sm text-tea/80">{drink.description}</p>
      )}
    </div>
  );
}
