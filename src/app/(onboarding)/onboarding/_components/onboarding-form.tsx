"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { completeOnboarding, type OnboardingState } from "../actions";

const initialState: OnboardingState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-tea px-4 py-2 font-medium text-milk hover:bg-tea-dark disabled:opacity-60"
    >
      {pending ? "Saving…" : "Finish"}
    </button>
  );
}

export default function OnboardingForm() {
  const [state, formAction] = useActionState(completeOnboarding, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-tea" htmlFor="username">
          Username <span className="text-red-600">*</span>
        </label>
        <div className="mt-1 flex items-center rounded-lg border border-tea/20 bg-white pl-3 focus-within:border-tea">
          <span className="text-tea/60">@</span>
          <input
            id="username"
            name="username"
            required
            pattern="[a-zA-Z0-9_]{3,20}"
            title="3–20 characters: letters, numbers, or underscores"
            className="w-full bg-transparent px-2 py-2 outline-none"
            placeholder="bobalover"
          />
        </div>
        <p className="mt-1 text-xs text-tea/60">
          Lowercase letters, numbers, underscores. 3–20 characters.
        </p>
      </div>

      <div>
        <label
          className="block text-sm font-medium text-tea"
          htmlFor="display_name"
        >
          Display name
        </label>
        <input
          id="display_name"
          name="display_name"
          className="mt-1 w-full rounded-lg border border-tea/20 bg-white px-3 py-2 outline-none focus:border-tea"
          placeholder="Boba Lover"
        />
      </div>

      <div>
        <label
          className="block text-sm font-medium text-tea"
          htmlFor="home_city"
        >
          Home city
        </label>
        <input
          id="home_city"
          name="home_city"
          className="mt-1 w-full rounded-lg border border-tea/20 bg-white px-3 py-2 outline-none focus:border-tea"
          placeholder="San Gabriel"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-tea" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          className="mt-1 w-full rounded-lg border border-tea/20 bg-white px-3 py-2 outline-none focus:border-tea"
          placeholder="50% sugar, less ice, extra boba."
        />
      </div>

      <SubmitButton />
    </form>
  );
}
