import assert from "node:assert/strict";
import test from "node:test";

import {
  DUMMY_ADMIN_PASSWORD_CREDENTIAL,
  hashAdminPassword,
  MIN_ADMIN_PASSWORD_LENGTH,
  verifyAdminPassword,
} from "../src/lib/admin/password.ts";

test("hashes and verifies Admin passwords with scrypt", async () => {
  const credential = await hashAdminPassword("correct horse battery staple");

  assert.equal(credential.passwordAlgorithm, "scrypt-v1");
  assert.equal(await verifyAdminPassword("correct horse battery staple", credential), true);
});

test("rejects wrong Admin passwords", async () => {
  const credential = await hashAdminPassword("another long admin password");

  assert.equal(await verifyAdminPassword("wrong password value", credential), false);
});

test("uses a different salt and hash for the same Admin password", async () => {
  const password = "same long admin passphrase";
  const first = await hashAdminPassword(password);
  const second = await hashAdminPassword(password);

  assert.notEqual(first.passwordSalt, second.passwordSalt);
  assert.notEqual(first.passwordHash, second.passwordHash);
});

test("enforces the minimum Admin password length during hashing", async () => {
  assert.rejects(
    () => hashAdminPassword("too short"),
    new RegExp(String(MIN_ADMIN_PASSWORD_LENGTH)),
  );
});

test("runs a dummy password comparison for missing users", async () => {
  const verified = await verifyAdminPassword("nonexistent user password", DUMMY_ADMIN_PASSWORD_CREDENTIAL);

  assert.equal(verified, false);
});
