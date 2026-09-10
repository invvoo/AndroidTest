"use client";

import { useState } from "react";

/**
 * Half-star picker. Value is the stored 1–10 scale (10 = 5 stars, each
 * click target is half a star). Writes to a hidden input named `rating`;
 * empty = not rated. Interactive, so it's a client component — but the form
 * itself still posts to a server action.
 */
export default function RatingInput({ name = "rating" }: { name?: string }) {
  const [value, setValue] = useState(0); // 0 = unrated
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex text-3xl leading-none"
        onMouseLeave={() => setHover(0)}
        role="radiogroup"
        aria-label="Rating"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const full = shown >= star * 2;
          const half = !full && shown >= star * 2 - 1;
          return (
            <span key={star} className="relative inline-block w-8">
              <span className="text-tea/25">★</span>
              <span
                className="absolute inset-0 overflow-hidden text-tea"
                style={{ width: full ? "100%" : half ? "50%" : "0%" }}
              >
                ★
              </span>
              {/* two hit targets per star: left = half, right = full */}
              <button
                type="button"
                aria-label={`${star * 2 - 1} half-stars`}
                className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
                onMouseEnter={() => setHover(star * 2 - 1)}
                onClick={() => setValue(star * 2 - 1)}
              />
              <button
                type="button"
                aria-label={`${star} stars`}
                className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
                onMouseEnter={() => setHover(star * 2)}
                onClick={() => setValue(star * 2)}
              />
            </span>
          );
        })}
      </div>

      <span className="text-sm text-tea/70">
        {value ? `${(value / 2).toFixed(1)} / 5` : "not rated"}
      </span>
      {value > 0 && (
        <button
          type="button"
          onClick={() => setValue(0)}
          className="text-xs text-tea/50 underline hover:text-tea"
        >
          clear
        </button>
      )}

      <input type="hidden" name={name} value={value || ""} />
    </div>
  );
}
