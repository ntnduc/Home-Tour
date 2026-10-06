---
name: 'Mobile UI — Modern Minimalist design system'
description: 'Use when designing, building, refactoring, or reviewing React Native screens/components in mobile/ (layout, cards, shadows, typography, micro-interactions, loading states, data hooks).'
applyTo: '**/*.tsx'
---

# Mobile UI — "Modern Minimalist" design system

Distilled from the approved Landlord HomePage. **Reference implementation** (read it before inventing anything new):

| Concern | File |
| --- | --- |
| Screen orchestration + ASCII layout doc | [DashboardScreen.tsx](../../mobile/src/screens/dashboard/DashboardScreen.tsx) |
| Design layer (radius, spacing, colors, shadows, type scale) | [homeStyles.ts](../../mobile/src/screens/dashboard/homeStyles.ts) |
| Parallel data hook + pull-to-refresh | [useHomepageData.ts](../../mobile/src/screens/dashboard/hooks/useHomepageData.ts) |
| Tactile press wrapper | [PressableScale.tsx](../../mobile/src/screens/dashboard/components/PressableScale.tsx) |
| Hero card with layered depth + SVG ring | [RevenueHeroCard.tsx](../../mobile/src/screens/dashboard/components/RevenueHeroCard.tsx), [ProgressRing.tsx](../../mobile/src/screens/dashboard/components/ProgressRing.tsx) |
| Asymmetric bento grid | [StatBento.tsx](../../mobile/src/screens/dashboard/components/StatBento.tsx) |
| Live feed list / horizontal carousel | [AlertFeed.tsx](../../mobile/src/screens/dashboard/components/AlertFeed.tsx), [RoomStatusCarousel.tsx](../../mobile/src/screens/dashboard/components/RoomStatusCarousel.tsx) |
| Section states | [SkeletonBlock.tsx](../../mobile/src/screens/dashboard/components/SkeletonBlock.tsx), [SectionError.tsx](../../mobile/src/screens/dashboard/components/SectionError.tsx), [SectionHeader.tsx](../../mobile/src/screens/dashboard/components/SectionHeader.tsx) |
| Backend: one endpoint per UI section, scoped per property | [backend_v2/src/modules/homepage/](../../backend_v2/src/modules/homepage) |

## 0. Scope & precedence

- **Mandatory** for new screens, new sections, and redesigns (everything produced by the UI pipeline agents).
- Small fixes inside legacy screens: match the surrounding file's existing style (NativeWind or StyleSheet); don't half-migrate a file.
- Inside this system, styling is **`StyleSheet.create` + `tokens` from `@/theme`** — no `className`, no inline hex.

## 1. Visual language

**Depth = layering, not borders.** Stack from back to front:

| Layer | Surface | Shadow tier |
| --- | --- | --- |
| Canvas | `tokens.colors.surfaceMuted` | none |
| Card | `tokens.colors.surface` | `soft` |
| Raised card (interactive / KPI) | `surface` | `medium` |
| Hero (one per screen max) | `tokens.colors.primaryStrong` + decorative translucent orbs | `hero` (brand-tinted) |

Shadow tiers (always include Android `elevation`):

| Tier | offset y | opacity | radius | elevation | color |
| --- | --- | --- | --- | --- | --- |
| soft | 4 | 0.05 | 12 | 2 | `palette.gray[900]` |
| medium | 10 | 0.08 | 20 | 5 | `palette.gray[900]` |
| hero | 18 | 0.32 | 28 | 12 | `palette.brand[700]` |

Radius scale (**cards ≥ 20**): hero `28` · card `24` · tile `20` · icon squircle `16` (small icon 10–12) · pill `999`.

Spacing: screen gutter `20` · grid gap `12` · between sections `28` · card padding `16` (hero `22`).

Type scale (letter-spacing tightens as size grows):

| Role | size / line | weight | tracking |
| --- | --- | --- | --- |
| display (hero numbers, KPIs) | 30 / 36 | bold | -0.8 |
| title (names, mini-stat values) | 24 / 36 | bold | -0.5 |
| section header | 18 / 28 | bold | -0.3 |
| body | 14 / 20 | regular | 0 |
| caption | 12 / 16 | regular, `muted` | 0 |
| eyebrow (labels above numbers) | 11 / 14 | bold, UPPERCASE | +1.1 |

Color rules:
- Colors only via `tokens.colors.*` / `tokens.palette.*` / `statusColor` (badges). `npm run check:colors` fails on new hex.
- Translucency (glass chips, ring track, on-hero muted text) = `rgba(255,255,255,α)` defined once in the screen's styles file, never inline in JSX.
- High-contrast "ink" = `palette.gray[900]` for primary text, active chips, avatar, count badges.
- Severity tones: critical → `error`/`errorSurface`, warning → `palette.amber[500]`/`warningSurface`, info → `info`/`infoSurface`, success → `success`/`successSurface`.

## 2. Layout grammar

