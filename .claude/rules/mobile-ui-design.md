---
paths:
  - "mobile/src/**/*.tsx"
---

# Mobile UI — "Modern Minimalist" design system

**Scope:** mandatory for new screens, new sections and redesigns. For small fixes in legacy screens, match the file's
existing style (NativeWind `className` or `useTheme()`+StyleSheet) — don't half-migrate a file.
Inside this system: `StyleSheet.create` + `tokens` from `@/theme` only — no `className`, no hex (`npm run check:colors` fails on new hex).

Reference implementation (open only what you need): `src/screens/dashboard/` (`DashboardScreen.tsx` layout doc, `homeStyles.ts`
design constants, `hooks/useHomepageData.ts` parallel data + refresh, `components/` hero/bento/feed/carousel) and
`src/screens/property/PropertyListScreen.tsx` (list screen). Backend for a screen: `backend_v2/src/modules/homepage/`.
Shared UI already in `src/components/`: `PressableScale`, `SkeletonBlock`, `SectionError`, `SearchField`, `EmptyState`.
Shadows: `shadows.soft|medium|hero` from `@/theme`. Still dashboard-local: `SectionHeader`, `ProgressRing` — the first time
another screen needs one, move it to `src/components/` in a dedicated step; never import across `screens/<other-feature>/`.

## Visual language
- Depth = layering, not borders: canvas `colors.surfaceMuted` → cards `colors.surface` (`soft`) → raised/KPI cards (`medium`)
  → max one hero `colors.primaryStrong` + translucent orbs (`hero`). Shadows always include Android `elevation` (the presets do).
- Radius (cards ≥ 20): hero 28 · card 24 · tile 20 · icon squircle 16 (small 10–12) · pill 999.
- Spacing: gutter 20 · grid gap 12 · between sections 28 · card padding 16 (hero 22).
- Type: display 30/36 bold −0.8 · title 24/36 bold −0.5 · section 18/28 bold −0.3 · body 14/20 · caption 12/16 muted ·
  eyebrow 11/14 bold UPPERCASE +1.1.
- Colors only via `tokens.colors.*` / `tokens.palette.*` / `statusColor`. Translucent `rgba(255,255,255,α)` defined once in the
  screen's styles file. Ink = `palette.gray[900]`. Severity: critical→`error/errorSurface`, warning→`palette.amber[500]/warningSurface`,
  info→`info/infoSurface`, success→`success/successSurface`.

## Layout grammar
- Vertical narrative: who am I → money → occupancy/KPIs → actions → needs attention → live items.
- One full-width hero at the top · asymmetric bento for KPIs (left `flex: 1.25`, right column of 2 stacked `flex: 1`) ·
  symmetric action grid right after · alerts = one card with hairline-divided rows.
- Horizontal carousel: fixed card width ≈232, `snapToInterval = width + gap`, `decelerationRate="fast"`, bleed with
  `marginHorizontal: -20` + `contentContainerStyle.paddingHorizontal: 20`. Filter chips bleed the same way; hide when ≤ 1 option.
- Section header = bold title + optional dark count badge + optional "Xem tất cả ›".

## Interaction
- Every touchable: `PressableScale` (`activeOpacity={0.6}` + spring). `scaleTo`: hero 0.985 · card 0.97 · row 0.98 ·
  tile/chip 0.93–0.94 · round icon 0.92. Targets ≥ 44pt (`hitSlop` on small links); `accessibilityLabel` on icon-only buttons.
- Animations via `react-native-reanimated` on the UI thread: reveals `withTiming` 900ms `Easing.out(Easing.cubic)`; skeleton pulse 750ms.

## Data & states
- One hook per screen `screens/<feature>/hooks/use<Feature>Data.ts`; screens never call `api/*` directly.
- Independent sections ⇒ independent endpoints fetched in parallel (`useQueries`; backend `Promise.all`). Keys `[feature, section, filterKey]`,
  `placeholderData: keepPreviousData`, `staleTime: 30_000`; unwrap the envelope and throw when `data` is missing.
- `RefreshControl` bound to the hook's own `isRefreshing` (not `isFetching`), tint `colors.primary`. Refetch on `useFocusEffect`, skipping first focus.
- Per section: first load → shaped `SkeletonBlock`s · background refetch → keep data, `opacity: 0.6` · error w/o data → `SectionError`
  with retry · empty → friendly card (icon + one Vietnamese line). Never block other sections.
- Screen backend: dedicated module, one endpoint per section, scoped to accessible properties (403 for foreign `propertyId`), empty scope ⇒ zeroed payload.

## Code
- Folder per screen: `<Feature>Screen.tsx`, `components/`, `hooks/`, `<feature>Styles.ts`, `<feature>Format.ts`, `<feature>Navigation.ts`.
- Screen = orchestration only; each section its own component with a JSDoc layout/UX note (ASCII for screens/grids). `StyleSheet.create` at file bottom.
- Icons: `Ionicons` (`React.ComponentProps<typeof Ionicons>["name"]`); no new icon packages.
- Navigation typed with `CompositeNavigationProp<BottomTabNavigationProp<TabParamList>, NativeStackNavigationProp<RootStackParamList>>`;
  only route to routes in `navigation/types.ts`.
- Vietnamese copy; money compact (`1,2 tr`, `850 N`) in widgets, `formatCurrency` in detail views. No `any`, mocks, or `TODO`.

## Pitfalls
- iOS clips shadows with `overflow: "hidden"` → outer view (shadow + radius + bg) wraps inner clipping view.
- `StyleSheet.absoluteFillObject` isn't typed in RN 0.86 → `position: "absolute", top: 0, right: 0, bottom: 0, left: 0`.
- `tokens.typography.fontWeight.*` is `string` → cast via a typed map (`homeWeight` in `homeStyles.ts`).
- Horizontal `FlatList` with shadows needs `overflow: "visible"` + some `paddingBottom`.
- Tab screens: `SafeAreaView edges={["top"]}`.

## Done when (from `mobile/`)
1. `npx tsc --noEmit` — no new errors in touched files (repo has pre-existing errors; compare by file).
2. `npm run check:colors` passes.
3. `npx expo export --platform ios --output-dir /tmp/<name>-export` bundles (catches Babel/worklet errors); delete the dir after.
