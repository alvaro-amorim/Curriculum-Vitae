import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_LOGIN_ATTEMPT_LIMIT,
  ADMIN_LOGIN_BLOCK_MS,
  ADMIN_LOGIN_WINDOW_MS,
  consumeAdminLoginAttempt,
  createAdminLoginAttemptKeyHash,
  resetAdminLoginAttempts,
} from "../src/lib/admin/rate-limit.ts";
import type { AdminLoginAttemptDocument } from "../src/lib/mongodb/collections.ts";

class FakeAttemptCollection {
  records = new Map<string, AdminLoginAttemptDocument>();

  async findOne(filter: { keyHash: string }) {
    return this.records.get(filter.keyHash) ?? null;
  }

  async updateOne(
    filter: { keyHash: string },
    update: { $set: Partial<AdminLoginAttemptDocument> },
    options?: { upsert?: boolean },
  ) {
    const existing = this.records.get(filter.keyHash);

    if (!existing && !options?.upsert) {
      return { matchedCount: 0 };
    }

    this.records.set(filter.keyHash, {
      ...(existing ?? {
        attempts: 0,
        blockedUntil: null,
        expiresAt: new Date(0),
        keyHash: filter.keyHash,
        windowStartedAt: new Date(0),
      }),
      ...update.$set,
    });
    return { matchedCount: existing ? 1 : 0 };
  }

  async deleteOne(filter: { keyHash: string }) {
    this.records.delete(filter.keyHash);
    return { deletedCount: 1 };
  }
}

test("hashes the Admin login bucket without storing raw IP or email", () => {
  const request = new Request("https://portfolio.example/api/admin/login", {
    headers: {
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    },
  });
  const keyHash = createAdminLoginAttemptKeyHash(request, "Admin@Example.com");

  assert.match(keyHash, /^[A-Za-z0-9_-]+$/);
  assert.equal(keyHash.includes("203.0.113.10"), false);
  assert.equal(keyHash.includes("admin@example.com"), false);
});

test("blocks Admin login attempts after the configured threshold", async () => {
  const collection = new FakeAttemptCollection();
  const keyHash = "admin-login";

  for (let attempt = 0; attempt < ADMIN_LOGIN_ATTEMPT_LIMIT; attempt += 1) {
    const consumed = await consumeAdminLoginAttempt(keyHash, {
      collection,
      now: new Date(1_000 + attempt),
    });
    assert.equal(consumed.allowed, true);
  }

  const blocked = await consumeAdminLoginAttempt(keyHash, {
    collection,
    now: new Date(2_000),
  });

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfterSeconds > 0);
  assert.ok(collection.records.get(keyHash)?.blockedUntil);
});

test("resets a successful Admin login bucket", async () => {
  const collection = new FakeAttemptCollection();
  const keyHash = "admin-success";
  await consumeAdminLoginAttempt(keyHash, { collection, now: new Date(1_000) });
  await resetAdminLoginAttempts(keyHash, { collection });

  const next = await consumeAdminLoginAttempt(keyHash, {
    collection,
    now: new Date(1_001),
  });

  assert.equal(next.allowed, true);
  assert.equal(next.remaining, ADMIN_LOGIN_ATTEMPT_LIMIT - 1);
});

test("starts a fresh Admin login window after expiry", async () => {
  const collection = new FakeAttemptCollection();
  const keyHash = "admin-expired";

  for (let attempt = 0; attempt < ADMIN_LOGIN_ATTEMPT_LIMIT; attempt += 1) {
    await consumeAdminLoginAttempt(keyHash, {
      collection,
      now: new Date(1_000 + attempt),
    });
  }

  const refreshed = await consumeAdminLoginAttempt(keyHash, {
    collection,
    now: new Date(1_000 + ADMIN_LOGIN_WINDOW_MS),
  });

  assert.equal(refreshed.allowed, true);
  assert.equal(refreshed.remaining, ADMIN_LOGIN_ATTEMPT_LIMIT - 1);
});

test("unblocks after the block window expires", async () => {
  const collection = new FakeAttemptCollection();
  const keyHash = "admin-unblocked";

  for (let attempt = 0; attempt <= ADMIN_LOGIN_ATTEMPT_LIMIT; attempt += 1) {
    await consumeAdminLoginAttempt(keyHash, {
      collection,
      now: new Date(1_000 + attempt),
    });
  }

  const unblocked = await consumeAdminLoginAttempt(keyHash, {
    collection,
    now: new Date(2_000 + ADMIN_LOGIN_BLOCK_MS),
  });

  assert.equal(unblocked.allowed, true);
});
