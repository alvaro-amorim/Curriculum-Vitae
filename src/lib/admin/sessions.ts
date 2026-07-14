import { createHash, randomBytes } from "node:crypto";
import type { WithId } from "mongodb";

import type {
  AdminSessionDocument,
  AdminUserDocument,
  MongoCollections,
} from "../mongodb/collections.ts";
import { getMongoCollections } from "../mongodb/collections.ts";
import { ADMIN_SESSION_MAX_AGE_SECONDS } from "./auth-rules.ts";

export type AdminUser = {
  email: string;
  id: string;
  role: "owner";
};

export type AdminSessionCollections = Pick<MongoCollections, "adminSessions" | "adminUsers">;

type SessionOptions = {
  collections?: AdminSessionCollections;
  now?: Date;
  userAgent?: string | null;
};

const MAX_SESSION_TOKEN_LENGTH = 256;
const MAX_USER_AGENT_LENGTH = 180;

async function readCollections(collections?: AdminSessionCollections) {
  return collections ?? await getMongoCollections();
}

export function generateAdminSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashAdminSessionToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

export function sanitizeAdminUserAgent(userAgent: string | null | undefined) {
  const normalized = userAgent?.replace(/[\r\n]/g, " ").trim();

  if (!normalized) {
    return undefined;
  }

  return normalized.slice(0, MAX_USER_AGENT_LENGTH);
}

function toAdminUser(user: WithId<AdminUserDocument>): AdminUser {
  return {
    email: user.email,
    id: user._id.toHexString(),
    role: user.role,
  };
}

export async function createAdminSession(user: WithId<AdminUserDocument>, options: SessionOptions = {}) {
  const collections = await readCollections(options.collections);
  const now = options.now ?? new Date();
  const expiresAt = new Date(now.getTime() + ADMIN_SESSION_MAX_AGE_SECONDS * 1_000);
  const token = generateAdminSessionToken();
  const userAgent = sanitizeAdminUserAgent(options.userAgent);
  const document: AdminSessionDocument = {
    createdAt: now,
    expiresAt,
    lastSeenAt: now,
    tokenHash: hashAdminSessionToken(token),
    userId: user._id,
  };

  if (userAgent) {
    document.userAgent = userAgent;
  }

  await collections.adminSessions.insertOne(document);

  return {
    expiresAt,
    token,
  };
}

export async function getAdminUserFromSessionToken(
  token: string | null | undefined,
  options: Pick<SessionOptions, "collections" | "now"> = {},
) {
  if (!token || token.length > MAX_SESSION_TOKEN_LENGTH) {
    return null;
  }

  const collections = await readCollections(options.collections);
  const now = options.now ?? new Date();
  const session = await collections.adminSessions.findOne({
    tokenHash: hashAdminSessionToken(token),
  });

  if (!session || session.revokedAt || session.expiresAt <= now) {
    return null;
  }

  const user = await collections.adminUsers.findOne({
    _id: session.userId,
    active: true,
  });

  if (!user) {
    return null;
  }

  await collections.adminSessions.updateOne(
    { _id: session._id },
    { $set: { lastSeenAt: now } },
  );

  return toAdminUser(user);
}

export async function revokeAdminSession(
  token: string | null | undefined,
  options: Pick<SessionOptions, "collections" | "now"> = {},
) {
  if (!token || token.length > MAX_SESSION_TOKEN_LENGTH) {
    return;
  }

  const collections = await readCollections(options.collections);
  const now = options.now ?? new Date();

  await collections.adminSessions.updateOne(
    {
      revokedAt: null,
      tokenHash: hashAdminSessionToken(token),
    },
    {
      $set: {
        lastSeenAt: now,
        revokedAt: now,
      },
    },
  );
}

export async function revokeAllAdminSessions(
  userId: WithId<AdminUserDocument>["_id"],
  options: Pick<SessionOptions, "collections" | "now"> = {},
) {
  const collections = await readCollections(options.collections);
  const now = options.now ?? new Date();

  await collections.adminSessions.updateMany(
    {
      revokedAt: null,
      userId,
    },
    {
      $set: {
        revokedAt: now,
      },
    },
  );
}
