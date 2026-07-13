import { apiError, apiSuccess, methodNotAllowed, readJsonPayload, validationError } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import { AdminProjectMutationSchema } from "@/lib/projects/project-schema";
import { getAdminProjects, saveAdminProject } from "@/lib/projects/repository";

const ADMIN_PROJECT_MAX_BYTES = 64 * 1024;

export async function GET(request: Request) {
  const auth = await requireAdminApiUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const projects = await getAdminProjects();
    return apiSuccess({ projects }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Nao foi possivel carregar os projetos.",
      503,
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  const json = await readJsonPayload(request, ADMIN_PROJECT_MAX_BYTES);

  if (!json.ok) {
    return json.response;
  }

  const parsed = AdminProjectMutationSchema.safeParse(json.payload);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const project = await saveAdminProject(parsed.data, auth.user.email);
    return apiSuccess({ project }, { status: 201 });
  } catch (error) {
    return apiError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Nao foi possivel criar o projeto.",
      503,
    );
  }
}

export function PUT() {
  return methodNotAllowed(["GET", "POST"]);
}

export function DELETE() {
  return methodNotAllowed(["GET", "POST"]);
}
