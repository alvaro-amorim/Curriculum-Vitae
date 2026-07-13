# Foundation Stabilization Audit

Audit started on 2026-07-12 from `main` at `b72236b`.

This document tracks findings and implementation status. It describes the repository as it exists, not planned features as if they were already delivered.

## Scope

1. Align stale documentation and copy.
2. Remove confirmed dead or duplicated code.
3. Consolidate Home content sources.
4. Reduce oversized component responsibilities.
5. Correct PT/EN and project-data inconsistencies.
6. Prepare the codebase for tests and CI.

Database migrations, authentication and infrastructure changes are outside this branch.

## Completed

- [x] Updated README for the unique-player leaderboard and approved roadmap.
- [x] Updated Lab copy that still described a local/mock backend.
- [x] Updated foundation validation tokens and route coverage.
- [x] Removed the duplicated `/visual-final-candidate` route.
- [x] Removed obsolete route handling from `AppShell`.
- [x] Normalized project-filter matching for versioned and variant technology names.
- [x] Extracted project-filter logic into a testable module.
- [x] Added automated tests for project-filter behavior.
- [x] Added CI for lint, typecheck, tests and production build.
- [x] Removed the unused local score logger.
- [x] Removed the unused browser-facing Supabase anon key from `.env.example`.
- [x] Extracted Home copy into `src/content/home-copy.ts`.
- [x] Extracted Home project showcase data into `src/content/home-projects.ts`.
- [x] Extracted Home icons and stack logos into `home-icons.tsx`.
- [x] Reduced the main Home component without changing its approved visual contract.
- [x] Recorded remaining structural work for the dedicated Lab and Arcade phases.

## Remaining findings moved to later phases

### Home carousel and section split

The main Home component is smaller after copy, project data and icons were extracted, but the carousel and page sections still share one file.

Further splitting is intentionally deferred until a dedicated visual-refactor pass because it changes a large approved component and requires screenshot-level verification. This is not a blocker for Arcade stability, the Lab redesign or the Admin MVP.

### Oversized Lab component

`developer-lab.tsx` still manages data fetching, alias state, score submission, leaderboards, game switching and the full page UI.

This will be addressed after Arcade data stability work, during `feat/lab-redesign`.

### Candidate APIs and legacy modules

The following items require product decisions before removal or conversion:

- `/api/contact`;
- `/api/analytics`;
- `/api/terminal`;
- old terminal and skill-matrix copy;
- unused translation branches.

They were not removed during stabilization because absence of one visible consumer is insufficient evidence that they have no intended role.

### Content accuracy requiring owner confirmation

- Home statistics such as years and production-product count;
- LinkedIn URL;
- whether WhatsApp should be public;
- current postgraduate education entry;
- final project stacks and statuses used in the Home showcase.

These belong to the later About/contact and content-admin phases.

## Validation results

The final branch head passed:

```txt
GitHub Actions CI: success
Vercel preview build: success
```

The CI pipeline executes:

```txt
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run validate:foundation` remains a runtime smoke script that requires a running deployment or local server.

## Branch and PR

```txt
branch: refactor/foundation-stabilization
pull request: #1
base: main
```

The foundation scope is complete and ready to merge. Subsequent work must start from the merged `main` in a new branch.
