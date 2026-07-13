# Arcade Bootstrap Contract

Endpoint:

```txt
GET /api/arcade/bootstrap
```

Purpose:

- resolve or create the anonymous player session once;
- return the public session payload;
- return the player's personal rankings;
- return the top three entries for all four games;
- preserve playable games if one ranking query fails.

Success data shape:

```ts
{
  session: {
    alias: string | null;
    maxAliasLength: number;
    ready: true;
  };
  playerLeaderboard: PlayerLeaderboardResponse | null;
  leaderboards: {
    runtime: LeaderboardEntry[];
    "bug-maze": LeaderboardEntry[];
    "code-snake": LeaderboardEntry[];
    "stack-tetris": LeaderboardEntry[];
  };
  partialFailures: {
    leaderboards: LabGameId[];
    playerLeaderboard: boolean;
  };
}
```

The route returns an API-level error only when the anonymous session itself cannot be prepared. Individual leaderboard failures are represented in `partialFailures`.
