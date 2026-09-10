"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint } from "@/lib/logs";

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
  }, [map, points]);
  return null;
}

export default function LeafletMap({ points }: { points: MapPoint[] }) {
  // Center falls back to a sensible default; FitBounds overrides when there
  // are points.
  const center: [number, number] = points.length
    ? [points[0].lat, points[0].lng]
    : [34.05, -118.24];

  return (
    <MapContainer
      center={center}
      zoom={11}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <CircleMarker
          key={p.logId}
          center={[p.lat, p.lng]}
          radius={8}
          pathOptions={{
            color: "#5a3417",
            fillColor: "#7a4a24",
            fillOpacity: 0.85,
            weight: 2,
          }}
        >
          <Popup>
            <strong>{p.drinkName}</strong>
            <br />
            {p.shopName}
            {p.city ? ` · ${p.city}` : ""}
            {p.rating != null && (
              <>
                <br />
                {(p.rating / 2).toFixed(1)} / 5
              </>
            )}
          </Popup>
        </CircleMarker>
      ))}
      <FitBounds points={points} />
    </MapContainer>
  );
}
