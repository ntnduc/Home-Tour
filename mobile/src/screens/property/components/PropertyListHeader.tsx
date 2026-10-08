/**
 * Fixed, full-bleed header for PropertyListScreen (Modern Minimalist base design).
 *
 * Layout:
 * ```
 * ┌──────────────────────────────────────────────┐
 * │  ░ soft blurred half-circle orbs (decor) ░    │  ← covers the top safe-area
 * │  Tài sản              ┌──────────┐            │
 * │  12 tài sản           │ + Thêm   │            │  AddButton (solid, primary)
 * │  ┌────────────── Search ─────────────────┐    │
 * │  └───────────────────────────────────────┘    │
 * └──────────────────────────────────────────────┘ ← soft shadow grows on scroll
 * ```
 *
 * Visual language:
 * - Spans the entire top area (status-bar inset included) with a light surface.
 * - Two low-opacity brand/info orbs, clipped at the top edge into soft half-circles,
 *   blurred by a light `BlurView` for a gentle, natural color wash.
 * - A bottom separator shadow that fades in as the global body list scrolls,
 *   so the fixed header lifts away from the moving content.
 *
 * Always visible above the FlatList; does not scroll with content.
 */

import { tokens } from "@/theme";
import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddButton from "@/components/AddButton";
import SearchField from "@/components/SearchField";
import { PROP_SPACE, propColors, propType } from "../propertyListStyles";

export interface PropertyListHeaderProps {
  total?: number;
  isLoading: boolean;
  onPressCreate: () => void;
  onSearch: (value: string) => void;
  /** Global body scroll offset — drives the header's bottom separator shadow. */
  scrollY: SharedValue<number>;
}

/** Distance (px) over which the bottom shadow fades from hidden to full. */
const SHADOW_FADE_DISTANCE = 56;
/** Peak softness of the bottom separator shadow. */
const SHADOW_MAX_OPACITY = 0.1;
const SHADOW_MAX_ELEVATION = 6;

/**
 * PropertyListHeader — fixed, full-bleed section above the FlatList.
 *
 * Row 1: Title + count caption + create button
 * Row 2: Search field
 *
 * Count caption shows "—" while `isLoading`; uses server-side `total`
 * (not a sum of loaded pages, which would be wrong for pagination).
 */
const PropertyListHeader = ({
  total,
  isLoading,
  onPressCreate,
  onSearch,
  scrollY,
}: PropertyListHeaderProps) => {
  const insets = useSafeAreaInsets();

  // Global body scroll — reveal a soft bottom shadow as the main list scrolls.
  const shadowStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, SHADOW_FADE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      shadowOpacity: progress * SHADOW_MAX_OPACITY,
      elevation: progress * SHADOW_MAX_ELEVATION,
    };
  });

  return (
    <Animated.View style={[styles.shadowLayer, shadowStyle]}>
      <View style={[styles.clip, { paddingTop: insets.top }]}>
        {/* Decorative blurred half-circle orbs — soft color wash, no interaction. */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={[styles.orb, styles.orbPrimary]} />
          <View style={[styles.orb, styles.orbAccent]} />
          <BlurView
            intensity={38}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.content}>
          {/* Row 1: Title + count + Add button */}
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Text style={propType.title}>Tài sản</Text>
              <Text style={propType.caption}>
                {isLoading ? "—" : `${total ?? 0} tài sản`}
              </Text>
            </View>
            <AddButton
              label="Thêm"
              icon="add"
              variant="solid"
              onPress={onPressCreate}
              accessibilityLabel="Thêm tài sản"
            />
          </View>

          {/* Row 2: Search field */}
          <SearchField
            placeholder="Tìm theo tên hoặc địa chỉ…"
            onSearch={onSearch}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadowLayer: {
    backgroundColor: propColors.card,
    // Draw above the list so the bottom shadow lifts over scrolling content.
    zIndex: 10,
    shadowColor: propColors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  clip: {
    overflow: "hidden",
    backgroundColor: propColors.card,
  },
  content: {
    paddingHorizontal: PROP_SPACE.screen,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleCol: {
    flex: 1,
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orbPrimary: {
    width: 220,
    height: 220,
    top: -96,
    right: -48,
    backgroundColor: tokens.colors.primary,
    opacity: 0.14,
  },
  orbAccent: {
    width: 170,
    height: 170,
    top: -70,
    left: -46,
    backgroundColor: tokens.colors.info,
    opacity: 0.1,
  },
});

export default PropertyListHeader;
