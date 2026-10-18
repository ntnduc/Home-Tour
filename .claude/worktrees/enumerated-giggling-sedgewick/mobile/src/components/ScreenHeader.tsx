/**
 * Full-bleed screen header for list / tab screens (Modern Minimalist base design,
 * extracted from the Property list header).
 *
 * ```
 * ┌──────────────────────────────────────────────┐
 * │  ░ soft blurred half-circle orbs (decor) ░    │  ← covers the top safe-area
 * │  Title                ┌──────────┐            │  title 24/36 bold −0.5
 * │  12 mục               │ + Thêm   │            │  subtitle caption · `action` slot
 * │  ┌────────────── Search ─────────────────┐    │  optional SearchField
 * │  └───────────────────────────────────────┘    │
 * │  children (filters, chips…)                   │
 * └──────────────────────────────────────────────┘ ← soft shadow grows with `scrollY`
 *
 * `compact` variant (dense lists):
 * ┌──────────────────────────────────────────────┐
 * │  ░ soft blurred half-circle orbs (decor) ░    │  paddingTop 4 · paddingBottom 12 · gap 10
 * │  Title            [action]                    │  title lineHeight 30 (fontSize stays 24)
 * │  ┌────────────── Search ─────────────────┐    │  titleRow alignItems center
 * │  └───────────────────────────────────────┘    │
 * │  children (filters, chips…)                   │
 * └──────────────────────────────────────────────┘
 * ```
 *
 * Use with `SafeAreaView edges={[]}` (the header pads the status bar itself when
 * the screen has no native header, i.e. in the tab navigator).
 */

import { tokens, uiColors, uiSpace, uiType } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IconButton from "./IconButton";
import SearchField from "./SearchField";

export interface ScreenHeaderSearch {
  placeholder?: string;
  defaultValue?: string;
  onSearch: (value: string) => void;
}

export interface ScreenHeaderProps {
  title: string;
  /** Caption under the title (e.g. "12 tài sản"). */
  subtitle?: string;
  /** Right-aligned element next to the title (AddButton, IconButton…). */
  action?: ReactNode;
  /**
   * When set, a leading back button (chevron) is shown before the title —
   * used by stack screens whose native header is hidden.
   */
  onBack?: () => void;
  search?: ScreenHeaderSearch;
  /** Body scroll offset — drives the bottom separator shadow. */
  scrollY?: SharedValue<number>;
  /**
   * Pad the status-bar inset. Defaults to true inside the tab navigator and
   * false inside the stack (where the native header already covers it).
   */
  insetTop?: boolean;
  /** Tighter vertical rhythm for dense list screens (default false). */
  compact?: boolean;
  children?: ReactNode;
}

/** Distance (px) over which the bottom shadow fades from hidden to full. */
const SHADOW_FADE_DISTANCE = 56;
const SHADOW_MAX_OPACITY = 0.1;
const SHADOW_MAX_ELEVATION = 6;

const ScreenHeader = ({
  title,
  subtitle,
  action,
  onBack,
  search,
  scrollY,
  insetTop,
  compact,
  children,
}: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const padTop = insetTop ?? navigation.getState()?.type !== "stack";

  const shadowStyle = useAnimatedStyle(() => {
    if (!scrollY) return { shadowOpacity: 0, elevation: 0 };
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
      <View style={[styles.clip, { paddingTop: padTop ? insets.top : 0 }]}>
        {/* Decorative blurred half-circle orbs — soft color wash, no interaction. */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={[styles.orb, styles.orbPrimary]} />
          <View style={[styles.orb, styles.orbAccent]} />
          <BlurView
            intensity={38}
            tint="light"
            blurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={[styles.content, compact && styles.contentCompact]}>
          <View style={[styles.titleRow, compact && styles.titleRowCompact]}>
            {onBack && (
              <IconButton
                icon="chevron-back"
                onPress={onBack}
                accessibilityLabel="Quay lại"
                style={styles.back}
              />
            )}
            <View style={styles.titleCol}>
              <Text style={[uiType.title, compact && styles.titleCompact]} numberOfLines={1}>
                {title}
              </Text>
              {subtitle !== undefined && (
                <Text style={uiType.caption}>{subtitle}</Text>
              )}
            </View>
            {action}
          </View>

          {search && (
            <SearchField
              placeholder={search.placeholder ?? "Tìm kiếm…"}
              defaultValue={search.defaultValue}
              onSearch={search.onSearch}
            />
          )}

          {children}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadowLayer: {
    backgroundColor: uiColors.card,
    // Draw above the list so the bottom shadow lifts over scrolling content.
    zIndex: 10,
    shadowColor: uiColors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  clip: {
    overflow: "hidden",
    backgroundColor: uiColors.card,
  },
  content: {
    paddingHorizontal: uiSpace.screen,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
  },
  contentCompact: {
    paddingTop: 4,
    paddingBottom: 12,
    gap: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  titleRowCompact: {
    alignItems: "center",
  },
  titleCol: {
    flex: 1,
  },
  // Center the 40pt back button against the title's first line (lh 36).
  back: {
    marginTop: -2,
  },
  titleCompact: {
    lineHeight: 30,
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

export default ScreenHeader;
