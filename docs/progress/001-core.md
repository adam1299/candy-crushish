# 001 — Core rules and economy

Date: 2026-10-14

Implemented `web/engine.js`, `web/levels.js`, `web/progress.js`. Includes deterministic random boards, matches, cascades, line/burst/color specials, frost, win/loss, 100 parameterized levels, 2-use booster cap, wallet validation, first-clear/replay rewards, duplicate completion protection and sequential unlocks.

Verification: `node --test` — 13 passed, 0 failed. Tests written and run failing before implementation. All 100 configurations produce full, settled boards with legal moves for their test seeds.

Limits: no UI yet; difficulty is unbalanced; local currency is not secure enough for real money; ad integration is not implemented. Additional special-generation and randomized gameplay checks will follow with UI verification.

Next: responsive UI and browser testing, then mobile packaging. See `docs/PLAN.md`.
