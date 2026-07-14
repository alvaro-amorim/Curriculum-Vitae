import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  adminSessionCookieOptions,
  ADMIN_SESSION_COOKIE,
  LEGACY_ADMIN_COOKIE_NAMES,
} from "./auth-rules";
import {
  createAdminSession,
  getAdminUserFromSessionToken,
  revokeAdminSession,
  revokeAllAdminSessions,
  type AdminUser,
} from "./sessions";

export type { AdminUser };
export {
  createAdminSession,
  getAdminUserFromSessionToken,
  revokeAdminSession,
  revokeAllAdminSessions,
};

export async function readAdminSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;
}

export function setAdminSessionCookie(response: NextResponse, token: string, expiresAt: Date, now = new Date()) {
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1_000));

  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions(maxAge));

  for (const cookieName of LEGACY_ADMIN_COOKIE_NAMES) {
    response.cookies.set(cookieName, "", adminSessionCookieOptions(0));
  }
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", adminSessionCookieOptions(0));

  for (const cookieName of LEGACY_ADMIN_COOKIE_NAMES) {
    response.cookies.set(cookieName, "", adminSessionCookieOptions(0));
  }
}

export async function getCurrentAdminUser() {
  try {
    return await getAdminUserFromSessionToken(await readAdminSessionToken());
  } catch {
    return null;
  }
}

export async function requireAdminUser() {
  const user = await getCurrentAdminUser();

  if (!user) {
    throw new Error("Admin session is invalid or expired.");
  }

  return user;
}
