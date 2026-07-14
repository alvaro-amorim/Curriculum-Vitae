import type { NextRequest } from "next/server.js";
import { NextResponse } from "next/server.js";

import {
  ADMIN_SESSION_COOKIE,
  isAdminApiPath,
  isAdminLoginPath,
} from "./lib/admin/auth-rules.ts";

function unauthorizedResponse(request: NextRequest) {
  if (isAdminApiPath(request.nextUrl.pathname)) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Sessão administrativa inválida ou expirada.",
        },
        ok: false,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
        status: 401,
      },
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("next", nextPath);
  return NextResponse.redirect(loginUrl);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isAdminLoginPath(pathname) || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  if (request.cookies.get(ADMIN_SESSION_COOKIE)?.value) {
    return NextResponse.next();
  }

  return unauthorizedResponse(request);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
