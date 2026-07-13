import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseAuthClient: SupabaseClient | null = null;

function readServerEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_ANON_KEY") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseAuthClient() {
  if (supabaseAuthClient) {
    return supabaseAuthClient;
  }

  supabaseAuthClient = createClient(
    readServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    readServerEnv("SUPABASE_ANON_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "alvaro-portfolio-admin-server",
        },
      },
    },
  );

  return supabaseAuthClient;
}
