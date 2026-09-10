import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/profile";
import { getDrink } from "@/lib/logs";
import { getShopLocations } from "@/lib/catalog";
import LogForm from "./_components/log-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drink = await getDrink(id);
  return { title: drink ? `Log ${drink.name} — Boba` : "Log — Boba" };
}

export default async function LogDrinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drink = await getDrink(id);
  if (!drink) notFound();

  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) redirect(`/login?next=/drinks/${id}/log`);
  if (!profile) redirect("/onboarding");

  const locations = drink.shops
    ? await getShopLocations(drink.shops.id)
    : [];

  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href={`/drinks/${drink.id}`}
        className="text-sm text-tea hover:underline"
      >
        ← {drink.name}
      </Link>

      <div className="mt-3 rounded-2xl bg-white/70 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-tea-dark">Log this drink</h1>
        <p className="mt-1 text-sm text-tea">
          {drink.name}
          {drink.shops ? ` · ${drink.shops.name}` : ""}
        </p>

        <div className="mt-6">
          <LogForm
            drinkId={drink.id}
            today={today}
            locations={locations.map((l) => ({
              id: l.id,
              city: l.city,
              address: l.address,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
