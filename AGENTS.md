# AGENTS.md

## Project overview

`@monetizekit/react`: themeable React components and hooks (pricing table,
paywall, usage, self-service billing) reading live data through a publishable
key. Source in `src/`, unit tests in Vitest, Storybook in `.storybook/` (the
public gallery is <https://ui.monetizekit.app>), live E2E in `e2e/`
(`.github/workflows/live-e2e.yml`, runs against Delivery on a schedule).

## Commands

- `pnpm install --frozen-lockfile`
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`
- `pnpm check-entry`, `pnpm smoke`
- `pnpm storybook` (dev), `pnpm test-storybook:ci` (what CI runs)
- `pnpm test:e2e:live` (needs a live publishable key; not for PR CI)

## Conventions

- Components render through CSS variables; never hardcode brand colors, read
  them from the design-system tokens.
- React 18 and 19 are both peers; do not use APIs missing from either.
- Every component has a story and a unit test; `check-entry` requires every
  export to resolve to a real implementation.
- Public API changes need a changeset.

## Verifying your work

```
$ pnpm lint
> eslint .
(no output, exit 0)

$ pnpm typecheck
(no output, exit 0)

$ pnpm test
 Test Files  11 passed (11)
      Tests  81 passed (81)

$ pnpm build
DTS ⚡️ Build success in ~1.4s
DTS dist/index.d.ts  33.50 KB

$ pnpm check-entry
Package entry guard passed: 27 exports resolve to real implementations.
```

## Releasing

Published to npm by Changesets from `.github/workflows/release.yml` on push to
`main`, with npm provenance. Add a changeset (`pnpm changeset`) to any PR that
changes the published surface. Because `main` only receives promotions from
`delivery`, a release is the result of a promotion, not of a feature merge.

## SDLC and promotion chain

- Branches: `feature/*` -> PR -> `development` -> `delivery` -> `main`. Feature
  PRs target `development`. Promotion between stages is a promotion PR from
  the upstream stage branch (`development -> delivery`, `delivery -> main`);
  where this repository has `.github/workflows/promote.yml`, that workflow
  opens it when the stage gate is green, and `delivery -> main` is always
  merged by a human. Never open a feature PR against `main` or `delivery`.
- Every PR must pass the `Required Checks Gate` job in `.github/workflows/ci.yml`.
  The `Shadow Review (advisory)` job posts a model review comment; it never
  blocks. React with a thumbs-down to dismiss a finding.
- Agent roles, model IDs, tools and autonomy for the whole fleet are declared in
  [`MonetizeKit/.github/agent-policy.json`](https://github.com/MonetizeKit/.github/blob/main/agent-policy.json).
  Never hardcode a model ID in this repository.
- Conventional commits (`feat:`, `fix:`, `chore:`, ...). Position and status live
  in Linear (team `MK`); reference the issue key in the PR body when one exists.
- The fleet-wide plan is
  [`docs/engineering/ai-native-sdlc-plan.md`](https://github.com/MonetizeKit/app-monetizekit-monorepo/blob/main/docs/engineering/ai-native-sdlc-plan.md)
  in the monorepo.
