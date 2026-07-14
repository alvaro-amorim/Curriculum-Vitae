import { createHash } from "node:crypto";
import type { Collection } from "mongodb";

import type { AdminLoginAttemptDocument } from "../mongodb/collections.ts";
import { getMongoCollections } from "../mongodb/collections.ts";
import { normalizeAdminEmail } from "./auth-rules.ts";

export const ADMIN_LOGIN_ATTEMPT_LIMIT = 5;
export const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1_000;
export const ADMIN_LOGIN_BLOCK_MS = 30 * 60 * 1_000;

type AdminLoginAttemptCollection = Pick<
  Collection<AdminLoginAttemptDocument>,
  "deleteOne" | "findOne" | "updateOne"
>;

type RateLimitOptions = {
  collection?: AdminLoginAttemptCollection;
  now?: Date;
};

async function readCollection(collection?: AdminLoginAttemptCollection) {
  if (collection) {
    return collection;
  }

  const { adminLoginAttempts } = await getMongoCollections();
  return adminLoginAttempts;
}

function expiresAfter(now: Date) {
  return new Date(now.getTime() + ADMIN_LOGIN_WINDOW_MS + ADMIN_LOGIN_BLOCK_MS);
}

function rateLimitHeaders(limit: number, remaining: number, resetAt: Date, retryAfterSeconds = 0) {
  return {
    limit,
    remaining,
    resetAt: resetAt.getTime(),
    retryAfterSeconds,
  };
}

export function normalizeAdminLoginClientAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const candidate = (forwardedFor || realIp || "unknown")
    .replace(/[\r\n]/g, "")
    .toLowerCase();

  if (!candidate || candidate.length > 128) {
    return "unknown";
  }

  return candidate;
}

export function createAdminLoginAttemptKeyHash(request: Request, email: string) {
  return createHash("sha256")
    .update(`${normalizeAdminLoginClientAddress(request)}:${normalizeAdminEmail(email)}`)
    .digest("base64url");
}

export async function consumeAdminLoginAttempt(keyHash: string, options: RateLimitOptions = {}) {
  const collection = await readCollection(options.collection);
  const now = options.now ?? new Date();
  const nowMs = now.getTime();
  const current = await collection.findOne({ keyHash });

  if (current?.blockedUntil && current.blockedUntil > now) {
    return {
      allowed: false,
      ...rateLimitHeaders(
        ADMIN_LOGIN_ATTEMPT_LIMIT,
        0,
        current.blockedUntil,
        Math.max(1, Math.ceil((current.blockedUntil.getTime() - nowMs) / 1_000)),
      ),
    };
  }

  const windowExpired = !current
    || current.windowStartedAt.getTime() + ADMIN_LOGIN_WINDOW_MS <= nowMs
    || Boolean(current.blockedUntil && current.blockedUntil <= now);

  if (windowExpired) {
    const resetAt = new Date(nowMs + ADMIN_LOGIN_WINDOW_MS);

    await collection.updateOne(
      { keyHash },
      {
        $set: {
          attempts: 1,
          blockedUntil: null,
          expiresAt: expiresAfter(now),
          keyHash,
          windowStartedAt: now,
        },
      },
      { upsert: true },
    );

    return {
      allowed: true,
      ...rateLimitHeaders(ADMIN_LOGIN_ATTEMPT_LIMIT, ADMIN_LOGIN_ATTEMPT_LIMIT - 1, resetAt),
    };
  }

  const resetAt = new Date(current.windowStartedAt.getTime() + ADMIN_LOGIN_WINDOW_MS);

  if (current.attempts >= ADMIN_LOGIN_ATTEMPT_LIMIT) {
    const blockedUntil = new Date(nowMs + ADMIN_LOGIN_BLOCK_MS);

    await collection.updateOne(
      { keyHash },
      {
        $set: {
          blockedUntil,
          expiresAt: expiresAfter(blockedUntil),
        },
      },
    );

    return {
      allowed: false,
      ...rateLimitHeaders(
        ADMIN_LOGIN_ATTEMPT_LIMIT,
        0,
        blockedUntil,
        Math.max(1, Math.ceil(ADMIN_LOGIN_BLOCK_MS / 1_000)),
      ),
    };
  }

  const attempts = current.attempts + 1;

  await collection.updateOne(
    { keyHash },
    {
      $set: {
        attempts,
        expiresAt: expiresAfter(now),
      },
    },
  );

  return {
    allowed: true,
    ...rateLimitHeaders(
      ADMIN_LOGIN_ATTEMPT_LIMIT,
      Math.max(0, ADMIN_LOGIN_ATTEMPT_LIMIT - attempts),
      resetAt,
    ),
  };
}

export async function resetAdminLoginAttempts(keyHash: string, options: Pick<RateLimitOptions, "collection"> = {}) {
  const collection = await readCollection(options.collection);
  await collection.deleteOne({ keyHash });
}
