import { projects } from "@/content/projects";
import { ARCADE_GAME_IDS } from "@/lib/arcade/constants";
import { getMongoCollections } from "@/lib/mongodb/collections";

export type AdminDashboardMetrics = {
  arcadeGames: number;
  databaseAvailable: boolean;
  projectDatabaseAvailable: boolean;
  projects: number;
  scores: number | null;
  sessions: number | null;
};

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  try {
    const { arcadeScores, arcadeSessions, portfolioProjects } = await getMongoCollections();
    const [scores, sessions, projectCount] = await Promise.all([
      arcadeScores.countDocuments(),
      arcadeSessions.countDocuments(),
      portfolioProjects.countDocuments(),
    ]);

    return {
      arcadeGames: ARCADE_GAME_IDS.length,
      databaseAvailable: true,
      projectDatabaseAvailable: true,
      projects: projectCount > 0 ? projectCount : projects.length,
      scores,
      sessions,
    };
  } catch {
    return {
      arcadeGames: ARCADE_GAME_IDS.length,
      databaseAvailable: false,
      projectDatabaseAvailable: false,
      projects: projects.length,
      scores: null,
      sessions: null,
    };
  }
}
