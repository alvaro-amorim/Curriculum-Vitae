import type { Session, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_COOKIE_PATH,
  ADMIN_REFRESH_COOKIE,
  ADMIN_REFRESH_MAX_AGE_SECONDS,
  isAllowedAdminEmail,
  normalizeAdminEmail,
} from "@/lib/admin/auth-rules";
import { getSupabaseAuthClient } from "@/lib/supabase/auth-server";

export type AdminUser = {
  email: string;
  id: string;
};

function readAdminEmail() {
  const email = normalizeAdminEmail(process.env.ADMIN_EMAIL);

  if (!email) {
    throw new Error("Missing required server environment variable: ADMIN_EMAIL");
  }

  return email;
}

function toAdminUser(user: User | null): AdminUser | null {
  const configuredEmail = readAdminEmail();

  if (!user?.email || !isAllowedAdminEmail(user.email, configuredEmail)) {
    return null;
  }

  return {
    email: normalizeAdminEmail(user.email),
    id: user.id,
  };
}

function secureCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: ADMIN_COOKIE_PATH,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function setAdminSessionCookies(response: NextResponse, session: Session) {
  response.cookies.set(
    ADMIN_ACCESS_COOKIE,
    session.access_token,
    secureCookieOptions(Math.max(60, session.expires_in ?? 3600)),
  );
  response.cookies.set(
    ADMIN_REFRESH_COOKIE,
    session.refresh_token,
    secureCookieOptions(ADMIN_REFRESH_MAX_AGE_SECONDS),
  );
}

export function clearAdminSessionCookies(response: NextResponse) {
  response.cookies.set(ADMIN_ACCESS_COOKIE, "", secureCookieOptions(0));
  response.cookies.set(ADMIN_REFRESH_COOKIE, "", secureCookieOptions(0));
}

export async function signInAdmin(email: string, password: string) {
  const configuredEmail = readAdminEmail();

  if (!isAllowedAdminEmail(email, configuredEmail)) {
    return null;
  }

  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeAdminEmail(email),
    password,
  });

  if (error || !data.session || !toAdminUser(data.user)) {
    return null;
  }

  return {
    session: data.session,
    user: toAdminUser(data.user) as AdminUser,
  };
}

export async function getAdminUserFromAccessToken(accessToken: string | null | undefined) {
  if (!accessToken) {
    return null;
  }

  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error) {
    return null;
  }

  return toAdminUser(data.user);
}

export async function refreshAdminSession(refreshToken: string | null | undefined) {
  if (!refreshToken) {
    return null;
  }

  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });
  const user = toAdminUser(data.user);

  if (error || !data.session || !user) {
    return null;
  }

  return {
    session: data.session,
    user,
  };
}

export async function getCurrentAdminUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value;

  return getAdminUserFromAccessToken(accessToken);
}
