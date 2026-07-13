import { NextResponse } from "next/server";

import { clearAdminSessionCookies } from "@/lib/admin/auth";
import { isSameOriginAdminRequest } from "@/lib/admin/auth-rules";

export async function POST(request: Request) {
  if (!isSameOriginAdminRequest(request.url, request.headers.get("origin"))) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Origem da requisicao invalida.",
        },
        ok: false,
      },
      { status: 403 },
    );
  }

  const response = NextResponse.json({
    data: {
      signedOut: true,
    },
    ok: true,
  });
  clearAdminSessionCookies(response);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function GET() {
  return NextResponse.json(
    {
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Metodo nao permitido.",
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
