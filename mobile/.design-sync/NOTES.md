# design-sync notes — Home Tour (mobile)

## Scope (user decision, 2026-10-17)
- **Only** the components used by `DashboardScreen` and `PropertyListScreen` (18) + `src/theme` tokens. Do not widen the scope without asking.
- The app is **mobile-only** (iOS/Android). react-native-web is a render bridge for claude.ai/design only — never add web deps to `mobile/package.json`.
- The screens themselves aren't exported (data hooks + navigation). Reference-screen compositions live as preview cells:
  `HomeHeader › DashboardScreen` and `PropertyListHeader › PropertyListScreen`.

## How the build works
- `cfg.buildCmd` = `node .design-sync/web/build.mjs` → `.design-sync/web-dist/` (gitignored): ESM `index.js` from `.design-sync/web/entry.ts` with `react-native` → `react-native-web`, `.web.*` resolution first, react/react-dom external; `.d.ts` via tsc extending the app tsconfig (36 pre-existing repo type errors, all outside scope — declarations still emit; `@/` specifiers rewritten to relative).
- Web deps live in gitignored `.ds-sync/web-deps` — on a fresh clone / re-sync recreate them FIRST:
  `(cd .ds-sync/web-deps && echo '{"private":true}' > package.json && npm i react@19.2.3 react-dom@19.2.3 react-native-web)` — keep react pinned to the app's `react` version.
- Converter: `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules .ds-sync/web-deps/node_modules --out ./ds-bundle` (entry comes from `cfg.entry`).
- Adding a component: export it in `entry.ts`, add `.design-sync/previews/<Name>.tsx`; if its props use domain types from `src/types/*`, add a `cfg.dtsPropsFor` body with the shape inlined (tsc leaves them as bare names the design agent can't see).
- Previews import ONLY from `'home-tour-mobile'` (RN primitives are re-exported for this) — importing `react-native` directly would bundle native RN. Shared sample data: `.design-sync/preview-kit/fixtures.tsx` (kept outside `previews/` so it isn't read as a stale component preview).

## Fixes applied (don't rediscover)
- `process is not defined` (Reanimated reads `process.env.JEST_WORKER_ID`) → build.mjs banner defines `process`.
- `node:async_hooks` from expo-font's SSR registry → inert shim plugin in build.mjs.
- `No safe area value available` (PropertyListHeader → `useSafeAreaInsets`) → `cfg.provider` = `SafeAreaProvider` with zero insets on a 390×844 frame.
- esbuild warns `direct eval` (react-native-uuid via `appUtil`) — harmless; `homeFormat` → `appUtil.formatCurrency` also drags axios/netinfo into the bundle (bloat only).

## Verification (no Chromium on this machine — user declined the install)
- `package-validate.mjs` runs with `--no-render-check`. Substitute crash gate: `node .ds-sync/smoke.mjs ./ds-bundle` mounts every cell in jsdom with real react-dom/client (needs `jsdom` in `.ds-sync`: `(cd .ds-sync && npm i jsdom)`). `smoke.mjs` is staged, not committed — copy at `.design-sync/web/smoke.mjs`.
- Visual review was by the user via `ds-bundle/.review.html` and the Claude Design project. No machine grades exist.

## Known render warns
- `[CSS_RUNTIME]` ×2 — expected: react-native-web injects styles at runtime; no static CSS exists.
- `[RENDER_SKIPPED]` — expected while Chromium isn't installed.

## Re-sync risks
- `cfg.dtsPropsFor` bodies **inline** the shapes of `HomepageSummary`, `HomepageRoomFeedItem`, `HomepageAlert`, `PropertyListResponse`, `QuickAction` — they silently go stale when `src/types/homepage.ts` / `property.ts` / `room.ts` change. Diff them on every re-sync.
- `preview-kit/fixtures.tsx` mirrors the same payloads — same staleness risk.
- `react-native-web` version is unpinned (0.21.4 at first sync); a major bump can change rendering — check the cards after reinstalling.
- Reanimated 4 runs on web without the worklets Babel plugin (works for static previews today); a Reanimated upgrade can break this.
- Renders were never Chromium-screenshotted; installing Playwright+Chromium later and dropping `--no-render-check` would give real grading.
