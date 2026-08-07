import { revalidatePath } from "next/cache";

import { apiError, apiSuccess, methodNotAllowed } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import {
  deleteAdminProjectPermanently,
  ProjectNotFoundError,
} from "@/lib/projects/repository";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function revalidateProjectSurfaces(slug: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${slug}`);
  revalidatePath("/curriculo");
  revalidatePath("/projetos");
  revalidatePath(`/projetos/${slug}`);
  revalidatePath("/sitemap.xml");
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  const { slug } = await context.params;

  try {
    const result = await deleteAdminProjectPermanently(slug);
    revalidateProjectSurfaces(slug);
    return apiSuccess({
      deleted: true,
      deletedMediaAssets: result.deletedMediaAssets,
      slug,
    });
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      return apiError("NOT_FOUND", error.message, 404);
    }

    return apiError(
      "INTERNAL_ERROR",
      "Não foi possível excluir o projeto permanentemente.",
      503,
    );
  }
}

export function GET() {
  return methodNotAllowed(["DELETE"]);
}

export function POST() {
  return methodNotAllowed(["DELETE"]);
}

export function PUT() {
  return methodNotAllowed(["DELETE"]);
}
