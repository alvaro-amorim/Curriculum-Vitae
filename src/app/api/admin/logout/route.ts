import { NextResponse } from "next/server";

import { clearAdminSessionCookie, readAdminSessionToken, revokeAdminSession } from "@/lib/admin/auth";
import { isSameOriginAdminRequest } from "@/lib/admin/auth-rules";

export const runtime = "nodejs";

function jsonResponse(body: object, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

export async function POST(request: Request) {
  if (!isSameOriginAdminRequest(request.url, request.headers.get("origin"))) {
    return jsonResponse(
      {
        error: {
          code: "FORBIDDEN",
          message: "Origem da requisição inválida.",
        },
        ok: false,
      },
      { status: 403 },
    );
  }

  const token = await readAdminSessionToken();
  await revokeAdminSession(token).catch(() => undefined);

  const response = jsonResponse({
    data: {
      signedOut: true,
    },
    ok: true,
  });
  clearAdminSessionCookie(response);
  return response;
}

export function GET() {
  return jsonResponse(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Método não permitido.",
      },
      ok: false,
    },
    {
      headers: {
        Allow: "POST",
      },
      status: 405,
    },
  );
}
