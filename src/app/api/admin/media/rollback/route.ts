import { apiError, apiSuccess, methodNotAllowed, readJsonPayload } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import {
  sanitizeCloudinaryError,
  verifyCloudinaryUploadResponseSignature,
} from "@/lib/media/cloudinary";
import { ProjectMediaRollbackPayloadSchema } from "@/lib/media/media-rules";
import {
  ProjectMediaValidationError,
  rollbackUnregisteredProjectMedia,
} from "@/lib/media/repository";

const ADMIN_MEDIA_ROLLBACK_MAX_BYTES = 8 * 1024;

export async function POST(request: Request) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  const json = await readJsonPayload(request, ADMIN_MEDIA_ROLLBACK_MAX_BYTES);

  if (!json.ok) {
    return json.response;
  }

  const parsed = ProjectMediaRollbackPayloadSchema.safeParse(json.payload);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Payload de rollback inválido.", 400, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    if (!verifyCloudinaryUploadResponseSignature(parsed.data)) {
      return apiError("VALIDATION_ERROR", "Assinatura de upload inválida.", 400, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    const rolledBack = await rollbackUnregisteredProjectMedia(parsed.data);

    return apiSuccess({
      projectSlug: rolledBack.projectSlug,
      rolledBack: true,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
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
  return methodNotAllowed(["POST"]);
}
