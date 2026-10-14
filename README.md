# Weather Workshop

Bright, energetic match-three game: weather crystals, dramatic chain reactions, five regions and 100 levels. Shared web game with Android and iOS Capacitor hosts.

**New agent? Read [PROGRESS.md](PROGRESS.md) first.** It indexes the implementation milestones, tests, limitations, and next work. `AGENTS.md` requires an updated Markdown handoff after every implementation milestone.

## Play on desktop

Install Node.js 22+ with npm, then:

```sh
npm ci
npm start
```

Open `http://127.0.0.1:4173`. The server binds only to loopback by default. Set `PORT` if that port is occupied.

For a standalone file with all code and artwork embedded:

```sh
npm run build
```

Open `dist/Weather-Workshop.html` in a modern browser. No server is required for this file. Browser storage policy for file URLs varies; the app warns if saving is unavailable. Browser-server, standalone-file, and native-app saves are separate.

## Controls and game rules

- Tap/click two adjacent pieces, or swipe, to swap. Match 3+ of a kind.
- Invalid swaps are free. Each successful swap uses one move.
- Match 4 for a line clear, 5 for a color blast, or intersecting lines for a 3×3 burst. Match a special to trigger it; swap a color blast with a neighbor to clear that color.
- Meet the energy target, collect the required kind, and melt every frost layer before moves run out.
- Hint and retry are free. Keyboard: Tab to a board button, arrow keys to navigate, Enter/Space to select.
- First clear earns 30 coins + 5 per star; replay earns 5. Start with 150 coins.
- Storm pin costs 120, pressure burst 240, lightning 300. At most two coin boosters per attempt. Arming/canceling a booster costs nothing; tapping a target spends coins. Restarting does not refund boosters.
- Settings control sound and animations. System reduced-motion preference is respected.

## Android

Native project: `android/`. Requires Android Studio, the Android SDK and a compatible JDK as described in [Capacitor setup](https://capacitorjs.com/docs/getting-started/environment-setup).

```sh
npm run sync
npm run android
```

Select a device/emulator in Android Studio and run. App ID is provisionally `com.adam1299.weatherworkshop`; confirm ownership before store publication. Android compilation/device play has not been verified in the initial Windows workspace because the Android SDK was absent.

## iOS

Native project: `ios/App/`. Requires a Mac with Xcode and appropriate signing configuration. Uses Swift Package Manager.

```sh
npm ci
npm run sync
npm run ios
```

Select a signing team and simulator/device in Xcode. Project generation and asset sync were verified on Windows; native iOS compilation/signing were not. See [Capacitor iOS](https://capacitorjs.com/docs/ios).

## Ads and future purchases

**No real ads or payments are enabled.** In the browser, append `?ads=test` to opt into the visibly labeled rewarded-ad simulator. Win a level to test completion (doubles that result's coins) or cancellation (no additional coins). Standard mode does not show simulated rewards.

To launch with real ads, choose an ad provider and implement SDK initialization, test ad units, consent and rewarded-completion callbacks, plus placement frequency caps. Replace the QA flow; never grant rewards merely for opening or closing an ad. App IDs/ad-unit IDs and intended audience are still needed. The test simulator is a QA tool, not production monetization.

Real-money coin/booster sales are deferred. Add platform purchase APIs, receipt validation, restore/refund behavior and a trusted ledger before selling currency. Current local saves are editable and are not a paid-currency security boundary.

## Verify

```sh
npm test
npm run build
npx cap sync
```

The suite covers rules, all level starts, 300 seeded gameplay runs, save/economy validation and DOM interactions including a complete win and ad QA flow. DOM tests are not visual browser or native device tests. Levels are parameterized starting content, not 100 individually playtested puzzles.

## Project map

| Path | Responsibility |
| --- | --- |
| `web/engine.js` | Pure deterministic board, cascades, powers, frost and result rules |
| `web/levels.js` | 100 level configurations and five regions |
| `web/progress.js` | Validated device save and coin economy |
| `web/app.js` | Input, UI, feedback, dialogs and ad QA |
| `web/icons.js`, `web/style.css` | Original SVG weather pieces and visual presentation |
| `scripts/` | Local server and standalone/native web build |
| `test/` | Node rule and DOM integration tests |
| `android/`, `ios/` | Generated native projects; use sync after web changes |
| `docs/progress/` | Numbered milestone handoffs |

All weather illustrations are source-authored SVG/CSS. Native launcher/splash assets are still starter assets and need a release branding pass. No external fonts, artwork services or backend are needed to play.
