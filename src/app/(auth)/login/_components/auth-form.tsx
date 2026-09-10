"use client";

import { useState } from "react";
import { signIn, signUp } from "../actions";

export default function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="space-y-4">
      <div className="flex rounded-full bg-tea/10 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-full px-4 py-1.5 font-medium transition ${
            mode === "signin" ? "bg-white text-tea-dark shadow-sm" : "text-tea"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full px-4 py-1.5 font-medium transition ${
            mode === "signup" ? "bg-white text-tea-dark shadow-sm" : "text-tea"
          }`}
        >
          Create account
        </button>
      </div>

      <form
        action={mode === "signin" ? signIn : signUp}
        className="space-y-3"
      >
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="block text-sm font-medium text-tea" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-tea/20 bg-white px-3 py-2 outline-none focus:border-tea"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-tea"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            className="mt-1 w-full rounded-lg border border-tea/20 bg-white px-3 py-2 outline-none focus:border-tea"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-tea px-4 py-2 font-medium text-milk hover:bg-tea-dark"
        >
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
