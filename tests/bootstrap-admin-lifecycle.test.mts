import assert from "node:assert/strict";
import test from "node:test";
import { ObjectId } from "mongodb";

import { runAdminBootstrap } from "../scripts/bootstrap-admin.mjs";

const credential = {
  passwordAlgorithm: "scrypt-v1",
  passwordChangedAt: new Date("2026-07-14T12:00:00.000Z"),
  passwordHash: "test-hash",
  passwordParameters: {
    blockSize: 8,
    cost: 16_384,
    keyLength: 64,
    maxmem: 64 * 1024 * 1024,
    parallelization: 1,
  },
  passwordSalt: "test-salt",
};

function createLogger() {
  return {
    errors: [] as string[],
    lines: [] as string[],
    error(message: string) {
      this.errors.push(message);
    },
    log(message: string) {
      this.lines.push(message);
    },
  };
}

function createFakeMongoClient({ failFind = false } = {}) {
  const state = {
    closed: false,
    closeCalls: 0,
    connected: false,
  };

  class FakeMongoClient {
    constructor() {}

    async close() {
      state.closed = true;
      state.closeCalls += 1;
    }

    async connect() {
      state.connected = true;
    }

    db() {
      return {
        async command() {
          return { ok: 1 };
        },
        collection(name: string) {
          return {
            async createIndexes() {
              return [];
            },
            async findOne() {
              if (name === "admin_users" && failFind) {
                throw new Error("find failed");
              }

              return null;
            },
            async insertOne() {
              return { insertedId: new ObjectId() };
            },
            async updateMany() {
              return { modifiedCount: 0 };
            },
            async updateOne() {
              return { modifiedCount: 0 };
            },
          };
        },
      };
    }
  }

  return {
    FakeMongoClient,
    state,
  };
}

function baseOptions(MongoClientCtor: typeof Object, logger = createLogger()) {
  return {
    argv: ["--email", "admin@example.com"],
    createDate: () => new Date("2026-07-14T12:00:00.000Z"),
    hashPassword: async () => credential,
    logger,
    MongoClientCtor,
    readConfig: () => ({
      databaseName: "portfolio_os",
      uri: "mongodb://localhost:27017/portfolio_os",
    }),
    readPassword: async () => "MinhaSenhaSegura2026!",
    sanitizeError: (error: unknown) => error instanceof Error ? error.message : "unknown error",
  };
}

test("runAdminBootstrap closes MongoClient after a successful create flow", async () => {
  const logger = createLogger();
  const { FakeMongoClient, state } = createFakeMongoClient();
  const exitCode = await runAdminBootstrap(baseOptions(FakeMongoClient, logger));

  assert.equal(exitCode, 0);
  assert.equal(state.connected, true);
  assert.equal(state.closed, true);
  assert.equal(state.closeCalls, 1);
  assert.deepEqual(logger.errors, []);
  assert.equal(logger.lines[0], "Admin owner created for admin@example.com.");
});

test("runAdminBootstrap closes MongoClient when an operation fails", async () => {
  const logger = createLogger();
  const { FakeMongoClient, state } = createFakeMongoClient({ failFind: true });
  const exitCode = await runAdminBootstrap(baseOptions(FakeMongoClient, logger));

  assert.equal(exitCode, 1);
  assert.equal(state.connected, true);
  assert.equal(state.closed, true);
  assert.equal(state.closeCalls, 1);
  assert.equal(logger.errors[0], "Admin bootstrap failed: find failed");
});
