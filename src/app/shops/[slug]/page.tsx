import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getShopBySlug,
  getShopDrinks,
  getShopLocations,
} from "@/lib/catalog";
import DrinkCard from "../_components/drink-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  return { title: shop ? `${shop.name} — Boba` : "Shop — Boba" };
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();

  const [locations, drinks] = await Promise.all([
    getShopLocations(shop.id),
    getShopDrinks(shop.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/shops" className="text-sm text-tea hover:underline">
          ← All shops
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-tea-dark">{shop.name}</h1>
        {shop.is_chain && <p className="text-sm text-tea/60">Chain</p>}
      </div>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-tea-dark">
          Menu{" "}
          <span className="text-sm font-normal text-tea/60">
            ({drinks.length})
          </span>
        </h2>
        <p className="mb-3 text-xs text-tea/60">
          Ratings and reviews attach to drinks, not the shop.
        </p>
        {drinks.length === 0 ? (
          <p className="rounded-xl bg-white/60 p-4 text-sm text-tea">
            No drinks listed yet.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {drinks.map((drink) => (
              <DrinkCard key={drink.id} drink={drink} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold text-tea-dark">
          Locations{" "}
          <span className="text-sm font-normal text-tea/60">
            ({locations.length})
          </span>
        </h2>
        {locations.length === 0 ? (
          <p className="rounded-xl bg-white/60 p-4 text-sm text-tea">
            No locations on file.
          </p>
        ) : (
          <ul className="space-y-2">
            {locations.map((loc) => (
              <li
                key={loc.id}
                className="rounded-xl border border-tea/10 bg-white/70 p-3 text-sm"
              >
                <p className="font-medium text-tea-dark">{loc.city}</p>
                {loc.address && <p className="text-tea/70">{loc.address}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
