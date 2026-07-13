import assert from "node:assert/strict";
import test from "node:test";

import { ARCADE_GAME_IDS } from "../src/lib/arcade/constants.ts";

test("keeps the four final Arcade games in bootstrap order", () => {
  assert.deepEqual(ARCADE_GAME_IDS, [
    "runtime",
    "bug-maze",
    "code-snake",
    "stack-tetris",
  ]);
});
