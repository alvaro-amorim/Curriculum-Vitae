import { cookies } from "next/headers";

import { apiError, apiSuccess, methodNotAllowed, readJsonPayload, validationError } from "@/lib/api-response";
import { consumeArcadeRateLimit } from "@/lib/arcade/rate-limit";
import { resolveArcadeSessionContext } from "@/lib/arcade/session";
import { getMongoCollections } from "@/lib/mongodb/collections";
import { ScorePayloadSchema } from "@/lib/validators";

const SCORE_RATE_LIMIT = 12;
const SCORE_RATE_LIMIT_WINDOW_MS = 60_000;

function rateLimitHeaders({ limit, remaining, resetAt }: { limit: number; remaining: number; resetAt: number }) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1_000)),
  };
}

export async function POST(request: Request) {
  try {
    const json = await readJsonPayload(request);

    if (!json.ok) {
      return json.response;
    }

    const parsed = ScorePayloadSchema.safeParse(json.payload);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const cookieStore = await cookies();
    const { publicSession, sessionHash } = await resolveArcadeSessionContext(cookieStore);
    const rateLimit = consumeArcadeRateLimit({
      key: `score:${sessionHash}`,
      limit: SCORE_RATE_LIMIT,
      windowMs: SCORE_RATE_LIMIT_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      return apiError("RATE_LIMITED", "Muitas tentativas de score. Aguarde alguns segundos.", 429, {
        headers: {
          ...rateLimitHeaders(rateLimit),
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      });
    }

    const { arcadeScores } = await getMongoCollections();
    const scorePayload = parsed.data;
    const persistResult = await arcadeScores.insertOne({
      contractVersion: "v2",
      createdAt: new Date(),
      deviceType: scorePayload.deviceType ?? "unknown",
      durationMs: scorePayload.durationMs,
      gameId: scorePayload.game,
      gameVersion: scorePayload.gameVersion,
      metadata: scorePayload.metadata as Record<string, unknown>,
      playerAlias: publicSession.alias,
      score: scorePayload.score,
      sessionHash,
    });

    if (!persistResult.acknowledged || !persistResult.insertedId) {
      return apiError("INTERNAL_ERROR", "Nao foi possivel persistir o score agora.", 500);
    }

    return apiSuccess(
      {
        accepted: true,
        contractVersion: "v2",
        game: scorePayload.game,
        mode: "persistent",
        score: scorePayload.score,
      },
      {
        headers: rateLimitHeaders(rateLimit),
        status: 202,
      },
    );
  } catch {
    return apiError("INTERNAL_ERROR", "Nao foi possivel registrar o score agora.", 500);
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
