import { projects } from "@/content/projects";
import { ARCADE_GAME_IDS } from "@/lib/arcade/constants";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AdminDashboardMetrics = {
  arcadeGames: number;
  databaseAvailable: boolean;
  projects: number;
  scores: number | null;
  sessions: number | null;
};

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  try {
    const supabase = getSupabaseServerClient();
    const [scoresResult, sessionsResult] = await Promise.all([
      supabase.from("arcade_scores").select("id", { count: "exact", head: true }),
      supabase.from("arcade_sessions").select("id", { count: "exact", head: true }),
    ]);
    const databaseAvailable = !scoresResult.error && !sessionsResult.error;

    return {
      arcadeGames: ARCADE_GAME_IDS.length,
      databaseAvailable,
      projects: projects.length,
      scores: scoresResult.error ? null : scoresResult.count,
      sessions: sessionsResult.error ? null : sessionsResult.count,
    };
  } catch {
    return {
      arcadeGames: ARCADE_GAME_IDS.length,
      databaseAvailable: false,
      projects: projects.length,
      scores: null,
      sessions: null,
    };
  }
}
