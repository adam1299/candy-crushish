# 002 — Playable interface and desktop build

Date: 2026-10-14

## Changes
Responsive portrait-first board and desktop expedition dashboard; source-authored weather SVG pieces and CSS storm art. Tap, swipe and keyboard input; cascades and sound; score/collection/frost objectives; hints, restart, map, settings, booster targeting, win/loss, coin rewards and persistence. Optional `?ads=test` rewarded-ad simulator is labeled QA and absent from normal mode. Added bundled standalone desktop HTML using esbuild.

## Verification
DOM integration tests exercise actual compiled application handlers in JSDOM: successful swap, coin purchase/cancel, swipe, keyboard focus, 100-level map locks, settings persistence, complete win/unlock, ad cancel and ad completion. Combined final suite: 23 passing checks including engine/economy tests. `node scripts/build.js` succeeds.

## Limitations
Browser automation could not connect from its host to the execution sandbox's local servers; file navigation was explicitly rejected by browser URL policy. No screenshot/visual verification was completed, and no bypass was attempted. A standalone file is provided for the user to open directly. DOM tests do not measure layout, animation rendering, real touch behavior or device performance.

## Next
User playtest on desktop and phone; visual QA at 360px, 390px and 1440px; improve pacing and handcrafted board variation. Real ads remain unimplemented pending provider and account configuration.
