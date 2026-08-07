import { revalidatePath } from "next/cache";

import { apiError, apiSuccess, methodNotAllowed, readJsonPayload } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import {
  previewProjectJsonImport,
  PROJECT_IMPORT_MAX_BYTES,
  ProjectJsonImportRequestSchema,
  syncProjectJsonProjects,
} from "@/lib/projects/project-import";

const ADMIN_PROJECT_IMPORT_MAX_BYTES = PROJECT_IMPORT_MAX_BYTES + 8 * 1024;

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store",
  };
}

export async function POST(request: Request) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  const json = await readJsonPayload(request, ADMIN_PROJECT_IMPORT_MAX_BYTES);

  if (!json.ok) {
    return json.response;
  }

  const parsed = ProjectJsonImportRequestSchema.safeParse(json.payload);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Payload de sincronização inválido.", 400, {
      headers: noStoreHeaders(),
    });
  }

  try {
    if (parsed.data.mode === "validate") {
      const preview = await previewProjectJsonImport(parsed.data.payload);

      return apiSuccess({ preview }, {
        headers: noStoreHeaders(),
      });
    }

    if (parsed.data.mode === "import") {
      const result = await syncProjectJsonProjects(parsed.data.payload, auth.user.email);

      if (result.preview.invalidCount > 0 || result.synced.length === 0) {
        return apiError("VALIDATION_ERROR", "Nenhum projeto válido para sincronizar.", 400, {
          headers: noStoreHeaders(),
        });
      }

      revalidatePath("/");
      revalidatePath("/curriculo");
      revalidatePath("/admin");
      revalidatePath("/admin/projects");
      revalidatePath("/projetos");
      revalidatePath("/sitemap.xml");

      for (const project of result.synced) {
        revalidatePath(`/admin/projects/${project.slug}`);
        revalidatePath(`/projetos/${project.slug}`);
      }

      return apiSuccess({
        preview: result.preview,
        synced: result.synced,
      }, {
        headers: noStoreHeaders(),
        status: 200,
      });
    }

    return apiError("VALIDATION_ERROR", "Modo de sincronização inválido.", 400, {
      headers: noStoreHeaders(),
    });
  } catch {
    return apiError("INTERNAL_ERROR", "Não foi possível sincronizar os projetos via JSON.", 503, {
      headers: noStoreHeaders(),
    });
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
