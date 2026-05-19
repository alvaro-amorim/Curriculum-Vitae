import { apiError, apiSuccess, methodNotAllowed, readJsonPayload, validationError } from "@/lib/api-response";
import { logLocalContact } from "@/lib/api-logging";
import { ContactPayloadSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await readJsonPayload(request);

    if (!json.ok) {
      return json.response;
    }

    const parsed = ContactPayloadSchema.safeParse(json.payload);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    logLocalContact(parsed.data);

    return apiSuccess(
      {
        received: true,
        mode: "local",
        message: "Mensagem recebida em modo local/mock. Nenhum e-mail foi enviado e nada foi salvo em banco.",
      },
      { status: 202 },
    );
  } catch {
    return apiError("INTERNAL_ERROR", "Não foi possível processar a mensagem agora.", 500);
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}

