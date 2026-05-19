import { apiError, apiSuccess, methodNotAllowed, readJsonPayload, validationError } from "@/lib/api-response";
import { logLocalAnalytics } from "@/lib/api-logging";
import { AnalyticsPayloadSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await readJsonPayload(request);

    if (!json.ok) {
      return json.response;
    }

    const parsed = AnalyticsPayloadSchema.safeParse(json.payload);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    logLocalAnalytics(parsed.data);

    return apiSuccess({
      accepted: true,
      mode: "local",
      event: parsed.data.event,
    });
  } catch {
    return apiError("INTERNAL_ERROR", "Não foi possível registrar o evento agora.", 500);
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}

