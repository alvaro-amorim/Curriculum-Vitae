# Foundation Stabilization Audit

Audit started on 2026-07-12 from `main` at `b72236b`.

This document tracks findings and implementation status. It must describe the repository as it exists, not planned features as if they were already delivered.

## Scope

1. Align stale documentation and copy.
2. Remove confirmed dead or duplicated code.
3. Consolidate content sources.
4. Reduce oversized component responsibilities.
5. Correct PT/EN and project-data inconsistencies.
6. Prepare the codebase for tests and the later Admin MVP.

Database migrations, authentication and infrastructure changes are outside this branch.

## Completed

- [x] Updated README for the unique-player leaderboard and approved roadmap.
- [x] Updated Lab copy that still described a local/mock backend.
- [x] Updated foundation validation tokens and route coverage.
- [x] Removed the duplicated `/visual-final-candidate` route.
- [x] Removed the obsolete route handling from `AppShell`.
- [x] Normalized project-filter matching for versioned and variant technology names.
- [x] Removed the unused local score logger.
- [x] Removed the unused browser-facing Supabase anon key from `.env.example`.

## Active findings

### Home content duplication

The Home keeps its project showcase array inside `visual-final-candidate.tsx`, while case studies use `src/content/projects.ts`.

Consequences:

- project stacks can diverge;
- descriptions can contradict the case study;
- project lists are updated independently;
- a future admin would need to edit more than one source.

Planned correction:

- split the Home component first;
- move Home presentation metadata into the content layer;
- derive links and canonical project facts from `src/content/projects.ts`;
- preserve the currently approved DOM and CSS during the extraction.

### Oversized Home component

`visual-final-candidate.tsx` currently combines:

- copy;
- project presentation data;
- icons and technology logos;
- carousel state;
- all Home sections;
- reveal behavior and pointer effects.

Planned modules:

```txt
src/components/home/
  home-page.tsx
  hero-section.tsx
  project-carousel.tsx
  featured-projects.tsx
  stack-section.tsx
  process-section.tsx
  arcade-section.tsx
  about-section.tsx
  final-cta.tsx
  home-icons.tsx

src/content/
  home-copy.ts
  home-projects.ts
```

The extraction must be incremental and validated by a Vercel preview after each safe group.

### Oversized Lab component

`developer-lab.tsx` currently manages data fetching, alias state, score submission, leaderboards, game switching and the full page UI.

This is deferred to the dedicated Lab redesign after Arcade data stability work.

### Candidate APIs and legacy modules

The following items require reference checks before removal or conversion:

- `/api/contact`;
- `/api/analytics`;
- `/api/terminal`;
- old terminal and skill-matrix copy;
- unused translation branches.

No item should be deleted only because it appears unused in one component.

### Content accuracy

Items that require owner confirmation or a dedicated content pass:

- Home statistics such as years and production-product count;
- LinkedIn URL;
- whether WhatsApp should be public;
- current postgraduate education entry;
- project stacks and statuses used in the Home showcase.

## Validation policy

For Markdown-only changes, review rendered structure and links.

For code changes, the expected local or CI checks are:

```txt
npm run lint
npm run typecheck
npm run build
npm run validate:foundation
```

The current repository has no formal automated test script. A later approved phase will add it.

Vercel preview success validates that the Next.js production build completed, but it does not replace visual, accessibility or runtime database QA.

## Branch and PR

```txt
branch: refactor/foundation-stabilization
pull request: #1
base: main
```

The PR remains draft until the foundation scope is complete and validated.
