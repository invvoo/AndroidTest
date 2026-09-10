import { Suspense } from "react";
import SearchBox from "@/app/_components/search-box";
import { listShops, searchDrinks } from "@/lib/catalog";
import ShopCard from "@/app/shops/_components/shop-card";
import DrinkCard from "@/app/shops/_components/drink-card";

export const metadata = { title: "Search — Boba" };

async function Results({ q }: { q: string }) {
  const [drinks, shops] = await Promise.all([
    searchDrinks(q),
    listShops(q),
  ]);

  if (drinks.length === 0 && shops.length === 0) {
    return (
      <p className="rounded-xl bg-white/60 p-6 text-sm text-tea">
        Nothing matches “{q}”.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {drinks.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold text-tea-dark">
            Drinks{" "}
            <span className="text-sm font-normal text-tea/60">
              ({drinks.length})
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {drinks.map((drink) => (
              <DrinkCard key={drink.id} drink={drink} shop={drink.shops} />
            ))}
          </div>
        </section>
      )}

      {shops.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold text-tea-dark">
            Shops{" "}
            <span className="text-sm font-normal text-tea/60">
              ({shops.length})
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-tea-dark">Search</h1>
        <p className="text-sm text-tea">Find a drink or a shop by name.</p>
      </div>

      <SearchBox placeholder="Search drinks and shops…" />

      {query ? (
        <Suspense key={query} fallback={<p className="text-tea">Searching…</p>}>
          <Results q={query} />
        </Suspense>
      ) : (
        <p className="rounded-xl bg-white/60 p-6 text-sm text-tea">
          Start typing to search the catalog.
        </p>
      )}
    </div>
  );
}
