import { createHmac, randomBytes } from "node:crypto";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export const ARCADE_SESSION_COOKIE_NAME = "alvaro_arcade_session";
export const ARCADE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;
export const ARCADE_ALIAS_MAX_LENGTH = 24;

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

type AliasValidationResult =
  | {
      alias: string | null;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

type PublicArcadeSession = {
  alias: string | null;
  maxAliasLength: typeof ARCADE_ALIAS_MAX_LENGTH;
  ready: true;
};

const RAW_SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{32,128}$/;
const ALIAS_ALLOWED_PATTERN = /^[\p{L}\p{N} _-]+$/u;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const URL_PATTERN = /(https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,})/i;

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

export function validatePlayerAlias(alias: unknown): AliasValidationResult {
  if (alias === undefined || alias === null) {
    return {
      alias: null,
      ok: true,
    };
  }

  if (typeof alias !== "string") {
    return {
      message: "Alias invalido.",
      ok: false,
    };
  }

  const normalizedAlias = alias.normalize("NFKC").trim().replace(/\s+/g, " ");

  if (normalizedAlias.length === 0) {
    return {
      alias: null,
      ok: true,
    };
  }

  if (normalizedAlias.length > ARCADE_ALIAS_MAX_LENGTH) {
    return {
      message: `Alias deve ter no maximo ${ARCADE_ALIAS_MAX_LENGTH} caracteres.`,
      ok: false,
    };
  }

  if (CONTROL_CHARACTER_PATTERN.test(normalizedAlias)) {
    return {
      message: "Alias contem caracteres invalidos.",
      ok: false,
    };
  }

  if (EMAIL_PATTERN.test(normalizedAlias) || URL_PATTERN.test(normalizedAlias)) {
    return {
      message: "Alias nao pode conter e-mail ou URL.",
      ok: false,
    };
  }

  const digitCount = normalizedAlias.replace(/\D/g, "").length;

  if (digitCount >= 7) {
    return {
      message: "Alias nao pode conter telefone.",
      ok: false,
    };
  }

  if (!ALIAS_ALLOWED_PATTERN.test(normalizedAlias)) {
    return {
      message: "Alias aceita apenas letras, numeros, espaco, hifen e underscore.",
      ok: false,
    };
  }

  return {
    alias: normalizedAlias,
    ok: true,
  };
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
  const supabase = getSupabaseServerClient();

  const { data: existingSession, error: selectError } = await supabase
    .from("arcade_sessions")
    .select("alias, created_at")
    .eq("session_hash", sessionHash)
    .maybeSingle();

  if (selectError) {
    throw new Error("Could not read arcade session.");
  }

  if (existingSession) {
    const nowMs = Date.now();
    const createdAtMs = Date.parse(existingSession.created_at);
    const lastSeenAt = new Date(Math.max(nowMs, Number.isNaN(createdAtMs) ? nowMs : createdAtMs)).toISOString();
    const updatePayload = {
      last_seen_at: lastSeenAt,
      ...(updateAlias ? { alias: alias ?? null } : {}),
    };

    const { data: updatedSession, error: updateError } = await supabase
      .from("arcade_sessions")
      .update(updatePayload)
      .eq("session_hash", sessionHash)
      .select("alias")
      .single();

    if (updateError) {
      throw new Error("Could not update arcade session.");
    }

    return {
      alias: updatedSession.alias,
      maxAliasLength: ARCADE_ALIAS_MAX_LENGTH,
      ready: true,
    };
  }

  const { data: insertedSession, error: insertError } = await supabase
    .from("arcade_sessions")
    .insert({
      alias: updateAlias ? (alias ?? null) : null,
      session_hash: sessionHash,
    })
    .select("alias")
    .single();

  if (insertError) {
    throw new Error("Could not create arcade session.");
  }

  return {
    alias: insertedSession.alias,
    maxAliasLength: ARCADE_ALIAS_MAX_LENGTH,
    ready: true,
  };
}
