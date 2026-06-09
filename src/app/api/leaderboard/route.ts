import { apiError, apiSuccess, methodNotAllowed, validationError } from "@/lib/api-response";
import { getLeaderboardEntries } from "@/lib/arcade/leaderboard";
import { LeaderboardGameSchema, LeaderboardLimitSchema, LeaderboardPeriodSchema } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const game = LeaderboardGameSchema.safeParse(searchParams.get("game"));
    const period = LeaderboardPeriodSchema.safeParse(searchParams.get("period") ?? undefined);
    const limit = LeaderboardLimitSchema.safeParse(searchParams.get("limit") ?? undefined);

    if (!game.success) {
      return validationError(game.error);
    }

    if (!period.success) {
      return validationError(period.error);
    }

    if (!limit.success) {
      return validationError(limit.error);
    }

    const leaderboard = await getLeaderboardEntries({
      game: game.data,
      limit: limit.data,
      period: period.data,
    });

    return apiSuccess({
      game: game.data,
      leaderboard,
      period: period.data,
    });
  } catch {
    return apiError("INTERNAL_ERROR", "Nao foi possivel carregar o leaderboard agora.", 500);
  }
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
