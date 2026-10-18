import {
  BottomTabBarHeightCallbackContext,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import React, { ReactNode, useContext, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import PressableScale from "@/components/PressableScale";
import { tokens } from "@/theme";

const { colors, shadows } = tokens;

// Translucent fills for the iOS island (defined once here).
const GLASS_FILL = "rgba(255,255,255,0.55)"; // pre-iOS 26 fallback tint over the blur
const GLASS_EDGE = "rgba(255,255,255,0.9)"; // fallback specular rim
const SELECTION_FILL = "rgba(17,24,39,0.07)"; // neutral capsule behind the selected tab

const ISLAND_RADIUS = 30;
const ROW_PADDING = 6;
// Native Liquid Glass (UIGlassEffect) needs iOS 26+; older iOS falls back to blur + tint.
const LIQUID_GLASS = Platform.OS === "ios" && isLiquidGlassAvailable();
const SLIDE_SPRING = { damping: 20, stiffness: 260, mass: 0.7 } as const;

/**
 * Platform-adaptive bottom tab bar. Same routes, icons, labels and behavior on both platforms.
 *
 * iOS — Liquid Glass island, absolutely positioned OVER the screen (content scrolls behind it):
 * ┌──────────────────────────────────────────┐ screen content (transparent wrapper)
 * │  ╭────────────────────────────────────╮  │ margin 16 (+ side safe area) · radius 30
 * │  │ ⟨●home⟩ ◻ ◻ ◻ ◻ ◻ ◻   native glass  │  │ height 62 · capsule slides with a spring
 * │  ╰────────────────────────────────────╯  │
 * └──────────────────────────────────────────┘ + safe-area bottom
 * Layers: content → glass (iOS 26 `GlassView`, else blur + tint + rim) → selection capsule → items.
 * Its measured height is reported to the navigator, so tab screens reserve it via `useTabBarInset()`.
 *
 * Android — Material 3 navigation bar: full-width surface, 80dp, active pill indicator
 * (64×32) behind the icon, label below, ripple feedback, ≥48dp targets.
 */
const PlatformTabBar = ({ state, descriptors, navigation, insets }: BottomTabBarProps) => {
  const keyboardVisible = useKeyboardVisible();
  const reportHeight = useContext(BottomTabBarHeightCallbackContext);
  const onLayout = (e: LayoutChangeEvent) => reportHeight?.(e.nativeEvent.layout.height);
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  if (keyboardVisible && focusedOptions.tabBarHideOnKeyboard) return null;

  const isIOS = Platform.OS === "ios";

  const items = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    const focused = state.index === index;
    const label = typeof options.title === "string" ? options.title : route.name;
    const color = focused
      ? isIOS
        ? colors.primary
        : colors.onSurface
      : colors.muted;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };
    const onLongPress = () => navigation.emit({ type: "tabLongPress", target: route.key });

    const icon = options.tabBarIcon?.({ focused, color, size: isIOS ? 22 : 24 });
    const a11y = {
      accessibilityRole: "tab" as const,
      accessibilityState: { selected: focused },
      accessibilityLabel: options.tabBarAccessibilityLabel ?? label,
    };

    if (isIOS) {
      return (
        <PressableScale
          key={route.key}
          {...a11y}
          scaleTo={0.92}
          onPress={onPress}
          onLongPress={onLongPress}
          style={styles.iosItem}
        >
          <View style={styles.iosItemInner}>
            {icon}
            <Text numberOfLines={1} style={[styles.iosLabel, { color }]}>
              {label}
            </Text>
          </View>
        </PressableScale>
      );
    }

    return (
      <Pressable
        key={route.key}
        {...a11y}
        onPress={onPress}
        onLongPress={onLongPress}
        android_ripple={{ color: colors.primaryMuted, borderless: true, radius: 32 }}
        style={styles.mdItem}
      >
        <View style={[styles.mdIndicator, focused && styles.mdIndicatorActive]}>{icon}</View>
        <Text
          numberOfLines={1}
          style={[styles.mdLabel, { color }, focused && styles.mdLabelActive]}
        >
          {label}
        </Text>
      </Pressable>
    );
  });

  if (isIOS) {
    return (
      <View
        onLayout={onLayout}
        pointerEvents="box-none"
        style={[
          styles.iosWrap,
          {
            paddingBottom: Math.max(insets.bottom - 6, 12),
            paddingLeft: 16 + insets.left,
            paddingRight: 16 + insets.right,
          },
        ]}
      >
        <GlassIsland activeIndex={state.index} count={state.routes.length}>
          {items}
        </GlassIsland>
      </View>
    );
  }

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.mdBar,
        { paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right },
      ]}
    >
      <View style={styles.mdRow}>{items}</View>
    </View>
  );
};

