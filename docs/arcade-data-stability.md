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
- [x] Added unit coverage for refresh thresholds and alias validation.

## Next

- [ ] Add `/api/arcade/bootstrap`.
- [ ] Return session, personal ranking and the four public leaderboards in one response.
- [ ] Update the Lab client to use the bootstrap response.
- [ ] Keep per-game refreshes after score submission.
- [ ] Add partial failure information without making games unavailable.
- [ ] Add request-level rate limiting and game-run identifiers in a later commit.

No migration has been added in this first package.
