"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createLog, type LogFormState } from "../actions";
import RatingInput from "./rating-input";

const SUGAR_OPTIONS = [0, 25, 50, 75, 100, 125];
const ICE_OPTIONS = [
  { value: "regular", label: "Regular" },
  { value: "less", label: "Less" },
  { value: "none", label: "None" },
  { value: "extra", label: "Extra" },
];
const TOPPINGS = [
  "boba / pearls",
  "mini pearls",
  "pudding",
  "grass jelly",
  "aloe",
  "lychee jelly",
  "red bean",
  "cheese foam",
  "crystal boba",
];

const initialState: LogFormState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-tea px-4 py-2.5 font-medium text-milk hover:bg-tea-dark disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save log"}
    </button>
  );
}

export default function LogForm({
  drinkId,
  today,
  locations,
}: {
  drinkId: string;
  today: string;
  locations: { id: string; city: string; address: string | null }[];
}) {
  const [state, formAction] = useActionState(createLog, initialState);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="drink_id" value={drinkId} />

      {state.error && (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-tea">Rating</label>
        <div className="mt-1">
          <RatingInput />
        </div>
      </div>

      {/* Review */}
      <div>
        <label className="block text-sm font-medium text-tea" htmlFor="review">
          Review
        </label>
        <textarea
          id="review"
          name="review"
          rows={4}
          className="mt-1 w-full rounded-lg border border-tea/20 bg-white px-3 py-2 outline-none focus:border-tea"
          placeholder="How was it?"
        />
      </div>

      {/* Date */}
      <div>
        <label
          className="block text-sm font-medium text-tea"
          htmlFor="drank_on"
        >
          When did you drink it?
        </label>
        <input
          id="drank_on"
          name="drank_on"
          type="date"
          defaultValue={today}
          max={today}
          className="mt-1 rounded-lg border border-tea/20 bg-white px-3 py-2 outline-none focus:border-tea"
        />
      </div>

      {/* Customization */}
      <fieldset className="space-y-4 rounded-xl border border-tea/15 p-4">
        <legend className="px-1 text-sm font-semibold text-tea-dark">
          Your order
        </legend>

        <div className="flex flex-wrap gap-4">
          <div>
            <label
              className="block text-sm font-medium text-tea"
              htmlFor="sugar_pct"
            >
              Sugar
            </label>
            <select
              id="sugar_pct"
              name="sugar_pct"
              defaultValue=""
              className="mt-1 rounded-lg border border-tea/20 bg-white px-3 py-2 outline-none focus:border-tea"
            >
              <option value="">—</option>
              {SUGAR_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-tea"
              htmlFor="ice_level"
            >
              Ice
            </label>
            <select
              id="ice_level"
              name="ice_level"
              defaultValue=""
              className="mt-1 rounded-lg border border-tea/20 bg-white px-3 py-2 outline-none focus:border-tea"
            >
              <option value="">—</option>
              {ICE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-tea"
              htmlFor="price"
            >
              Price ($)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="5.75"
              className="mt-1 w-28 rounded-lg border border-tea/20 bg-white px-3 py-2 outline-none focus:border-tea"
            />
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-tea">Toppings</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {TOPPINGS.map((t) => (
              <label
                key={t}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-tea/20 bg-white px-3 py-1 text-sm text-tea has-[:checked]:border-tea has-[:checked]:bg-tea/10"
              >
                <input
                  type="checkbox"
                  name="toppings"
                  value={t}
                  className="accent-tea"
                />
                {t}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      {/* Location */}
      {locations.length > 0 && (
        <div>
          <label
            className="block text-sm font-medium text-tea"
            htmlFor="location_id"
          >
            Where? (optional)
          </label>
          <select
            id="location_id"
            name="location_id"
            defaultValue=""
            className="mt-1 w-full rounded-lg border border-tea/20 bg-white px-3 py-2 outline-none focus:border-tea"
          >
            <option value="">—</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.city}
                {loc.address ? ` — ${loc.address}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Photo */}
      <div>
        <label className="block text-sm font-medium text-tea" htmlFor="photo">
          Photo (optional)
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPhotoPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="mt-1 block w-full text-sm text-tea file:mr-3 file:rounded-full file:border-0 file:bg-tea file:px-4 file:py-1.5 file:text-milk"
        />
        {photoPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoPreview}
            alt="Selected photo preview"
            className="mt-3 max-h-56 rounded-lg object-cover"
          />
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