/**
 * Glass surface + spring-driven selection capsule. Lives in its own component so its hooks
 * never sit behind the keyboard early-return of the bar.
 */
const GlassIsland = ({
  activeIndex,
  count,
  children,
}: {
  activeIndex: number;
  count: number;
  children: ReactNode;
}) => {
  const [rowWidth, setRowWidth] = useState(0);
  const itemWidth = rowWidth > 0 ? (rowWidth - ROW_PADDING * 2) / count : 0;
  const offsetX = useSharedValue(0);
  const stretch = useSharedValue(1);
  const lastItemWidth = useRef(0);

  useEffect(() => {
    if (itemWidth === 0) return;
    const target = activeIndex * itemWidth;
    if (lastItemWidth.current !== itemWidth) {
      // First layout / rotation: jump into place without animating.
      lastItemWidth.current = itemWidth;
      offsetX.value = target;
      return;
    }
    offsetX.value = withSpring(target, SLIDE_SPRING);
    // Brief horizontal stretch while sliding → "liquid" morph between tabs.
    stretch.value = withSequence(withTiming(1.14, { duration: 110 }), withSpring(1, SLIDE_SPRING));
  }, [activeIndex, itemWidth, offsetX, stretch]);

  const capsuleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }, { scaleX: stretch.value }],
  }));

  const content = (
    <View style={styles.iosRow} onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}>
      {itemWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[styles.iosCapsule, { width: itemWidth }, capsuleStyle]}
        />
      )}
      {children}
    </View>
  );

  if (LIQUID_GLASS) {
    return (
      <View style={styles.iosShadowLiquid}>
        <GlassView
          glassEffectStyle="regular"
          isInteractive
          colorScheme="light"
          style={styles.iosIsland}
        >
          {content}
        </GlassView>
      </View>
    );
  }

  // Outer view carries the shadow; inner view clips the blur (iOS shadow pitfall).
  return (
    <View style={styles.iosShadow}>
      <View style={[styles.iosIsland, styles.iosIslandFallback]}>
        <BlurView intensity={60} tint="systemChromeMaterialLight" style={styles.fill} />
        {content}
      </View>
    </View>
  );
};

/** Tracks keyboard visibility so `tabBarHideOnKeyboard` keeps working with a custom bar. */
const useKeyboardVisible = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
};

export default PlatformTabBar;

const styles = StyleSheet.create({
  fill: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },

  // iOS floating island
  iosWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 8,
  },
  iosShadow: {
    ...shadows.medium,
    borderRadius: ISLAND_RADIUS,
    backgroundColor: GLASS_FILL,
  },
  // Native glass renders its own edge light; keep only a soft lift.
  iosShadowLiquid: {
    ...shadows.soft,
    borderRadius: ISLAND_RADIUS,
  },
  iosIsland: {
    borderRadius: ISLAND_RADIUS,
    overflow: "hidden",
  },
  iosIslandFallback: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GLASS_EDGE,
  },
  iosRow: {
    flexDirection: "row",
    height: 62,
    paddingHorizontal: ROW_PADDING,
    alignItems: "center",
  },
  iosCapsule: {
    position: "absolute",
    left: ROW_PADDING,
    top: 5,
    bottom: 5,
    borderRadius: 999,
    backgroundColor: SELECTION_FILL,
  },
  iosItem: { flex: 1, height: 52 },
  iosItemInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    gap: 2,
  },
  iosLabel: { fontSize: 10, lineHeight: 12, fontWeight: "600" },

  // Android Material 3 navigation bar
  mdBar: {
    backgroundColor: colors.surface,
    elevation: 3,
  },
  mdRow: { flexDirection: "row", height: 80 },
  mdItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 48,
  },
  mdIndicator: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  mdIndicatorActive: { backgroundColor: colors.primaryMuted },
  mdLabel: { fontSize: 12, lineHeight: 16, fontWeight: "500" },
  mdLabelActive: { fontWeight: "700" },
});
