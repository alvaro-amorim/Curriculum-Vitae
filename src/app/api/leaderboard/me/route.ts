import { cookies } from "next/headers";

import { apiError, apiSuccess, methodNotAllowed } from "@/lib/api-response";
import { getPlayerLeaderboard } from "@/lib/arcade/leaderboard";
import { resolveArcadeSessionContext } from "@/lib/arcade/session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const { publicSession, sessionHash } = await resolveArcadeSessionContext(cookieStore);
    const leaderboard = await getPlayerLeaderboard({
      alias: publicSession.alias,
      sessionHash,
    });

    return apiSuccess(leaderboard);
  } catch {
    return apiError("INTERNAL_ERROR", "Nao foi possivel carregar sua posicao no leaderboard agora.", 500);
  }
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
