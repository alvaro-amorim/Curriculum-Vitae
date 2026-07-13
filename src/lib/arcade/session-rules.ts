export const ARCADE_ALIAS_MAX_LENGTH = 24;
export const ARCADE_LAST_SEEN_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 6;

export type AliasValidationResult =
  | {
      alias: string | null;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

const ALIAS_ALLOWED_PATTERN = /^[\p{L}\p{N} _-]+$/u;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const URL_PATTERN = /(https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,})/i;

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

export function shouldRefreshArcadeSessionLastSeen(lastSeenAt: string, nowMs = Date.now()) {
  const lastSeenMs = Date.parse(lastSeenAt);

  if (Number.isNaN(lastSeenMs)) {
    return true;
  }

  return nowMs - lastSeenMs >= ARCADE_LAST_SEEN_REFRESH_INTERVAL_MS;
}
