import assert from "node:assert/strict";
import test from "node:test";
import { ObjectId } from "mongodb";

import {
  createAdminSession,
  generateAdminSessionToken,
  getAdminUserFromSessionToken,
  hashAdminSessionToken,
  revokeAdminSession,
  revokeAllAdminSessions,
  sanitizeAdminUserAgent,
  type AdminSessionCollections,
} from "../src/lib/admin/sessions.ts";
import type {
  AdminSessionDocument,
  AdminUserDocument,
} from "../src/lib/mongodb/collections.ts";

type SessionRecord = AdminSessionDocument & { _id: ObjectId };
type UserRecord = AdminUserDocument & { _id: ObjectId };

class FakeSessionCollection {
  documents: SessionRecord[] = [];

  async insertOne(document: AdminSessionDocument) {
    const inserted = {
      ...document,
      _id: new ObjectId(),
    };
    this.documents.push(inserted);
    return { insertedId: inserted._id };
  }

  async findOne(filter: Partial<SessionRecord>) {
    return this.documents.find((document) => {
      if (filter.tokenHash && document.tokenHash !== filter.tokenHash) return false;
      if (filter._id && !document._id.equals(filter._id)) return false;
      return true;
    }) ?? null;
  }

  async updateOne(filter: Partial<SessionRecord>, update: { $set: Partial<SessionRecord> }) {
    const document = await this.findOne(filter);

    if (document) {
      Object.assign(document, update.$set);
    }

    return { matchedCount: document ? 1 : 0 };
  }

  async updateMany(filter: Partial<SessionRecord>, update: { $set: Partial<SessionRecord> }) {
    let matchedCount = 0;

    for (const document of this.documents) {
      const matchesUser = !filter.userId || document.userId.equals(filter.userId);
      const matchesRevoked = filter.revokedAt !== null || !document.revokedAt;

      if (matchesUser && matchesRevoked) {
        Object.assign(document, update.$set);
        matchedCount += 1;
      }
    }

    return { matchedCount };
  }
}

class FakeUserCollection {
  private readonly users: UserRecord[];

  constructor(users: UserRecord[]) {
    this.users = users;
  }

  async findOne(filter: Partial<UserRecord>) {
    return this.users.find((user) => {
      if (filter._id && !user._id.equals(filter._id)) return false;
      if (typeof filter.active === "boolean" && user.active !== filter.active) return false;
      return true;
    }) ?? null;
  }
}

function createStores(user: UserRecord, sessions = new FakeSessionCollection()) {
  return {
    collections: {
      adminSessions: sessions,
      adminUsers: new FakeUserCollection([user]),
    } as unknown as AdminSessionCollections,
    sessions,
  };
}

function createUser(active = true): UserRecord {
  const now = new Date("2026-07-14T12:00:00.000Z");

  return {
    _id: new ObjectId(),
    active,
    createdAt: now,
    email: "admin@example.com",
    lastLoginAt: null,
    normalizedEmail: "admin@example.com",
    passwordAlgorithm: "scrypt-v1",
    passwordChangedAt: now,
    passwordHash: "not-used-in-session-tests",
    passwordParameters: {
      blockSize: 8,
      cost: 16_384,
      keyLength: 64,
      maxmem: 64 * 1024 * 1024,
      parallelization: 1,
    },
    passwordSalt: "not-used-in-session-tests",
    role: "owner",
    updatedAt: now,
  };
}

test("generates random Admin session tokens", () => {
  assert.notEqual(generateAdminSessionToken(), generateAdminSessionToken());
});

test("creates an Admin session and stores only the token hash", async () => {
  const user = createUser();
  const { collections, sessions } = createStores(user);
  const created = await createAdminSession(user, {
    collections,
    now: new Date("2026-07-14T12:00:00.000Z"),
    userAgent: `Browser ${"x".repeat(300)}`,
  });
  const document = sessions.documents[0];

  assert.ok(created.token);
  assert.notEqual(document.tokenHash, created.token);
  assert.equal(document.tokenHash, hashAdminSessionToken(created.token));
  assert.equal(document.userAgent?.length, 180);
});

test("reads a valid Admin session and rejects expired or revoked sessions", async () => {
  const user = createUser();
  const { collections, sessions } = createStores(user);
  const now = new Date("2026-07-14T12:00:00.000Z");
  const created = await createAdminSession(user, { collections, now });

  const valid = await getAdminUserFromSessionToken(created.token, {
    collections,
    now: new Date("2026-07-14T12:30:00.000Z"),
  });
  assert.equal(valid?.email, "admin@example.com");

  sessions.documents[0].expiresAt = new Date("2026-07-14T12:00:01.000Z");
  const expired = await getAdminUserFromSessionToken(created.token, {
    collections,
    now: new Date("2026-07-14T12:00:02.000Z"),
  });
  assert.equal(expired, null);

  sessions.documents[0].expiresAt = new Date("2026-07-14T20:00:00.000Z");
  sessions.documents[0].revokedAt = new Date("2026-07-14T12:45:00.000Z");
  const revoked = await getAdminUserFromSessionToken(created.token, { collections, now });
  assert.equal(revoked, null);
});

test("rejects Admin sessions for inactive users", async () => {
  const user = createUser(false);
  const { collections } = createStores(user);
  const created = await createAdminSession(user, {
    collections,
    now: new Date("2026-07-14T12:00:00.000Z"),
  });

  assert.equal(await getAdminUserFromSessionToken(created.token, { collections }), null);
});

test("revokes one Admin session and then all sessions for a user", async () => {
  const user = createUser();
  const { collections, sessions } = createStores(user);
  const first = await createAdminSession(user, { collections });
  await createAdminSession(user, { collections });

  await revokeAdminSession(first.token, { collections, now: new Date("2026-07-14T13:00:00.000Z") });
  assert.ok(sessions.documents[0].revokedAt);
  assert.equal(sessions.documents[1].revokedAt, undefined);

  await revokeAllAdminSessions(user._id, {
    collections,
    now: new Date("2026-07-14T14:00:00.000Z"),
  });
  assert.ok(sessions.documents[1].revokedAt);
});

test("sanitizes Admin user agent values", () => {
  assert.equal(sanitizeAdminUserAgent(" Browser\r\nName "), "Browser  Name");
  assert.equal(sanitizeAdminUserAgent("x".repeat(300))?.length, 180);
  assert.equal(sanitizeAdminUserAgent("   "), undefined);
});
