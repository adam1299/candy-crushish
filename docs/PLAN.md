# Weather Workshop Implementation Plan

**Goal:** Deliver the first playable cross-platform foundation and an indexed agent handoff.
**Architecture:** Shared browser game with pure engine and save/economy modules; Capacitor native hosts.
**Stack:** JavaScript ES modules, SVG/CSS, Node test runner, Capacitor 8.5.3.
**Spec:** [DESIGN.md](DESIGN.md)

## Global constraints
100 levels; portrait mobile plus desktop testing; bright storm visual identity; two coin boosters per attempt; no real payments; ads clearly distinguished from test simulations; update Markdown after each milestone.

## Tasks
- [x] 1. Write failing engine/economy tests, implement board rules, levels and saved progression, run Node tests.
- [x] 2. Build responsive game UI, original weather SVGs, cascade feedback, map, boosters, result dialogs and opt-in ad QA. DOM flows verified; actual browser visual QA blocked by environment and remains a follow-up.
- [x] 3. Add Capacitor configuration and Android/iOS hosts where toolchains permit, production asset build and setup documentation. Build and native sync verified separately from compilation (not performed).
- [x] 4. Independent review and regression fixes, final checks, milestone handoff, root progress index and standalone desktop artifact.

## Review focus
- Invalid swaps never spend moves or coins.
- Reloading results never awards duplicate completion coins.
- Save corruption cannot produce negative balances or unlock arbitrary levels accidentally.
- Dead boards recover without trapping the player; cascade loops have a bounded recovery path.
- Motion, narrow viewports and touch gestures do not prevent completing a game.

## Implementation files
`web/engine.js`: createGame, findMatches, legalMoves, swap, useBooster.
`web/levels.js`: getLevel, regions and 100 level configurations.
`web/progress.js`: validate/load/save progress, completion rewards, affordability.
`web/app.js`, `web/style.css`, `web/icons.js`, `web/index.html`: UI.
`scripts/serve.js`, `scripts/build.js`: local serving and native asset preparation.
`test/*.test.js`: engine and economy regression checks.
