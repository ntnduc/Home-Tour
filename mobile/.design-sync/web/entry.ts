/**
 * Claude Design entry — Home Tour reference design system.
 *
 * Scope (by agreement): ONLY the components rendered by the two reference
 * screens, DashboardScreen and PropertyListScreen, plus the theme tokens
 * they use. The screens themselves are not exported (they fetch data and
 * use navigation); previews compose them from these parts instead.
 *
 * This file is compiled for the browser by ./build.mjs with
 * `react-native` aliased to `react-native-web` — a render bridge for
 * claude.ai/design only. The app itself stays mobile-only.
 */

// ── Shared primitives (src/components) ──────────────────────────────────
export { default as PressableScale } from "../../src/components/PressableScale";
export type { PressableScaleProps } from "../../src/components/PressableScale";
export { default as SkeletonBlock } from "../../src/components/SkeletonBlock";
export type { SkeletonBlockProps } from "../../src/components/SkeletonBlock";
export { default as SectionError } from "../../src/components/SectionError";
export type { SectionErrorProps } from "../../src/components/SectionError";
export { default as EmptyState } from "../../src/components/EmptyState";
export type { EmptyStateProps } from "../../src/components/EmptyState";
export { default as SearchField } from "../../src/components/SearchField";
export type { SearchFieldProps } from "../../src/components/SearchField";
export { default as AddButton } from "../../src/components/AddButton";
export type { AddButtonProps } from "../../src/components/AddButton";

// ── Dashboard (src/screens/dashboard/components) ────────────────────────
export { default as HomeHeader } from "../../src/screens/dashboard/components/HomeHeader";
export { default as RevenueHeroCard } from "../../src/screens/dashboard/components/RevenueHeroCard";
export { default as ProgressRing } from "../../src/screens/dashboard/components/ProgressRing";
export { default as StatBento } from "../../src/screens/dashboard/components/StatBento";
export { default as QuickActionGrid } from "../../src/screens/dashboard/components/QuickActionGrid";
export type { QuickAction } from "../../src/screens/dashboard/components/QuickActionGrid";
export { default as PropertyFilterChips } from "../../src/screens/dashboard/components/PropertyFilterChips";
export { default as RoomStatusCarousel } from "../../src/screens/dashboard/components/RoomStatusCarousel";
export { default as AlertFeed } from "../../src/screens/dashboard/components/AlertFeed";
export { default as SectionHeader } from "../../src/screens/dashboard/components/SectionHeader";

// ── Property list (src/screens/property/components) ─────────────────────
export { default as PropertyListHeader } from "../../src/screens/property/components/PropertyListHeader";
export type { PropertyListHeaderProps } from "../../src/screens/property/components/PropertyListHeader";
export { default as PropertyCardComponent } from "../../src/screens/property/components/PropertyCardComponent";
export type { PropertyCardComponentProps } from "../../src/screens/property/components/PropertyCardComponent";
export { default as PropertyCardSkeleton } from "../../src/screens/property/components/PropertyCardSkeleton";

// ── Design tokens (src/theme) + per-screen style tokens ─────────────────
export { tokens, palette, semanticColors, radius, shadows, statusColor } from "../../src/theme";
export { HOME_SPACE, HOME_RADIUS, homeColors, homeType, homeWeight } from "../../src/screens/dashboard/homeStyles";
export { PROP_SPACE, PROP_RADIUS, propColors, propType } from "../../src/screens/property/propertyListStyles";

// ── React Native primitives for layout glue ─────────────────────────────
// The design agent composes screens with the same primitives the app uses.
export { View, Text, ScrollView, FlatList, StyleSheet, Image } from "react-native";
export { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
export { Ionicons } from "@expo/vector-icons";
// PropertyListHeader takes a Reanimated SharedValue for its scroll shadow.
export { useSharedValue } from "react-native-reanimated";
