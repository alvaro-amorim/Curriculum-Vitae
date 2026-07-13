import { createClient } from "@supabase/supabase-js";

function readServerEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_ANON_KEY") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseAuthClient() {
  return createClient(
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
}
