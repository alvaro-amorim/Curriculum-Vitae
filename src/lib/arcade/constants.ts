export const ARCADE_GAME_IDS = [
  "runtime",
  "bug-maze",
  "code-snake",
  "stack-tetris",
] as const;

export type ArcadeGameId = (typeof ARCADE_GAME_IDS)[number];
