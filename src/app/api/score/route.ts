import { cookies } from "next/headers";

import { apiError, apiSuccess, methodNotAllowed, readJsonPayload, validationError } from "@/lib/api-response";
import { resolveArcadeSessionContext } from "@/lib/arcade/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ScorePayloadSchema } from "@/lib/validators";

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
    const supabase = getSupabaseServerClient();
    const scorePayload = parsed.data;
    const { data: persistedScore, error: persistError } = await supabase
      .from("arcade_scores")
      .insert({
        contract_version: "v2",
        device_type: scorePayload.deviceType ?? "unknown",
        duration_ms: scorePayload.durationMs,
        game_id: scorePayload.game,
        game_version: scorePayload.gameVersion,
        metadata_json: scorePayload.metadata as Record<string, unknown>,
        player_alias: publicSession.alias,
        score: scorePayload.score,
        session_hash: sessionHash,
      })
      .select("id")
      .single();

    if (persistError || !persistedScore) {
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
      { status: 202 },
    );
  } catch {
    return apiError("INTERNAL_ERROR", "Nao foi possivel registrar o score agora.", 500);
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
