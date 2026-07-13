import type { Session, User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_COOKIE_PATH,
  ADMIN_REFRESH_COOKIE,
  ADMIN_REFRESH_MAX_AGE_SECONDS,
  isAdminApiPath,
  isAdminLoginPath,
  isAllowedAdminEmail,
} from "@/lib/admin/auth-rules";
import { getSupabaseAuthClient } from "@/lib/supabase/auth-server";

function isAllowedUser(user: User | null) {
  return isAllowedAdminEmail(user?.email, process.env.ADMIN_EMAIL);
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: ADMIN_COOKIE_PATH,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function setSessionCookies(response: NextResponse, session: Session) {
  response.cookies.set(
    ADMIN_ACCESS_COOKIE,
    session.access_token,
    cookieOptions(Math.max(60, session.expires_in ?? 3600)),
  );
  response.cookies.set(
    ADMIN_REFRESH_COOKIE,
    session.refresh_token,
    cookieOptions(ADMIN_REFRESH_MAX_AGE_SECONDS),
  );
}

function clearSessionCookies(response: NextResponse) {
  response.cookies.set(ADMIN_ACCESS_COOKIE, "", cookieOptions(0));
  response.cookies.set(ADMIN_REFRESH_COOKIE, "", cookieOptions(0));
}

function unauthorizedResponse(request: NextRequest) {
  if (isAdminApiPath(request.nextUrl.pathname)) {
    const response = NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Sessao administrativa invalida ou expirada.",
        },
        ok: false,
      },
      { status: 401 },
    );
    clearSessionCookies(response);
    return response;
  }

  const loginUrl = new URL("/admin/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("next", nextPath);
  const response = NextResponse.redirect(loginUrl);
  clearSessionCookies(response);
  return response;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLogin = isAdminLoginPath(pathname);
  const isLogout = pathname === "/api/admin/logout";

  if (isLogout) {
    return NextResponse.next();
  }

  try {
    const supabase = getSupabaseAuthClient();
    const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;

    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);

      if (!error && isAllowedUser(data.user)) {
        return isLogin
          ? NextResponse.redirect(new URL("/admin", request.url))
          : NextResponse.next();
      }
    }

    const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;

    if (refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (!error && data.session && isAllowedUser(data.user)) {
        const response = isLogin
          ? NextResponse.redirect(new URL("/admin", request.url))
          : NextResponse.next();
        setSessionCookies(response, data.session);
        return response;
      }
    }

    return isLogin ? NextResponse.next() : unauthorizedResponse(request);
  } catch {
    return isLogin ? NextResponse.next() : unauthorizedResponse(request);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
