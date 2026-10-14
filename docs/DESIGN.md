# Weather Workshop — implementation brief

2026-10-14. The user selected this theme and explicitly authorized implementation.

## Product
Portrait-first match-three storm arcade. Neon cyan, violet, orange and electric yellow over deep navy; original vector weather pieces, animated cascades and lightning. Desktop uses the same game with a wider dashboard. Tap two adjacent tiles or swipe; keyboard buttons work too. Distinct silhouettes supplement color. Reduced-motion and sound controls are available.

## First playable milestone
- An 8×8 board, six weather objects; 5 kinds initially and 6 later.
- Legal swaps, match detection, gravity/refill, cascades, dead-board reshuffle, move-limited win/loss, retry.
- Matches of four create a line clear; five create a color clear; intersecting matches create a burst. Specials activate when matched; a color clear can be swapped with a neighbor.
- 100 deterministic level configurations across five regions. Rising score/collection/frost objectives and tighter move budgets, with relief levels. Initial balance is provisional and requires human playtesting.
- Persistent level unlocks, best stars, wallet and settings on this device. No cloud account.
- First clear pays 30 coins + 5 per star; replay pays 5. Start with 150 coins. Pin 120, 3×3 burst 240, row lightning 300; maximum two coin boosters per attempt. Charges occur only on valid use.
- Optional rewarded-ad placement after a win; browser QA mode explicitly simulates an ad. Production ads remain unavailable until a real SDK, consent flow and account IDs are configured. No simulated ad appears without explicit QA opt-in.
- Future real-money purchases are not implemented. Local balances are unsuitable for paid currency without receipt validation and a trusted ledger.

## Architecture and platform
Plain ES modules for a deterministic game engine, level definitions, wallet/save logic, and DOM/SVG UI. Node built-in tests and static development server. Capacitor 8.5.3 wraps the same web assets for Android/iOS. Native builds need their SDK toolchains; iOS signing/build requires macOS and Xcode. No unrelated framework or backend.

## Verification
Engine tests cover illegal swaps, board boundaries, cascades, special activation, frost, win/loss, reshuffling and booster caps. Save/economy tests cover corruption, duplicate rewards, replay rewards and insufficient funds. Sample all 100 levels for stable playable initial boards. Browser QA covers desktop/mobile dimensions, input, dialogs and persistence. Native project generation is not native device verification.

## Release follow-ups
Human balance pass, device performance and safe-area testing, native ad integration with test IDs/consent, real store IDs/signing, privacy documents, purchase receipt verification. No store publication is authorized by this milestone.
