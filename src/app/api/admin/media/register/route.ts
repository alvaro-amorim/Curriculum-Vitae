import { apiError, apiSuccess, methodNotAllowed, readJsonPayload } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import {
  sanitizeCloudinaryError,
  verifyCloudinaryUploadResponseSignature,
} from "@/lib/media/cloudinary";
import { ProjectMediaRegisterPayloadSchema } from "@/lib/media/media-rules";
import {
  ProjectMediaNotFoundError,
  ProjectMediaValidationError,
  registerProjectMediaAsset,
} from "@/lib/media/repository";

const ADMIN_MEDIA_REGISTER_MAX_BYTES = 8 * 1024;

export async function POST(request: Request) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  const json = await readJsonPayload(request, ADMIN_MEDIA_REGISTER_MAX_BYTES);

  if (!json.ok) {
    return json.response;
  }

  const parsed = ProjectMediaRegisterPayloadSchema.safeParse(json.payload);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Payload de imagem inválido.", 400, {
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

    const asset = await registerProjectMediaAsset({
      createdBy: auth.user.email,
      image: parsed.data,
      projectSlug: parsed.data.projectSlug,
    });

    return apiSuccess({ asset }, {
      headers: {
        "Cache-Control": "no-store",
      },
      status: 201,
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
  return methodNotAllowed(["POST"]);
}
