type LoginBucket = {
  attempts: number;
  resetAt: number;
};

type LoginStore = Map<string, LoginBucket>;

declare global {
  var __alvaroAdminLoginRateLimitStore: LoginStore | undefined;
}

const store = globalThis.__alvaroAdminLoginRateLimitStore ?? new Map<string, LoginBucket>();
globalThis.__alvaroAdminLoginRateLimitStore = store;

export const ADMIN_LOGIN_ATTEMPT_LIMIT = 5;
export const ADMIN_LOGIN_WINDOW_MS = 10 * 60 * 1_000;

export function consumeAdminLoginAttempt(key: string, nowMs = Date.now()) {
  const current = store.get(key);
  const bucket = !current || current.resetAt <= nowMs
    ? { attempts: 0, resetAt: nowMs + ADMIN_LOGIN_WINDOW_MS }
    : current;

  if (bucket.attempts >= ADMIN_LOGIN_ATTEMPT_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - nowMs) / 1_000)),
    };
  }

  bucket.attempts += 1;
  store.set(key, bucket);

  return {
    allowed: true,
    remaining: Math.max(0, ADMIN_LOGIN_ATTEMPT_LIMIT - bucket.attempts),
    resetAt: bucket.resetAt,
    retryAfterSeconds: 0,
  };
}

export function resetAdminLoginAttempts(key: string) {
  store.delete(key);
}

export function resetAdminLoginRateLimitForTests() {
  store.clear();
}
