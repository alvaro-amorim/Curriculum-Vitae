import { apiError } from "@/lib/api-response";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { isSameOriginAdminRequest } from "@/lib/admin/auth-rules";

export async function requireAdminApiUser(request: Request, options?: { mutation?: boolean }) {
  if (options?.mutation && !isSameOriginAdminRequest(request.url, request.headers.get("origin"))) {
    return {
      ok: false as const,
      response: apiError("FORBIDDEN", "Origem da requisicao invalida.", 403),
    };
  }

  const user = await getCurrentAdminUser();

  if (!user) {
    return {
      ok: false as const,
      response: apiError("UNAUTHORIZED", "Sessao administrativa invalida ou expirada.", 401),
    };
  }

  return {
    ok: true as const,
    user,
  };
}
