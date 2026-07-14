import { pathToFileURL } from "node:url";

import { MongoClient, ServerApiVersion } from "mongodb";

import {
  hashAdminPassword,
  MAX_ADMIN_PASSWORD_LENGTH,
  MIN_ADMIN_PASSWORD_LENGTH,
} from "../src/lib/admin/password.ts";
import {
  isValidAdminEmail,
  normalizeAdminEmail,
} from "../src/lib/admin/auth-rules.ts";
import { readMongoConfig, sanitizeMongoError } from "../src/lib/mongodb/config.ts";
import { MONGODB_INDEX_SPECS } from "../src/lib/mongodb/index-specs.ts";
import {
  assertMaskedInputsMatch,
  MaskedInputCancelledError,
  readMaskedInput,
  validateMaskedInputLength,
} from "./lib/read-masked-input.mjs";

export function parseAdminBootstrapArgs(argv) {
  const result = {
    email: "",
    rotatePassword: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--email") {
      result.email = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--rotate-password") {
      result.rotatePassword = true;
      continue;
    }

    throw new Error(`Unsupported option: ${arg}`);
  }

  return result;
}

export async function readAdminBootstrapPassword(readInput = readMaskedInput) {
  const password = await readInput("Admin password: ");
  const confirmation = await readInput("Confirm Admin password: ");

  assertMaskedInputsMatch(password, confirmation);
  validateMaskedInputLength(password, {
    label: "Admin password",
    maxLength: MAX_ADMIN_PASSWORD_LENGTH,
    minLength: MIN_ADMIN_PASSWORD_LENGTH,
  });
  return password;
}

export async function ensureAdminIndexes(database) {
  await Promise.all([
    database.collection("admin_users").createIndexes(MONGODB_INDEX_SPECS.adminUsers),
    database.collection("admin_sessions").createIndexes(MONGODB_INDEX_SPECS.adminSessions),
    database.collection("admin_login_attempts").createIndexes(MONGODB_INDEX_SPECS.adminLoginAttempts),
  ]);
}

export async function runAdminBootstrap({
  argv = process.argv.slice(2),
  createDate = () => new Date(),
  hashPassword = hashAdminPassword,
  logger = console,
  MongoClientCtor = MongoClient,
  readConfig = readMongoConfig,
  readPassword = readAdminBootstrapPassword,
  sanitizeError = sanitizeMongoError,
} = {}) {
  const args = parseAdminBootstrapArgs(argv);
  const normalizedEmail = normalizeAdminEmail(args.email);
  let client;
  let exitCode = 0;

  if (!isValidAdminEmail(normalizedEmail)) {
    logger.error("Admin bootstrap failed: provide a valid --email value.");
    return 1;
  }

  try {
    const { databaseName, uri } = readConfig();
    const password = await readPassword();
    const credential = await hashPassword(password);
    const now = createDate();

    client = new MongoClientCtor(uri, {
      connectTimeoutMS: 10_000,
      maxPoolSize: 2,
      serverApi: {
        deprecationErrors: true,
        strict: true,
        version: ServerApiVersion.v1,
      },
      serverSelectionTimeoutMS: 10_000,
    });

    await client.connect();
    const database = client.db(databaseName);
    await database.command({ ping: 1 });
    await ensureAdminIndexes(database);

    const adminUsers = database.collection("admin_users");
    const adminSessions = database.collection("admin_sessions");
    const existing = await adminUsers.findOne({ normalizedEmail });

    if (existing && !args.rotatePassword) {
      throw new Error("Admin user already exists. Re-run with --rotate-password to update the password.");
    }

    if (!existing) {
      await adminUsers.insertOne({
        active: true,
        createdAt: now,
        email: normalizedEmail,
        lastLoginAt: null,
        normalizedEmail,
        passwordAlgorithm: credential.passwordAlgorithm,
        passwordChangedAt: now,
        passwordHash: credential.passwordHash,
        passwordParameters: credential.passwordParameters,
        passwordSalt: credential.passwordSalt,
        role: "owner",
        updatedAt: now,
      });

      logger.log(`Admin owner created for ${normalizedEmail}.`);
    } else {
      await adminUsers.updateOne(
        { _id: existing._id },
        {
          $set: {
            passwordAlgorithm: credential.passwordAlgorithm,
            passwordChangedAt: now,
            passwordHash: credential.passwordHash,
            passwordParameters: credential.passwordParameters,
            passwordSalt: credential.passwordSalt,
            updatedAt: now,
          },
        },
      );
      await adminSessions.updateMany(
        {
          revokedAt: null,
          userId: existing._id,
        },
        {
          $set: {
            revokedAt: now,
          },
        },
      );

      logger.log(`Admin owner password rotated for ${normalizedEmail}; existing Admin sessions revoked.`);
    }
  } catch (error) {
    logger.error(error instanceof MaskedInputCancelledError
      ? "Admin bootstrap cancelled."
      : `Admin bootstrap failed: ${sanitizeError(error)}`);
    exitCode = 1;
  } finally {
    if (client) {
      try {
        await client.close();
      } catch {
        logger.error("Admin bootstrap failed: could not close MongoDB connection cleanly.");
        exitCode = 1;
      }
    }
  }

  return exitCode;
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectRun) {
  process.exitCode = await runAdminBootstrap();
}