- **Vertical narrative**: who am I → money → occupancy/KPIs → what can I do → what needs attention → live items.
- **Full-width hero** at the top of content; only one.
- **Asymmetric bento** for KPIs: tall left card `flex: 1.25` + right column of two stacked cards `flex: 1` (left height = 2 right cards + gap).
- **Symmetric grid** (e.g. 4 equal quick-action tiles) directly after an asymmetric block → "dynamic ↔ calm" rhythm.
- **Horizontal carousel**: fixed card width (≈232) so the next card peeks; `snapToInterval = width + gap`, `decelerationRate="fast"`; bleed to screen edges with `marginHorizontal: -20` + `contentContainerStyle.paddingHorizontal: 20`.
- **Lists of alerts**: one card containing hairline-divided rows (not N separate cards).
- Filter chips row: horizontal scroll, bleed like carousels, hidden when ≤ 1 option.
- Section header = bold title + optional dark count badge + optional right "Xem tất cả ›" link.

## 3. Interaction & motion

- Every touchable uses `PressableScale` (`activeOpacity={0.6}` + spring scale) or at minimum `TouchableOpacity activeOpacity={0.6}`.
- `scaleTo` by element size: hero `0.985` · cards `0.97` · rows `0.98` · tiles/chips `0.93–0.94` · round icon buttons `0.92`.
- Animations run on the UI thread with `react-native-reanimated` (worklets Babel plugin is configured). Progress/number reveals: `withTiming` 900 ms `Easing.out(Easing.cubic)`; skeleton pulse: 750 ms repeat-reverse.
- Touch targets ≥ 44 pt; use `hitSlop` on small links. Add `accessibilityLabel` to icon-only buttons.

## 4. Data, states & refresh

- One **custom hook per screen** in `screens/<feature>/hooks/use<Feature>Data.ts`; screens never call `api/*` directly.
- Independent sections ⇒ **independent endpoints fetched in parallel** with React Query `useQueries` (client-side `Promise.all`); backend services also `Promise.all` independent queries. Query keys: `[feature, section, filterKey]`.
- `placeholderData: keepPreviousData`, `staleTime: 30_000`; unwrap the `{ success, data }` envelope and throw when `data` is missing.
- Pull-to-refresh: `RefreshControl` bound to the hook's own `isRefreshing` (set around `Promise.all(refetch…)`), **not** `isFetching` (otherwise the spinner fires on background refetches). Tint with `tokens.colors.primary`.
- Refetch on `useFocusEffect`, skipping the first focus.
- Per section, never block other sections:
  - first load (`isPending`) → `SkeletonBlock`s shaped like the real content;
  - background refetch → keep data, dim to `opacity: 0.6`;
  - error with no data → local `SectionError` with retry;
  - empty → friendly empty card (icon + one line of Vietnamese copy).
- Backend for a screen: a dedicated module (e.g. `modules/homepage`), one endpoint per section, data scoped to properties the user owns or has a `UserRole` on (403 for a foreign `propertyId`), empty scope ⇒ zeroed payload, not an error.

## 5. Code conventions

- Folder per screen: `screens/<feature>/{<Feature>Screen.tsx, components/, hooks/, <feature>Styles.ts, <feature>Format.ts, <feature>Navigation.ts}`.
- Screen file = orchestration only; each section is its own component with a **JSDoc block explaining its layout/UX role** (ASCII diagram for grids/screens).
- `StyleSheet.create` at the bottom of each file; shared visual constants live in the screen's styles file.
- Icons: `Ionicons` from `@expo/vector-icons` (type names as `React.ComponentProps<typeof Ionicons>["name"]`). No new icon packages.
- Navigation typed with `CompositeNavigationProp<BottomTabNavigationProp<TabParamList>, NativeStackNavigationProp<RootStackParamList>>`; route only to routes that exist in `navigation/types.ts`.
- All UI copy in **Vietnamese**; money via compact formatter (`1,2 tr`, `850 N`) in widgets, full `formatCurrency` in detail views.
- No `any`, no placeholder/mock data, no `TODO` left behind.
- **Promotion rule:** `PressableScale`, `SkeletonBlock`, `SectionHeader`, `SectionError`, `ProgressRing` and the shadow/radius presets currently live under `screens/dashboard/`. The first time another screen needs them, move them (in a dedicated step) to `src/components/ui/` and `src/theme/`, and update dashboard imports — never import across `screens/<other-feature>/`.

## 6. Known pitfalls (learned the hard way)

- **iOS clips shadows with `overflow: "hidden"`** → wrap: outer view carries the shadow + radius + background, inner view clips decorative children.
- `StyleSheet.absoluteFillObject` does not exist in RN 0.86 types → write `position: "absolute", top: 0, right: 0, bottom: 0, left: 0`.
- `tokens.typography.fontWeight.*` is typed `string` (comes from `tokens.js`) → cast once via a typed map (`TextStyle["fontWeight"]`, see `homeWeight` in `homeStyles.ts`).
- Horizontal `FlatList` that shows shadows needs `overflow: "visible"` and some `paddingBottom`.
- Use `SafeAreaView edges={["top"]}` on tab screens (the tab bar owns the bottom inset).

## 7. Definition of Done (run from `mobile/`)

1. `npx tsc --noEmit` — **no new errors in touched files** (the repo has pre-existing errors; compare by file).
2. `npm run check:colors` — passes.
3. `npx expo export --platform ios --output-dir /tmp/<name>` — bundles (catches Babel/worklet errors `tsc` misses); delete the output dir afterwards.
4. Backend touched → from `backend_v2/`: `npx tsc --noEmit -p tsconfig.json` and the module's Jest spec (see the coder agent for the Jest config workaround).
