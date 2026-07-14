import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

export const ADMIN_PASSWORD_ALGORITHM = "scrypt-v1";
export const MIN_ADMIN_PASSWORD_LENGTH = 14;
export const MAX_ADMIN_PASSWORD_LENGTH = 1024;

const SALT_BYTES = 16;
const KEY_BYTES = 64;

export type AdminPasswordParameters = {
  blockSize: number;
  cost: number;
  keyLength: number;
  maxmem: number;
  parallelization: number;
};

export const ADMIN_PASSWORD_PARAMETERS: AdminPasswordParameters = {
  blockSize: 8,
  cost: 16_384,
  keyLength: KEY_BYTES,
  maxmem: 64 * 1024 * 1024,
  parallelization: 1,
};

export type AdminPasswordAlgorithm = typeof ADMIN_PASSWORD_ALGORITHM;

export type StoredAdminPasswordCredential = {
  passwordAlgorithm: AdminPasswordAlgorithm;
  passwordHash: string;
  passwordParameters: AdminPasswordParameters;
  passwordSalt: string;
};

export const DUMMY_ADMIN_PASSWORD_CREDENTIAL: StoredAdminPasswordCredential = {
  passwordAlgorithm: ADMIN_PASSWORD_ALGORITHM,
  passwordHash: Buffer.alloc(KEY_BYTES).toString("base64url"),
  passwordParameters: ADMIN_PASSWORD_PARAMETERS,
  passwordSalt: Buffer.from("admin-auth-dummy-salt").toString("base64url"),
};

function decodeBase64Url(value: string) {
  try {
    return Buffer.from(value, "base64url");
  } catch {
    return null;
  }
}

function hasCurrentParameters(parameters: AdminPasswordParameters) {
  return parameters.blockSize === ADMIN_PASSWORD_PARAMETERS.blockSize
    && parameters.cost === ADMIN_PASSWORD_PARAMETERS.cost
    && parameters.keyLength === ADMIN_PASSWORD_PARAMETERS.keyLength
    && parameters.maxmem === ADMIN_PASSWORD_PARAMETERS.maxmem
    && parameters.parallelization === ADMIN_PASSWORD_PARAMETERS.parallelization;
}

async function deriveAdminPasswordKey(password: string, salt: Buffer, parameters: AdminPasswordParameters) {
  return await new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      parameters.keyLength,
      {
        blockSize: parameters.blockSize,
        cost: parameters.cost,
        maxmem: parameters.maxmem,
        parallelization: parameters.parallelization,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

export function assertValidAdminPassword(password: string) {
  const passwordLength = Array.from(password).length;

  if (passwordLength < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(`Admin password must have at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`);
  }

  if (passwordLength > MAX_ADMIN_PASSWORD_LENGTH) {
    throw new Error(`Admin password must have at most ${MAX_ADMIN_PASSWORD_LENGTH} characters.`);
  }
}

export async function hashAdminPassword(password: string): Promise<StoredAdminPasswordCredential> {
  assertValidAdminPassword(password);

  const salt = randomBytes(SALT_BYTES);
  const derivedKey = await deriveAdminPasswordKey(password, salt, ADMIN_PASSWORD_PARAMETERS);

  return {
    passwordAlgorithm: ADMIN_PASSWORD_ALGORITHM,
    passwordHash: derivedKey.toString("base64url"),
    passwordParameters: ADMIN_PASSWORD_PARAMETERS,
    passwordSalt: salt.toString("base64url"),
  };
}

export async function verifyAdminPassword(password: string, storedCredential: StoredAdminPasswordCredential) {
  if (
    storedCredential.passwordAlgorithm !== ADMIN_PASSWORD_ALGORITHM
    || !hasCurrentParameters(storedCredential.passwordParameters)
  ) {
    return false;
  }

  const salt = decodeBase64Url(storedCredential.passwordSalt);
  const expectedHash = decodeBase64Url(storedCredential.passwordHash);

  if (!salt || !expectedHash || salt.length === 0) {
    return false;
  }

  const derivedKey = await deriveAdminPasswordKey(password, salt, storedCredential.passwordParameters);
  const comparableHash = expectedHash.length === derivedKey.length
    ? expectedHash
    : Buffer.alloc(derivedKey.length);
  const matches = timingSafeEqual(derivedKey, comparableHash);

  return expectedHash.length === derivedKey.length && matches;
}
