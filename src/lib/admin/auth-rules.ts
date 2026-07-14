export const ADMIN_COOKIE_PATH = "/";
export const ADMIN_SESSION_COOKIE = "alvaro_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
export const LEGACY_ADMIN_COOKIE_NAMES = ["alvaro_admin_access", "alvaro_admin_refresh"] as const;

const ADMIN_LOGIN_EMAIL_MAX_LENGTH = 160;
const BASIC_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeAdminEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isValidAdminEmail(value: string | null | undefined) {
  const normalizedEmail = normalizeAdminEmail(value);

  return normalizedEmail.length > 0
    && normalizedEmail.length <= ADMIN_LOGIN_EMAIL_MAX_LENGTH
    && BASIC_EMAIL_PATTERN.test(normalizedEmail);
}

export function isAdminLoginPath(pathname: string) {
  return pathname === "/admin/login" || pathname === "/api/admin/login";
}

export function isAdminApiPath(pathname: string) {
  return pathname.startsWith("/api/admin/");
}

export function isSafeAdminNextPath(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }

  return value === "/admin" || value.startsWith("/admin/");
}

export function isSameOriginAdminRequest(requestUrl: string, originHeader: string | null) {
  if (!originHeader) {
    return true;
  }

  try {
    return new URL(requestUrl).origin === new URL(originHeader).origin;
  } catch {
    return false;
  }
}

export function adminSessionCookieOptions(maxAge: number, nodeEnv = process.env.NODE_ENV) {
  return {
    httpOnly: true,
    maxAge,
    path: ADMIN_COOKIE_PATH,
    sameSite: "lax" as const,
    secure: nodeEnv === "production",
  };
}
