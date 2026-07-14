import { revalidatePath } from "next/cache";

import { apiError, apiSuccess, methodNotAllowed, readJsonPayload } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import {
  importProjectJsonDrafts,
  previewProjectJsonImport,
  PROJECT_IMPORT_MAX_BYTES,
  ProjectJsonImportRequestSchema,
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
    return apiError("VALIDATION_ERROR", "Payload de importação inválido.", 400, {
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
      const result = await importProjectJsonDrafts(parsed.data.payload, auth.user.email);

      if (result.imported.length === 0) {
        return apiError("VALIDATION_ERROR", "Nenhum projeto válido e inédito para importar.", 400, {
          headers: noStoreHeaders(),
        });
      }

      revalidatePath("/");
      revalidatePath("/admin/projects");
      revalidatePath("/projetos");
      revalidatePath("/sitemap.xml");

      for (const imported of result.imported) {
        revalidatePath(`/admin/projects/${imported.slug}`);
        revalidatePath(`/projetos/${imported.slug}`);
      }

      return apiSuccess({
        imported: result.imported,
        preview: result.preview,
      }, {
        headers: noStoreHeaders(),
        status: result.preview.invalidCount > 0 ? 207 : 201,
      });
    }

    return apiError("VALIDATION_ERROR", "Modo de importação inválido.", 400, {
      headers: noStoreHeaders(),
    });
  } catch {
    return apiError("INTERNAL_ERROR", "Não foi possível importar projetos via JSON.", 503, {
      headers: noStoreHeaders(),
    });
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
