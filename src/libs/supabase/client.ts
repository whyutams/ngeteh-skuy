import { createBrowserClient } from "@supabase/ssr";

// Inisialisasi klien Supabase sisi browser
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}

