import { revalidatePath } from "next/cache";

import { apiError, apiSuccess, methodNotAllowed, readJsonPayload, validationError } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import { AdminProjectMutationSchema } from "@/lib/projects/project-schema";
import {
  archiveAdminProject,
  getAdminProjectBySlug,
  getProjectRevisions,
  ProjectNotFoundError,
  updateAdminProject,
} from "@/lib/projects/repository";

const ADMIN_PROJECT_MAX_BYTES = 64 * 1024;

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function revalidatePublicProject(slug: string) {
  revalidatePath("/");
  revalidatePath("/projetos");
  revalidatePath(`/projetos/${slug}`);
  revalidatePath("/sitemap.xml");
}

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
      return apiError("NOT_FOUND", "Projeto não encontrado.", 404);
    }

    return apiSuccess({ project, revisions }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return apiError("INTERNAL_ERROR", "Não foi possível carregar o projeto.", 503);
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
    return apiError("VALIDATION_ERROR", "O slug não pode ser alterado nesta edição.", 400);
  }

  try {
    const project = await updateAdminProject(parsed.data, auth.user.email);
    revalidatePublicProject(slug);
    return apiSuccess({ project });
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      return apiError("NOT_FOUND", error.message, 404);
    }

    return apiError("INTERNAL_ERROR", "Não foi possível atualizar o projeto.", 503);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  const { slug } = await context.params;

  try {
    await archiveAdminProject(slug, auth.user.email);
    revalidatePublicProject(slug);
    return apiSuccess({ archived: true, slug });
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      return apiError("NOT_FOUND", error.message, 404);
    }

    return apiError("INTERNAL_ERROR", "Não foi possível arquivar o projeto.", 503);
  }
}

export function POST() {
  return methodNotAllowed(["GET", "PUT", "DELETE"]);
}
