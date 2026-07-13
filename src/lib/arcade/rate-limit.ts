type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitBucket>;

type ConsumeRateLimitOptions = {
  key: string;
  limit: number;
  nowMs?: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

declare global {
  var __alvaroArcadeRateLimitStore: RateLimitStore | undefined;
}

const store = globalThis.__alvaroArcadeRateLimitStore ?? new Map<string, RateLimitBucket>();

globalThis.__alvaroArcadeRateLimitStore = store;

function cleanupExpiredBuckets(nowMs: number) {
  if (store.size < 1_000) {
    return;
  }

  for (const [key, bucket] of store) {
    if (bucket.resetAt <= nowMs) {
      store.delete(key);
    }
  }
}

export function consumeArcadeRateLimit({
  key,
  limit,
  nowMs = Date.now(),
  windowMs,
}: ConsumeRateLimitOptions): RateLimitResult {
  cleanupExpiredBuckets(nowMs);

  const current = store.get(key);
  const bucket = !current || current.resetAt <= nowMs
    ? { count: 0, resetAt: nowMs + windowMs }
    : current;

  if (bucket.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - nowMs) / 1_000)),
    };
  }

  bucket.count += 1;
  store.set(key, bucket);

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
    retryAfterSeconds: 0,
  };
}

export function resetArcadeRateLimitStoreForTests() {
  store.clear();
}
