import { revalidatePath } from "next/cache";

import { apiError, apiSuccess, methodNotAllowed } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import { sanitizeCloudinaryError } from "@/lib/media/cloudinary";
import {
  deleteProjectMediaAsset,
  ProjectMediaNotFoundError,
  ProjectMediaValidationError,
} from "@/lib/media/repository";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;

  try {
    const deleted = await deleteProjectMediaAsset(id, auth.user.email);
    revalidatePath("/");
    revalidatePath("/projetos");
    revalidatePath(`/projetos/${deleted.projectSlug}`);
    revalidatePath("/sitemap.xml");
    return apiSuccess({ deleted: true, projectSlug: deleted.projectSlug }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof ProjectMediaNotFoundError) {
      return apiError("NOT_FOUND", error.message, 404, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    if (error instanceof ProjectMediaValidationError) {
      return apiError("VALIDATION_ERROR", error.message, 400, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    return apiError("INTERNAL_ERROR", sanitizeCloudinaryError(error), 503, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}

export function GET() {
  return methodNotAllowed(["DELETE"]);
}
