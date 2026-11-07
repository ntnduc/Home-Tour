import { uiColors, uiSpace } from "@/theme";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const DEFAULT_MAX_HEIGHT = 200;
const THUMB_MIN_HEIGHT = 24;
const THUMB_WIDTH = 4;
const THUMB_INSET = 4;

export interface ListBodyProps {
  /** Scroll the rows inside the card once they exceed `maxHeight`. */
  scroll?: boolean;
  /** Height cap (px) used when `scroll` is true. */
  maxHeight?: number;
  children: React.ReactNode;
}

/**
 * Edge-to-edge row list for a card body (bleeds over the card padding so
 * ListRow dividers/press states span the full width).
 *
 * ```
 * ┌ FormSection ──────────────────┐
 * │ ▣ Title                       │
 * │ ┌ ListBody (maxHeight 200) ──┐│  scroll=true → inner scroll view
 * │ │ row · row · row …        ▌ ││  custom always-visible thumb (right)
 * │ └────────────────────────────┘│  scroll=false → full-height View
 * └───────────────────────────────┘
 * ```
 *
 * The native indicator is hidden on iOS at rest, so a custom thumb is drawn
 * whenever the content is taller than the box.
 */
const ListBody = ({
  scroll = false,
  maxHeight = DEFAULT_MAX_HEIGHT,
  children,
}: ListBodyProps) => {
  const [contentHeight, setContentHeight] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const overflow = contentHeight - viewHeight;
  const hasOverflow = viewHeight > 0 && overflow > 1;
  const trackHeight = viewHeight - THUMB_INSET * 2;
  const thumbHeight = hasOverflow
    ? Math.max(THUMB_MIN_HEIGHT, (viewHeight / contentHeight) * trackHeight)
    : 0;
  const travel = Math.max(trackHeight - thumbHeight, 0);

  const thumbStyle = useAnimatedStyle(() => {
    const progress =
      overflow > 0 ? Math.min(Math.max(scrollY.value / overflow, 0), 1) : 0;
    return { transform: [{ translateY: progress * travel }] };
  });

  if (!scroll) return <View style={styles.bleed}>{children}</View>;

  return (
    <View style={styles.bleed}>
      <Animated.ScrollView
        style={{ maxHeight }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onLayout={(e) => setViewHeight(e.nativeEvent.layout.height)}
        onContentSizeChange={(_, h) => setContentHeight(h)}
      >
        {children}
      </Animated.ScrollView>
      {hasOverflow && (
        <View pointerEvents="none" style={styles.track}>
          <Animated.View
            style={[styles.thumb, { height: thumbHeight }, thumbStyle]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bleed: {
    marginHorizontal: -uiSpace.card,
  },
  track: {
    position: "absolute",
    top: THUMB_INSET,
    bottom: THUMB_INSET,
    right: THUMB_INSET,
    width: THUMB_WIDTH,
  },
  thumb: {
    width: THUMB_WIDTH,
    borderRadius: THUMB_WIDTH / 2,
    backgroundColor: uiColors.textSubtle,
    opacity: 0.6,
  },
});

export default ListBody;
