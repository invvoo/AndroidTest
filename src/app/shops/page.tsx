import { Suspense } from "react";
import SearchBox from "@/app/_components/search-box";
import { listShops } from "@/lib/catalog";
import ShopCard from "./_components/shop-card";

export const metadata = { title: "Shops — Boba" };

async function ShopGrid({ q }: { q?: string }) {
  const shops = await listShops(q);

  if (shops.length === 0) {
    return (
      <p className="rounded-xl bg-white/60 p-6 text-sm text-tea">
        {q
          ? `No shops match “${q}”.`
          : "No shops yet. Run the seed script to add the major chains."}
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {shops.map((shop) => (
        <ShopCard key={shop.id} shop={shop} />
      ))}
    </div>
  );
}

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-tea-dark">Shops</h1>
        <p className="text-sm text-tea">Browse boba brands and their menus.</p>
      </div>

      <SearchBox placeholder="Search shops…" />

      <Suspense key={q ?? ""} fallback={<p className="text-tea">Loading…</p>}>
        <ShopGrid q={q} />
      </Suspense>
    </div>
  );
}
