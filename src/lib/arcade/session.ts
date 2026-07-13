import { createHmac, randomBytes } from "node:crypto";

import {
  ARCADE_ALIAS_MAX_LENGTH,
  ARCADE_LAST_SEEN_REFRESH_INTERVAL_MS,
  shouldRefreshArcadeSessionLastSeen,
} from "@/lib/arcade/session-rules";
import { getMongoCollections } from "@/lib/mongodb/collections";

export { ARCADE_ALIAS_MAX_LENGTH, validatePlayerAlias } from "@/lib/arcade/session-rules";

export const ARCADE_SESSION_COOKIE_NAME = "alvaro_arcade_session";
export const ARCADE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

type ArcadeCookieStore = {
  get(name: string): { value: string } | undefined;
  set(
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      maxAge: number;
      path: string;
      sameSite: "lax";
      secure: boolean;
    },
  ): void;
};

type PublicArcadeSession = {
  alias: string | null;
  maxAliasLength: typeof ARCADE_ALIAS_MAX_LENGTH;
  ready: true;
};

type ArcadeSessionContext = {
  publicSession: PublicArcadeSession;
  sessionHash: string;
};

const RAW_SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;

function readArcadeSessionSecret() {
  const secret = process.env.ARCADE_SESSION_SECRET?.trim();

  if (!secret) {
    throw new Error("Missing required server environment variable: ARCADE_SESSION_SECRET");
  }

  return secret;
}

function generateRawSessionId() {
  return randomBytes(32).toString("base64url");
}

function isValidRawSessionId(value: string) {
  return RAW_SESSION_ID_PATTERN.test(value);
}

export function getOrCreateArcadeSessionCookie(cookieStore: ArcadeCookieStore) {
  const existingValue = cookieStore.get(ARCADE_SESSION_COOKIE_NAME)?.value;

  if (existingValue && isValidRawSessionId(existingValue)) {
    return existingValue;
  }

  const rawSessionId = generateRawSessionId();

  cookieStore.set(ARCADE_SESSION_COOKIE_NAME, rawSessionId, {
    httpOnly: true,
    maxAge: ARCADE_SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return rawSessionId;
}

export function hashArcadeSessionId(rawSessionId: string) {
  return createHmac("sha256", readArcadeSessionSecret()).update(rawSessionId).digest("hex");
}

export async function upsertArcadeSession({
  alias,
  sessionHash,
  updateAlias = false,
}: {
  alias?: string | null;
  sessionHash: string;
  updateAlias?: boolean;
}): Promise<PublicArcadeSession> {
  const { arcadeScores, arcadeSessions } = await getMongoCollections();
  const now = new Date();

  const ensureResult = await arcadeSessions.updateOne(
    { sessionHash },
    {
      $setOnInsert: {
        alias: null,
        createdAt: now,
        lastSeenAt: now,
        sessionHash,
      },
    },
    { upsert: true },
  );

  if (!ensureResult.acknowledged) {
    throw new Error("Could not ensure arcade session.");
  }

  if (updateAlias) {
    const normalizedAlias = alias ?? null;
    const updateResult = await arcadeSessions.updateOne(
      { sessionHash },
      {
        $set: {
          alias: normalizedAlias,
          lastSeenAt: now,
        },
      },
    );

    if (!updateResult.acknowledged || updateResult.matchedCount !== 1) {
      throw new Error("Could not update arcade session.");
    }

    await arcadeScores.updateMany(
      { sessionHash },
      {
        $set: {
          playerAlias: normalizedAlias,
        },
      },
    );

    return {
      alias: normalizedAlias,
      maxAliasLength: ARCADE_ALIAS_MAX_LENGTH,
      ready: true,
    };
  }

  const currentSession = await arcadeSessions.findOne(
    { sessionHash },
    {
      projection: {
        alias: 1,
        lastSeenAt: 1,
      },
    },
  );

  if (!currentSession) {
    throw new Error("Could not read arcade session.");
  }

  if (shouldRefreshArcadeSessionLastSeen(currentSession.lastSeenAt.toISOString(), now.getTime())) {
    const refreshBefore = new Date(now.getTime() - ARCADE_LAST_SEEN_REFRESH_INTERVAL_MS);
    const refreshResult = await arcadeSessions.updateOne(
      {
        lastSeenAt: { $lt: refreshBefore },
        sessionHash,
      },
      {
        $set: {
          lastSeenAt: now,
        },
      },
    );

    if (!refreshResult.acknowledged) {
      throw new Error("Could not refresh arcade session activity.");
    }
  }

  return {
    alias: currentSession.alias,
    maxAliasLength: ARCADE_ALIAS_MAX_LENGTH,
    ready: true,
  };
}

export async function resolveArcadeSessionContext(cookieStore: ArcadeCookieStore): Promise<ArcadeSessionContext> {
  const rawSessionId = getOrCreateArcadeSessionCookie(cookieStore);
  const sessionHash = hashArcadeSessionId(rawSessionId);
  const publicSession = await upsertArcadeSession({
    sessionHash,
  });

  return {
    publicSession,
    sessionHash,
  };
}
