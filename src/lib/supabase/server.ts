import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type ArcadeDatabase = {
  public: {
    Tables: {
      arcade_sessions: {
        Insert: {
          alias?: string | null;
          last_seen_at?: string;
          session_hash: string;
        };
        Row: {
          alias: string | null;
          created_at: string;
          id: string;
          last_seen_at: string;
          session_hash: string;
        };
        Update: {
          alias?: string | null;
          last_seen_at?: string;
        };
        Relationships: [];
      };
      arcade_scores: {
        Insert: {
          contract_version?: "v2";
          device_type?: "desktop" | "mobile" | "unknown";
          duration_ms: number;
          game_id: "runtime" | "bug-maze" | "code-snake" | "stack-tetris";
          game_version: string;
          metadata_json: Record<string, unknown>;
          player_alias?: string | null;
          score: number;
          session_hash: string;
        };
        Row: {
          contract_version: string;
          created_at: string;
          device_type: string;
          duration_ms: number;
          game_id: string;
          game_version: string;
          id: string;
          metadata_json: Record<string, unknown>;
          player_alias: string | null;
          score: number;
          session_hash: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let supabaseServerClient: SupabaseClient<ArcadeDatabase> | null = null;

function readServerEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseServerClient() {
  if (supabaseServerClient) {
    return supabaseServerClient;
  }

  supabaseServerClient = createClient<ArcadeDatabase>(
    readServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    readServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "alvaro-portfolio-arcade-server",
        },
      },
    },
  );

  return supabaseServerClient;
}
