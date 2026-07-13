import { apiError, apiSuccess, methodNotAllowed, readJsonPayload, validationError } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import { AdminProjectMutationSchema } from "@/lib/projects/project-schema";
import {
  archiveAdminProject,
  getAdminProjectBySlug,
  getProjectRevisions,
  saveAdminProject,
} from "@/lib/projects/repository";

const ADMIN_PROJECT_MAX_BYTES = 64 * 1024;

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireAdminApiUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { slug } = await context.params;

  try {
    const [project, revisions] = await Promise.all([
      getAdminProjectBySlug(slug),
      getProjectRevisions(slug),
    ]);

    if (!project) {
      return apiError("NOT_FOUND", "Projeto nao encontrado.", 404);
    }

    return apiSuccess({ project, revisions }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Nao foi possivel carregar o projeto.",
      503,
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  const { slug } = await context.params;
  const json = await readJsonPayload(request, ADMIN_PROJECT_MAX_BYTES);

  if (!json.ok) {
    return json.response;
  }

  const parsed = AdminProjectMutationSchema.safeParse(json.payload);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  if (parsed.data.project.slug !== slug) {
    return apiError("VALIDATION_ERROR", "O slug nao pode ser alterado nesta edicao.", 400);
  }

  try {
    const existingProject = await getAdminProjectBySlug(slug);

    if (!existingProject) {
      return apiError("NOT_FOUND", "Projeto nao encontrado.", 404);
    }

    const project = await saveAdminProject(parsed.data, auth.user.email);
    return apiSuccess({ project });
  } catch (error) {
    return apiError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Nao foi possivel atualizar o projeto.",
      503,
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  const { slug } = await context.params;

  try {
    const existingProject = await getAdminProjectBySlug(slug);

    if (!existingProject) {
      return apiError("NOT_FOUND", "Projeto nao encontrado.", 404);
    }

    await archiveAdminProject(slug, auth.user.email);
    return apiSuccess({ archived: true, slug });
  } catch (error) {
    return apiError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Nao foi possivel arquivar o projeto.",
      503,
    );
  }
}

export function POST() {
  return methodNotAllowed(["GET", "PUT", "DELETE"]);
}
