import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/db";

/**
 * Browser (anon) client. Per CLAUDE.md this is for auth + realtime only —
 * do not run catalog/data queries from the browser; those belong in Server
 * Components and Route Handlers.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
