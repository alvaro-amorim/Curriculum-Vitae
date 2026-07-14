import { methodNotAllowed } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import { buildProjectImportTemplateResponse } from "@/lib/projects/project-import";

export async function GET(request: Request) {
  const auth = await requireAdminApiUser(request);

  if (!auth.ok) {
    return auth.response;
  }

  return buildProjectImportTemplateResponse();
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
