# Weather Workshop — START HERE

## Current state
Milestone 003: playable first foundation implemented. Shared desktop/mobile web UI, 100 provisional level configurations, coins/boosters and local progress. Android/iOS hosts generated and synced. **23 tests pass.** Native compilation, real-device testing, visual QA, level balancing and production ads/purchases remain outstanding.

## Index
- [001 — Core rules and economy](docs/progress/001-core.md)
- [002 — Playable UI and standalone desktop build](docs/progress/002-playable-ui.md)
- [003 — Native hosts, review, verification and next-agent handoff](docs/progress/003-native-review-handoff.md)
- [Run/build instructions](README.md)
- [Design](docs/DESIGN.md)
- [Implementation plan](docs/PLAN.md)

## Next-agent instructions
Read `AGENTS.md`, this index, and the latest milestone. Run `node --test`. Preserve user direction: energetic storm visuals, Android/iOS plus desktop testing, and a Markdown handoff after every implementation milestone.

## Quick start
`npm ci`, `npm test`, `npm start`. To open directly: `npm run build`, then open `dist/Weather-Workshop.html`. To update native hosts: `npm run sync`.

## Repository state
Initial implementation prepared in the local clone of `https://github.com/adam1299/candy-crushish`. See Git history/status for commit and push state; never assume local files reached GitHub from this note alone.
