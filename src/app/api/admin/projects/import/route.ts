import { apiError, apiSuccess, methodNotAllowed } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import { importStaticProjects } from "@/lib/projects/repository";

export async function POST(request: Request) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const imported = await importStaticProjects(auth.user.email);
    return apiSuccess({ imported });
  } catch (error) {
    return apiError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Nao foi possivel importar o catalogo.",
      503,
    );
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
