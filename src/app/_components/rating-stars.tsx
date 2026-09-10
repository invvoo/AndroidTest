/**
 * Read-only rating display. `value` is the stored half-star scale (1–10);
 * 10 = five full stars. Renders gold stars clipped over grey ones so halves
 * show precisely. No interactivity — safe in a Server Component.
 */
export default function RatingStars({
  value,
  showNumber = true,
  className = "",
}: {
  value: number | null;
  showNumber?: boolean;
  className?: string;
}) {
  if (value == null) {
    return <span className={`text-sm text-tea/50 ${className}`}>Not rated</span>;
  }
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="relative inline-block leading-none" aria-hidden>
        <span className="text-tea/25">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden text-tea"
          style={{ width: `${pct}%` }}
        >
          ★★★★★
        </span>
      </span>
      {showNumber && (
        <span className="text-sm text-tea/80">{(value / 2).toFixed(1)}</span>
      )}
      <span className="sr-only">{value / 2} out of 5 stars</span>
    </span>
  );
}
