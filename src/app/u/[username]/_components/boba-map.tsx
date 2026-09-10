"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "@/lib/logs";

// Leaflet touches `window`, so load it only on the client.
const LeafletMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-tea/60">
      Loading map…
    </div>
  ),
});

export default function BobaMap({ points }: { points: MapPoint[] }) {
  return (
    <div className="h-80 overflow-hidden rounded-xl border border-tea/10">
      <LeafletMap points={points} />
    </div>
  );
}
