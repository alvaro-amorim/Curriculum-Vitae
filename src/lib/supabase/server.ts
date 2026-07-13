import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type PortfolioDatabase = {
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
      portfolio_projects: {
        Insert: {
          content: Record<string, unknown>;
          publication_status?: "draft" | "published" | "archived";
          published_at?: string | null;
          slug: string;
          sort_order?: number;
          updated_by?: string | null;
        };
        Row: {
          content: Record<string, unknown>;
          created_at: string;
          id: string;
          publication_status: "draft" | "published" | "archived";
          published_at: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
        };
        Update: {
          content?: Record<string, unknown>;
          publication_status?: "draft" | "published" | "archived";
          published_at?: string | null;
          slug?: string;
          sort_order?: number;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      portfolio_project_revisions: {
        Insert: {
          action: "update" | "delete";
          changed_by?: string | null;
          content: Record<string, unknown>;
          project_id: string;
          publication_status: "draft" | "published" | "archived";
          slug: string;
          sort_order: number;
        };
        Row: {
          action: "update" | "delete";
          changed_at: string;
          changed_by: string | null;
          content: Record<string, unknown>;
          id: number;
          project_id: string;
          publication_status: "draft" | "published" | "archived";
          slug: string;
          sort_order: number;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_arcade_leaderboard: {
        Args: {
          p_game_id: "runtime" | "bug-maze" | "code-snake" | "stack-tetris";
          p_limit: number;
          p_period: "all" | "month" | "week";
        };
        Returns: {
          alias: string;
          created_at: string;
          score: number;
        }[];
      };
      get_arcade_player_rankings: {
        Args: {
          p_session_hash: string;
        };
        Returns: {
          created_at: string;
          game_id: "runtime" | "bug-maze" | "code-snake" | "stack-tetris";
          rank: number;
          score: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let supabaseServerClient: SupabaseClient<PortfolioDatabase> | null = null;

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

  supabaseServerClient = createClient<PortfolioDatabase>(
    readServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    readServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "alvaro-portfolio-server",
        },
      },
    },
  );

  return supabaseServerClient;
}
