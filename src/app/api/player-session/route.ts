import { cookies } from "next/headers";

import { apiError, apiSuccess, methodNotAllowed, readJsonPayload, validationError } from "@/lib/api-response";
import { getOrCreateArcadeSessionCookie, hashArcadeSessionId, upsertArcadeSession, validatePlayerAlias } from "@/lib/arcade/session";
import { PlayerSessionPayloadSchema } from "@/lib/validators";

async function getPublicArcadeSession(alias?: string | null, updateAlias = false) {
  const cookieStore = await cookies();
  const rawSessionId = getOrCreateArcadeSessionCookie(cookieStore);
  const sessionHash = hashArcadeSessionId(rawSessionId);

  return upsertArcadeSession({
    alias,
    sessionHash,
    updateAlias,
  });
}

export async function GET() {
  try {
    const publicSession = await getPublicArcadeSession();

    return apiSuccess(publicSession);
  } catch {
    return apiError("INTERNAL_ERROR", "Nao foi possivel preparar a sessao do Arcade agora.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const json = await readJsonPayload(request);

    if (!json.ok) {
      return json.response;
    }

    const parsed = PlayerSessionPayloadSchema.safeParse(json.payload);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const aliasResult = validatePlayerAlias(parsed.data.alias);

    if (!aliasResult.ok) {
      return apiError("VALIDATION_ERROR", aliasResult.message, 400);
    }

    const publicSession = await getPublicArcadeSession(aliasResult.alias, true);

    return apiSuccess(publicSession);
  } catch {
    return apiError("INTERNAL_ERROR", "Nao foi possivel atualizar a sessao do Arcade agora.", 500);
  }
}

export function PUT() {
  return methodNotAllowed(["GET", "POST"]);
}

export function DELETE() {
  return methodNotAllowed(["GET", "POST"]);
}
