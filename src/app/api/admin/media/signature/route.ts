import { apiError, apiSuccess, methodNotAllowed, readJsonPayload } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import { createSignedProjectMediaUpload, sanitizeCloudinaryError } from "@/lib/media/cloudinary";
import { ProjectMediaSignaturePayloadSchema } from "@/lib/media/media-rules";

const ADMIN_MEDIA_SIGNATURE_MAX_BYTES = 4 * 1024;

export async function POST(request: Request) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  const json = await readJsonPayload(request, ADMIN_MEDIA_SIGNATURE_MAX_BYTES);

  if (!json.ok) {
    return json.response;
  }

  const parsed = ProjectMediaSignaturePayloadSchema.safeParse(json.payload);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Payload de assinatura inválido.", 400, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    return apiSuccess(
      {
        upload: createSignedProjectMediaUpload(parsed.data),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return apiError("VALIDATION_ERROR", sanitizeCloudinaryError(error), 400, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
