import assert from "node:assert/strict";
import test from "node:test";

import { ARCADE_BOOTSTRAP_GAME_IDS } from "../src/lib/arcade/bootstrap.ts";

test("keeps the four final Arcade games in bootstrap order", () => {
  assert.deepEqual(ARCADE_BOOTSTRAP_GAME_IDS, [
    "runtime",
    "bug-maze",
    "code-snake",
    "stack-tetris",
  ]);
});
