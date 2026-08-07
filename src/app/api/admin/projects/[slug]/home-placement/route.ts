import { revalidatePath } from "next/cache";

import { apiError, apiSuccess, methodNotAllowed, readJsonPayload, validationError } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import { ProjectPresentationSchema } from "@/lib/projects/project-schema";
import {
  ProjectNotFoundError,
  updateAdminProjectHomePlacement,
} from "@/lib/projects/repository";

const HOME_PLACEMENT_MAX_BYTES = 8 * 1024;

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  const { slug } = await context.params;
  const json = await readJsonPayload(request, HOME_PLACEMENT_MAX_BYTES);

  if (!json.ok) {
    return json.response;
  }

  const parsed = ProjectPresentationSchema.safeParse(json.payload);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  try {
    const project = await updateAdminProjectHomePlacement(
      slug,
      parsed.data,
      auth.user.email,
    );

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${slug}`);
    revalidatePath("/curriculo");
    revalidatePath("/projetos");
    revalidatePath(`/projetos/${slug}`);
    revalidatePath("/sitemap.xml");

    return apiSuccess({ project });
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      return apiError("NOT_FOUND", error.message, 404);
    }

    return apiError("INTERNAL_ERROR", "Não foi possível atualizar a apresentação pública.", 503);
  }
}

export function GET() {
  return methodNotAllowed(["PUT"]);
}

export function POST() {
  return methodNotAllowed(["PUT"]);
}

export function DELETE() {
  return methodNotAllowed(["PUT"]);
}
