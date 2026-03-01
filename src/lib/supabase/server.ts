import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using the anon key.
// Use this for reads that respect RLS (or when RLS is open for MVP).
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
