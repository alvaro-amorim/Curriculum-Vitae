import { projects } from "@/content/projects";
import { ARCADE_GAME_IDS } from "@/lib/arcade/constants";
import { getMongoCollections } from "@/lib/mongodb/collections";

export type AdminDashboardMetrics = {
  arcadeGames: number;
  databaseAvailable: boolean;
  projects: number;
  scores: number | null;
  sessions: number | null;
};

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  try {
    const { arcadeScores, arcadeSessions } = await getMongoCollections();
    const [scores, sessions] = await Promise.all([
      arcadeScores.countDocuments(),
      arcadeSessions.countDocuments(),
    ]);

    return {
      arcadeGames: ARCADE_GAME_IDS.length,
      databaseAvailable: true,
      projects: projects.length,
      scores,
      sessions,
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
