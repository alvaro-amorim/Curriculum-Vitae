import { revalidatePath } from "next/cache";

import { apiError, apiSuccess, methodNotAllowed } from "@/lib/api-response";
import { requireAdminApiUser } from "@/lib/admin/api-auth";
import { importStaticProjects } from "@/lib/projects/repository";

export async function POST(request: Request) {
  const auth = await requireAdminApiUser(request, { mutation: true });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const imported = await importStaticProjects(auth.user.email);
    revalidatePath("/projetos");
    revalidatePath("/sitemap.xml");
    return apiSuccess({ imported });
  } catch {
    return apiError("INTERNAL_ERROR", "Não foi possível importar o catálogo.", 503);
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
