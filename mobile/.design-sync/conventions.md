# Home Tour — mobile design conventions

**This is a React Native (iOS/Android) app.** Design phone screens only: 390pt wide, portrait. Components render here through react-native-web, but the code you write must be valid React Native — it ships to `mobile/src` unchanged.

## Setup
- Import everything from the bundle global `HomeTour` (`const { View, Text, StatBento, tokens } = window.HomeTour`). Never use HTML tags (`div`, `span`, `button`), CSS classes, or `className` — only RN primitives exported here: `View`, `Text`, `ScrollView`, `FlatList`, `Image`, `StyleSheet`, `SafeAreaView`, `Ionicons`.
- Wrap every screen in `SafeAreaProvider` — `PropertyListHeader` throws without it.
- Screen root: `<View style={{ width: 390, backgroundColor: tokens.colors.surfaceMuted }}>`.

## Styling idiom — `StyleSheet` + tokens, never hex
- Colors: `tokens.colors.{primary, primaryMuted, primaryStrong, onPrimary, surface, surfaceMuted, foreground, muted, subtle, border, success, successSurface, warning, warningSurface, error, errorSurface, info, infoSurface}`; ink text = `tokens.palette.gray[900]`; ramps `tokens.palette.{gray, green, amber, blue, red}[50–900]`. Screen aliases: `homeColors.{canvas, card, heroBg, ink, textMuted, hairline}`, `propColors.{canvas, card, ink, textMuted}`.
- Depth = layering, not borders: canvas `surfaceMuted` → card `surface` + `shadows.soft` → KPI card `shadows.medium` → at most ONE hero (`primaryStrong`, `shadows.hero`).
- Radius: `HOME_RADIUS.{hero 28, card 24, tile 20, icon 16, pill 999}` (`PROP_RADIUS` has the same card/tile/icon/pill, no hero). Cards are never < 20.
- Spacing: `HOME_SPACE.{screen 20, gap 12, section 28}` — gutter 20, grid gap 12, 28 between sections, card padding 16 (hero 22).
- Type: `homeType.*` / `propType.{title, section, body, caption, eyebrow}` — section titles 18/28 bold; body 14/20; caption 12/16 muted; eyebrow 11 bold UPPERCASE. Weights via `homeWeight.{regular, medium, semibold, bold}`.
- Every pressable surface is `PressableScale` (`scaleTo`: hero 0.985, card 0.97, chip 0.93). Icons: `Ionicons` names only.
- Copy is **Vietnamese**; money compact in widgets (`96,4 tr`, `850 N`).

## Layout grammar (from the two reference screens)
- **Dashboard** (card `HomeHeader › DashboardScreen`): `HomeHeader` + `PropertyFilterChips` → `RevenueHeroCard` → `StatBento` → `SectionHeader` + `QuickActionGrid` → `SectionHeader` + `AlertFeed` → `SectionHeader` + `RoomStatusCarousel`.
- **List screen** (card `PropertyListHeader › PropertyListScreen`): `PropertyListHeader` on top, then a column of `PropertyCardComponent` (gap 12, gutter 20).
- Each section handles its own state: loading → `isLoading` skeletons (`PropertyCardSkeleton`, `SkeletonBlock`); error → `SectionError onRetry`; empty → `EmptyState` (icon + one Vietnamese line, optional action).

## Where the truth lives
Per-component API: `components/<group>/<Name>/<Name>.d.ts` (props, incl. inlined data shapes) and `<Name>.prompt.md`. Data-driven components take real API payload shapes — copy them from the `.d.ts`, don't invent fields.

## Example
```jsx
const { SafeAreaProvider, View, SectionHeader, AlertFeed, EmptyState, tokens, HOME_SPACE } = window.HomeTour;

<SafeAreaProvider>
  <View style={{ width: 390, backgroundColor: tokens.colors.surfaceMuted, padding: HOME_SPACE.screen }}>
    <SectionHeader title="Cần xử lý" count={2} />
    <AlertFeed alerts={alerts} isLoading={false} isFetching={false} onPressAlert={() => {}} />
    <View style={{ marginTop: HOME_SPACE.section }}>
      <EmptyState icon="business-outline" title="Chưa có tài sản nào" actionLabel="Thêm tài sản" onPressAction={() => {}} />
    </View>
  </View>
</SafeAreaProvider>
```

## Not reproduced in the browser preview
Blur (`PropertyListHeader` uses CSS blur here), Android elevation look, spring/scroll animations, safe-area insets (0 here). Don't design around them.
