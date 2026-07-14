# Arcade DB Foundation

The Developer Arcade persists anonymous sessions, scores and leaderboards in MongoDB Atlas through Next.js Route Handlers.

## Scope

- Anonymous session API: `/api/player-session`.
- Score API: `/api/score`.
- Leaderboard APIs: `/api/leaderboard` and `/api/leaderboard/me`.
- Collections: `arcade_sessions` and `arcade_scores`.
- Browser code never receives raw session hashes, database ids or server secrets.

## `arcade_sessions`

Stores anonymous player sessions.

- `sessionHash`
- `alias`
- `createdAt`
- `lastSeenAt`

The browser receives only an opaque `HttpOnly` cookie. The server stores a HMAC-derived hash.

## `arcade_scores`

Stores validated score submissions for the four games.

- `runtime`
- `bug-maze`
- `code-snake`
- `stack-tetris`

Each row stores `score`, `durationMs`, `gameVersion`, `contractVersion`, `deviceType`, `metadata`, `playerAlias`, `sessionHash` and `createdAt`.

## Security Model

- All reads and writes go through server Route Handlers.
- `ARCADE_SESSION_SECRET` is server-only.
- Public responses do not expose `sessionHash`, raw cookie values or internal ids.
- Aliases are display-only and reject e-mails, phone-like values, URLs, control characters and oversized values.
- Admin sessions use separate `admin_sessions` records and are not mixed with Arcade sessions.

## Operational Setup

Run:

```powershell
npm run mongodb:setup
```

The setup script creates the indexes for Arcade, projects and Admin collections without deleting existing data.
