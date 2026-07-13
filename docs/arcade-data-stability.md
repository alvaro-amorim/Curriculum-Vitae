# Arcade Data Stability

Branch: `fix/arcade-data-stability`

Base: `main` after Foundation Stabilization PR #1.

## Goals

1. Make anonymous session creation safe under concurrent requests.
2. Reduce unnecessary `last_seen_at` writes.
3. Aggregate initial Arcade data into a bootstrap endpoint.
4. Reduce the number of initial client requests.
5. Improve partial failure handling.
6. Add initial abuse controls before the Lab redesign.

## Completed

- [x] Replaced `select -> insert` session creation with an atomic, conflict-safe upsert.
- [x] Preserved existing aliases during normal session reads.
- [x] Reduced activity writes by refreshing `last_seen_at` only after a six-hour interval.
- [x] Isolated session rules for direct unit testing.
- [x] Added `/api/arcade/bootstrap`.
- [x] Returned session, personal ranking and the four public leaderboards in one response.
- [x] Added partial failure information without making games unavailable.
- [x] Added an initial per-session score submission limit of 12 requests per minute.
- [x] Added standard rate-limit response headers.
- [x] Added unit coverage for session refresh, alias validation, canonical games and rate limiting.

## Pending

- [ ] Update the Lab client to use the bootstrap response.
- [ ] Keep per-game refreshes after score submission and alias changes.
- [ ] Add signed game-run identifiers, expiry and replay protection.
- [ ] Replace the process-local limiter with a shared store if traffic or multiple instances require strict global enforcement.
- [ ] Validate the complete branch through CI and Vercel preview.

## Operational notes

The initial rate limiter is process-local. It reduces accidental bursts and basic abuse on a warm server instance, but it is not a globally consistent distributed limiter across all serverless instances.

The bootstrap endpoint is already safe to deploy independently. Switching the current Lab client to it is deliberately kept separate from the server contract so the existing interface remains playable while the integration is validated.

No database migration has been added in this package.
