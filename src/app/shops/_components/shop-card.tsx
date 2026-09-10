import Link from "next/link";
import type { Shop } from "@/lib/catalog";

export default function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Link
      href={`/shops/${shop.slug}`}
      className="flex items-center gap-3 rounded-xl border border-tea/10 bg-white/70 p-4 transition hover:border-tea/30 hover:shadow-sm"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tea/10 text-lg">
        {shop.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shop.logo_url}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          "🧋"
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-tea-dark">{shop.name}</p>
        {shop.is_chain && <p className="text-xs text-tea/60">Chain</p>}
      </div>
    </Link>
  );
}
