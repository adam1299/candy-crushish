# 003 — Native hosts, review and handoff

Date: 2026-10-14

## Delivered
- Capacitor 8.5.3 Android and iOS projects, provisionally `com.adam1299.weatherworkshop`.
- Locked dependencies; Node scripts for tests, server, build and native sync.
- Standalone `dist/Weather-Workshop.html` desktop artifact, recreated by `npm run build`.
- README with platform setup, controls, ad limitations and source map.
- AGENTS.md / PROGRESS.md / numbered notes for the next conversation.

## Verification evidence
- `node --test`: **23 passed, 0 failed**.
- Includes 100 settled/playable level starts and 300 seeded ten-move gameplay sequences; checks full boards, legal moves and settled cascades.
- `node scripts/build.js`: success, bundled standalone plus native web assets.
- `node node_modules/@capacitor/cli/bin/capacitor add android` and `add ios`: both succeeded.
- `node node_modules/@capacitor/cli/bin/capacitor sync`: Android/iOS/web succeeded.
- Android SDK not present at the conventional local SDK path; native compilation not performed. iOS build requires macOS/Xcode. Native hosts still use default launcher/splash art.
- Browser visual QA blocked as explained in milestone 002. DOM verification is separate.

## Review fixes
Independent code reviewer found two important defects. Both reproduced with failing regression tests and fixed:
1. Swapping a color blast also cleared its original color. Engine now skips the already-triggered special's self-color activation; exact cleared-index regression passes.
2. Successful keyboard swaps lost focus during board replacement. UI now retains/restores the focused tile across animation; regression passes.
No unresolved reviewer findings.

## Decisions and remaining scope
Implemented the authorized first playable foundation, not a store-ready release. Levels are deterministic configurations with rising energy/collection/frost demands and relief levels, not individually balanced handcrafted boards. No wind paths, delivery goals or spreading storm generators yet. Persistence saves unlocks, stars, coins and settings, not an interrupted board.

Ads currently have only an explicit browser QA simulator. Need provider choice, real application/ad-unit IDs, audience/consent design and native SDK callbacks. No production ad revenue is possible from this build. Purchases are intentionally deferred; editable local currency must not be used for paid packs without trusted verification.

## Next recommended implementation
1. Visually playtest standalone desktop and emulator/device builds; capture layout/animation issues.
2. Tune a representative 10-level set and add distinct board shapes/hazards before claiming the 100-level campaign is balanced.
3. Add native test ads after provider/audience choices; use genuine SDK completion callbacks and caps.
4. Replace native starter art, verify safe areas, background/resume and Android back behavior.
5. Later: store signing, privacy/support material, cloud/paid-currency design and purchases.

After each implementation: add the next numbered Markdown note and update the root index. Run the full suite and record exact remaining gaps.

## Git delivery
Initial local commit: `e1615c1`. A follow-up documentation/whitespace cleanup records this delivery state. Remote push was attempted and failed before authentication: sandbox denial (`0xC0000022`) in Git Credential Manager's MSYS helper. No force push or credential workaround attempted. Push from an authenticated host terminal: `git push -u origin main`. Work is safely committed locally; do not assume GitHub has the files.

Standalone desktop deliverable was also copied to `../Weather-Workshop.html` beside the local repository for easy opening. The repository's `dist/` copy is generated and ignored by Git.
