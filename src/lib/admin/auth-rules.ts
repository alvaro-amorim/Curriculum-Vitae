export const ADMIN_ACCESS_COOKIE = "alvaro_admin_access";
export const ADMIN_REFRESH_COOKIE = "alvaro_admin_refresh";
export const ADMIN_COOKIE_PATH = "/";
export const ADMIN_REFRESH_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function normalizeAdminEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isAllowedAdminEmail(email: string | null | undefined, configuredEmail: string | null | undefined) {
  const normalizedEmail = normalizeAdminEmail(email);
  const normalizedConfiguredEmail = normalizeAdminEmail(configuredEmail);

  return normalizedEmail.length > 0 && normalizedEmail === normalizedConfiguredEmail;
}

export function isAdminLoginPath(pathname: string) {
  return pathname === "/admin/login" || pathname === "/api/admin/login";
}

export function isAdminApiPath(pathname: string) {
  return pathname.startsWith("/api/admin/");
}

export function isSafeAdminNextPath(value: string | null | undefined) {
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
