import readline from "node:readline";

const BACKSPACE_MASK = "\b \b";
const CONTROL_KEY_NAMES = new Set([
  "clear",
  "down",
  "end",
  "escape",
  "f1",
  "f2",
  "f3",
  "f4",
  "f5",
  "f6",
  "f7",
  "f8",
  "f9",
  "f10",
  "f11",
  "f12",
  "home",
  "insert",
  "left",
  "pagedown",
  "pageup",
  "right",
  "tab",
  "up",
]);

export class MaskedInputCancelledError extends Error {
  constructor() {
    super("Password input cancelled.");
    this.name = "MaskedInputCancelledError";
  }
}

export function countMaskedInputCharacters(value) {
  return Array.from(value).length;
}

export function validateMaskedInputLength(value, { label = "Input", maxLength = Infinity, minLength = 0 } = {}) {
  const length = countMaskedInputCharacters(value);

  if (length < minLength) {
    throw new Error(`${label} must have at least ${minLength} characters.`);
  }

  if (length > maxLength) {
    throw new Error(`${label} must have at most ${maxLength} characters.`);
  }
}

export function assertMaskedInputsMatch(value, confirmation, message = "Password confirmation does not match.") {
  if (value !== confirmation) {
    throw new Error(message);
  }
}

function withoutLastCharacter(value) {
  const characters = Array.from(value);
  characters.pop();
  return characters.join("");
}

function isCtrlC(input, key) {
  return input === "\u0003" || (key?.ctrl === true && key.name === "c");
}

function isEnter(input, key) {
  return input === "\r" || input === "\n" || key?.name === "return" || key?.name === "enter";
}

function isBackspaceOrDelete(input, key) {
  return input === "\b" || input === "\u007f" || key?.name === "backspace" || key?.name === "delete";
}

function normalizePrintableInput(input) {
  if (typeof input !== "string" || input.length === 0) {
    return "";
  }

  return input.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "");
}

export function applyMaskedInputKeypress(currentValue, input, key = {}) {
  if (isCtrlC(input, key)) {
    return {
      cancelled: true,
      done: false,
      output: "",
      value: currentValue,
    };
  }

  if (isEnter(input, key)) {
    return {
      cancelled: false,
      done: true,
      output: "",
      value: currentValue,
    };
  }

  if (isBackspaceOrDelete(input, key)) {
    if (countMaskedInputCharacters(currentValue) === 0) {
      return {
        cancelled: false,
        done: false,
        output: "",
        value: currentValue,
      };
    }

    return {
      cancelled: false,
      done: false,
      output: BACKSPACE_MASK,
      value: withoutLastCharacter(currentValue),
    };
  }

  if (key?.ctrl || key?.meta || CONTROL_KEY_NAMES.has(key?.name)) {
    return {
      cancelled: false,
      done: false,
      output: "",
      value: currentValue,
    };
  }

  const printableInput = normalizePrintableInput(input);

  if (!printableInput) {
    return {
      cancelled: false,
      done: false,
      output: "",
      value: currentValue,
    };
  }

  return {
    cancelled: false,
    done: false,
    output: "*".repeat(countMaskedInputCharacters(printableInput)),
    value: `${currentValue}${printableInput}`,
  };
}

function removeCreatedKeypressListener(input, listener) {
  if (!listener) {
    return;
  }

  if (typeof input.off === "function") {
    input.off("keypress", listener);
    return;
  }

  if (typeof input.removeListener === "function") {
    input.removeListener("keypress", listener);
  }
}

function restoreMaskedInputStream(input, listener) {
  removeCreatedKeypressListener(input, listener);

  if (typeof input.setRawMode === "function") {
    input.setRawMode(false);
  }

  if (typeof input.pause === "function") {
    input.pause();
  }
}

export async function readMaskedInput(question, { input = process.stdin, output = process.stdout } = {}) {
  if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== "function") {
    throw new Error("Interactive terminal with raw mode is required to read the Admin password. Run this command in Windows Terminal, the VS Code integrated terminal, or Windows PowerShell.");
  }

  let value = "";
  let settled = false;
  let onKeypress = null;

  try {
    readline.emitKeypressEvents(input);
    output.write(question);
    input.setRawMode(true);
    input.resume();

    return await new Promise((resolve, reject) => {
      onKeypress = (typedInput, key) => {
        if (settled) {
          return;
        }

        const next = applyMaskedInputKeypress(value, typedInput, key);
        value = next.value;

        if (next.output) {
          output.write(next.output);
        }

        if (next.done) {
          settled = true;
          output.write("\n");
          resolve(value);
          return;
        }

        if (next.cancelled) {
          settled = true;
          output.write("\n");
          reject(new MaskedInputCancelledError());
        }
      };

      input.on("keypress", onKeypress);
    });
  } finally {
    restoreMaskedInputStream(input, onKeypress);
  }
}
