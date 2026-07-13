import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "METHOD_NOT_ALLOWED"
  | "UNKNOWN_COMMAND"
  | "INTERNAL_ERROR"
  | "RATE_LIMITED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND";

type ApiErrorBody = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

type ApiSuccessBody<T> = {
  ok: true;
  data: T;
};

export const MAX_JSON_BYTES = 16 * 1024;

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccessBody<T>>({ ok: true, data }, init);
}

export function apiError(code: ApiErrorCode, message: string, status = 400, init?: Omit<ResponseInit, "status">) {
  return NextResponse.json<ApiErrorBody>(
    {
      ok: false,
      error: {
        code,
        message,
      },
    },
    {
      ...init,
      status,
    },
  );
}

export function validationError(error?: unknown) {
  if (error instanceof ZodError) {
    return apiError("VALIDATION_ERROR", error.issues[0]?.message ?? "Payload inválido.", 400);
  }

  return apiError("VALIDATION_ERROR", "Payload inválido.", 400);
}

export function methodNotAllowed(allowedMethods: string[]) {
  return NextResponse.json<ApiErrorBody>(
    {
      ok: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: `Método não permitido. Use ${allowedMethods.join(", ")}.`,
      },
    },
    {
      headers: {
        Allow: allowedMethods.join(", "),
      },
      status: 405,
    },
  );
}

export async function readJsonPayload(request: Request, maxBytes = MAX_JSON_BYTES) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (contentLength > maxBytes) {
    return {
      ok: false as const,
      response: apiError("VALIDATION_ERROR", "Payload muito grande.", 413),
    };
  }

  try {
    const rawBody = await request.text();
    const bodySize = new TextEncoder().encode(rawBody).byteLength;

    if (bodySize > maxBytes) {
      return {
        ok: false as const,
        response: apiError("VALIDATION_ERROR", "Payload muito grande.", 413),
      };
    }

    return {
      ok: true as const,
      payload: JSON.parse(rawBody),
    };
  } catch {
    return {
      ok: false as const,
      response: apiError("VALIDATION_ERROR", "JSON inválido.", 400),
    };
  }
}
