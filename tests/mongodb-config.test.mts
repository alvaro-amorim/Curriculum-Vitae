import assert from "node:assert/strict";
import test from "node:test";

import {
  isMongoConfigured,
  readMongoConfig,
  sanitizeMongoError,
} from "../src/lib/mongodb/config.ts";

test("reads a valid MongoDB Atlas configuration", () => {
  const config = readMongoConfig({
    MONGODB_DB: "portfolio_os",
    MONGODB_URI: "mongodb+srv://portfolio_app:secret@example.mongodb.net/portfolio_os",
  });

  assert.deepEqual(config, {
    databaseName: "portfolio_os",
    uri: "mongodb+srv://portfolio_app:secret@example.mongodb.net/portfolio_os",
  });
});

test("detects whether both MongoDB variables are configured", () => {
  assert.equal(isMongoConfigured({}), false);
  assert.equal(isMongoConfigured({ MONGODB_DB: "portfolio_os" }), false);
  assert.equal(
    isMongoConfigured({
      MONGODB_DB: "portfolio_os",
      MONGODB_URI: "mongodb://localhost:27017/portfolio_os",
    }),
    true,
  );
});

test("rejects missing variables, unsupported protocols and unsafe database names", () => {
  assert.throws(
    () => readMongoConfig({ MONGODB_DB: "portfolio_os" }),
    /MONGODB_URI/,
  );
  assert.throws(
    () => readMongoConfig({ MONGODB_DB: "portfolio_os", MONGODB_URI: "https://example.com" }),
    /mongodb:\/\//,
  );
  assert.throws(
    () => readMongoConfig({ MONGODB_DB: "portfolio os", MONGODB_URI: "mongodb://localhost" }),
    /unsupported characters/,
  );
});

test("redacts MongoDB credentials from diagnostic errors", () => {
  const sanitized = sanitizeMongoError(
    new Error("failed mongodb+srv://portfolio_app:super-secret@example.mongodb.net/portfolio_os"),
  );

  assert.equal(sanitized.includes("super-secret"), false);
  assert.equal(sanitized.includes("portfolio_app"), false);
  assert.match(sanitized, /redacted-mongodb-uri/);
});
