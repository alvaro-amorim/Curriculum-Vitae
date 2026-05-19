import { apiError, apiSuccess, methodNotAllowed, readJsonPayload, validationError } from "@/lib/api-response";
import { executeTerminalCommand } from "@/lib/terminal-commands";
import { TerminalPayloadSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await readJsonPayload(request);

    if (!json.ok) {
      return json.response;
    }

    const parsed = TerminalPayloadSchema.safeParse(json.payload);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const result = executeTerminalCommand(parsed.data.command);

    if (!result.ok && result.code === "UNKNOWN_COMMAND") {
      return apiError("UNKNOWN_COMMAND", result.output[0] ?? "Comando não reconhecido.", 400);
    }

    return apiSuccess({
      output: result.output,
      action: result.action,
    });
  } catch {
    return apiError("INTERNAL_ERROR", "Não foi possível processar o comando agora.", 500);
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}

