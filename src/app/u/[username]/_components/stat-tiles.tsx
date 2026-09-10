import type { UserStats } from "@/lib/logs";

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-tea/10 bg-white/70 p-4 text-center">
      <div className="text-2xl font-bold text-tea-dark">{value}</div>
      <div className="mt-0.5 text-xs uppercase tracking-wide text-tea/60">
        {label}
      </div>
    </div>
  );
}

export default function StatTiles({ stats }: { stats: UserStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Tile label="Logs" value={stats.totalLogs} />
      <Tile label="Drinks" value={stats.uniqueDrinks} />
      <Tile label="Shops" value={stats.uniqueShops} />
      <Tile
        label="Avg rating"
        value={stats.avgRating != null ? (stats.avgRating / 2).toFixed(1) : "—"}
      />
    </div>
  );
}
