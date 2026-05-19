import { apiError, apiSuccess, methodNotAllowed, readJsonPayload, validationError } from "@/lib/api-response";
import { logLocalScore } from "@/lib/api-logging";
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

    logLocalScore(parsed.data);

    return apiSuccess(
      {
        accepted: true,
        mode: "local",
        game: parsed.data.game,
        score: parsed.data.score,
      },
      { status: 202 },
    );
  } catch {
    return apiError("INTERNAL_ERROR", "Não foi possível registrar o score agora.", 500);
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}

