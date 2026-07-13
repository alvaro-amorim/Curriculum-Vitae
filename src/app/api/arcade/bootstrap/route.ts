import { cookies } from "next/headers";

import { apiError, apiSuccess, methodNotAllowed } from "@/lib/api-response";
import { getArcadeBootstrapData } from "@/lib/arcade/bootstrap";
import { resolveArcadeSessionContext } from "@/lib/arcade/session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const { publicSession, sessionHash } = await resolveArcadeSessionContext(cookieStore);
    const bootstrap = await getArcadeBootstrapData({
      alias: publicSession.alias,
      sessionHash,
    });

    return apiSuccess({
      ...bootstrap,
      session: publicSession,
    });
  } catch {
    return apiError("INTERNAL_ERROR", "Nao foi possivel preparar o Arcade agora.", 500);
  }
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
