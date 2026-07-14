import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import {
  applyMaskedInputKeypress,
  assertMaskedInputsMatch,
  countMaskedInputCharacters,
  MaskedInputCancelledError,
  readMaskedInput,
  validateMaskedInputLength,
} from "../scripts/lib/read-masked-input.mjs";

class FakeInput extends EventEmitter {
  isRaw = false;
  isTTY = true;
  paused = true;
  pauseCalls = 0;
  rawModeCalls: boolean[] = [];
  resumeCalls = 0;
  throwOnEnableRawMode = false;

  isPaused() {
    return this.paused;
  }

  pause() {
    this.paused = true;
    this.pauseCalls += 1;
    return this;
  }

  resume() {
    this.paused = false;
    this.resumeCalls += 1;
    return this;
  }

  setRawMode(value: boolean) {
    this.rawModeCalls.push(value);

    if (value && this.throwOnEnableRawMode) {
      throw new Error("raw mode failed");
    }

    this.isRaw = value;
    return this;
  }
}

class FakeOutput {
  chunks: string[] = [];
  isTTY = true;

  write(value: string) {
    this.chunks.push(value);
    return true;
  }
}

test("masks a common character", () => {
  const result = applyMaskedInputKeypress("", "a", { name: "a" });

  assert.deepEqual(result, {
    cancelled: false,
    done: false,
    output: "*",
    value: "a",
  });
});

test("keeps pasted characters and prints the same number of masks", () => {
  const result = applyMaskedInputKeypress("start", "Pasted2026!", {});

  assert.equal(result.value, "startPasted2026!");
  assert.equal(result.output, "***********");
});

test("handles Unicode input using Array.from character counts", () => {
  const result = applyMaskedInputKeypress("", "á🙂", {});

  assert.equal(result.value, "á🙂");
  assert.equal(result.output, "**");
  assert.equal(countMaskedInputCharacters("á🙂"), 2);
});

test("removes one character and one visible mask on Backspace", () => {
  const result = applyMaskedInputKeypress("ab🙂", undefined, { name: "backspace" });

  assert.equal(result.value, "ab");
  assert.equal(result.output, "\b \b");
});

test("finishes input on Enter", () => {
  const result = applyMaskedInputKeypress("secret", "\r", { name: "return" });

  assert.equal(result.value, "secret");
  assert.equal(result.output, "");
  assert.equal(result.done, true);
  assert.equal(result.cancelled, false);
});

test("cancels input on Ctrl+C", () => {
  const result = applyMaskedInputKeypress("secret", "\u0003", { ctrl: true, name: "c" });

  assert.equal(result.value, "secret");
  assert.equal(result.output, "");
  assert.equal(result.done, false);
  assert.equal(result.cancelled, true);
});

test("accepts a 14 character password", () => {
  assert.doesNotThrow(() => {
    validateMaskedInputLength("12345678901234", {
      label: "Admin password",
      minLength: 14,
    });
  });
});

test("rejects a 13 character password", () => {
  assert.throws(
    () => validateMaskedInputLength("1234567890123", {
      label: "Admin password",
      minLength: 14,
    }),
    /at least 14/,
  );
});

test("rejects a different confirmation", () => {
  assert.throws(
    () => assertMaskedInputsMatch("MinhaSenhaSegura2026!", "OutraSenhaSegura2026!"),
    /confirmation/,
  );
});

test("readMaskedInput resolves on Enter, removes its listener, disables raw mode and pauses stdin", async () => {
  const input = new FakeInput();
  const output = new FakeOutput();
  const promise = readMaskedInput("Password: ", { input, output });

  input.emit("keypress", "a", { name: "a" });
  input.emit("keypress", "b", { name: "b" });
  input.emit("keypress", "\r", { name: "return" });

  assert.equal(await promise, "ab");
  assert.equal(input.listenerCount("keypress"), 0);
  assert.equal(input.isRaw, false);
  assert.equal(input.paused, true);
  assert.deepEqual(input.rawModeCalls, [true, false]);
  assert.equal(input.pauseCalls, 1);
  assert.equal(output.chunks.join(""), "Password: **\n");
});

test("readMaskedInput removes its listener and pauses stdin after Ctrl+C", async () => {
  const input = new FakeInput();
  const output = new FakeOutput();
  const promise = readMaskedInput("Password: ", { input, output });

  input.emit("keypress", "\u0003", { ctrl: true, name: "c" });

  await assert.rejects(promise, MaskedInputCancelledError);
  assert.equal(input.listenerCount("keypress"), 0);
  assert.equal(input.isRaw, false);
  assert.equal(input.paused, true);
  assert.deepEqual(input.rawModeCalls, [true, false]);
  assert.equal(output.chunks.join(""), "Password: \n");
});

test("readMaskedInput restores terminal state when enabling raw mode fails", async () => {
  const input = new FakeInput();
  const output = new FakeOutput();
  input.throwOnEnableRawMode = true;

  await assert.rejects(
    readMaskedInput("Password: ", { input, output }),
    /raw mode failed/,
  );
  assert.equal(input.listenerCount("keypress"), 0);
  assert.equal(input.isRaw, false);
  assert.equal(input.paused, true);
  assert.deepEqual(input.rawModeCalls, [true, false]);
  assert.equal(input.pauseCalls, 1);
});

test("readMaskedInput rejects non-interactive streams instead of returning an empty password", async () => {
  const input = new FakeInput();
  const output = new FakeOutput();
  input.isTTY = false;

  await assert.rejects(
    readMaskedInput("Password: ", { input, output }),
    /Interactive terminal/,
  );
  assert.equal(input.listenerCount("keypress"), 0);
});
