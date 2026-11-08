import Card from "@/components/Card";
import IconSquircle from "@/components/IconSquircle";
import PressableScale from "@/components/PressableScale";
import { uiColors, uiSpace, uiType } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import React, { ReactNode, useEffect, useState } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  title: string;
  icon?: IoniconName;
  /** Controlled state (accordion groups); omit for self-managed. */
  expanded?: boolean;
  /** Called every time the section opens/closes; use it to start lazy loading. */
  onToggle?: (expanded: boolean) => void;
  children: ReactNode;
};

/**
 * Collapsed-by-default card. Children are mounted only while expanded,
 * so lazy data hooks inside them run only after the user opens the tab.
 */
const DURATION = 280;
const EASING = Easing.out(Easing.cubic);

const CollapsibleSection = ({
  title,
  icon,
  expanded: controlled,
  onToggle,
  children,
}: Props) => {
  const [internal, setInternal] = useState(false);
  const expanded = controlled ?? internal;
  // 0 = collapsed, 1 = expanded; drives chevron, height and opacity
  const progress = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  // Mount children only after the first open
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (expanded) setMounted(true);
    progress.value = withTiming(expanded ? 1 : 0, {
      duration: DURATION,
      easing: EASING,
    });
  }, [expanded, progress]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    height: contentHeight.value * progress.value,
    opacity: progress.value,
  }));

  const onContentLayout = (e: LayoutChangeEvent) => {
    // Animate size changes too (e.g. skeleton -> loaded list)
    contentHeight.value = withTiming(e.nativeEvent.layout.height, {
      duration: DURATION,
      easing: EASING,
    });
  };

  const toggle = () => {
    const next = !expanded;
    setInternal(next);
    onToggle?.(next);
  };

  return (
    <Card style={styles.card}>
      <PressableScale
        onPress={toggle}
        scaleTo={0.98}
        accessibilityLabel={`${title}, ${expanded ? "thu gọn" : "mở rộng"}`}
        style={styles.header}
      >
        {icon && <IconSquircle icon={icon} tone="primary" size="sm" />}
        <Text style={[uiType.section, styles.title]} numberOfLines={1}>
          {title}
        </Text>
        <Animated.View style={chevronStyle}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={uiColors.textSubtle}
          />
        </Animated.View>
      </PressableScale>
      <Animated.View style={[styles.clip, bodyStyle]}>
        {/* Absolute wrapper keeps its natural height so it can be measured */}
        <View style={styles.measure} onLayout={onContentLayout}>
          <View style={styles.hairline} />
          {mounted && <View style={styles.body}>{children}</View>}
        </View>
      </Animated.View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { flex: 1 },
  clip: { overflow: "hidden", marginTop: -14 },
  measure: { position: "absolute", top: 0, left: 0, right: 0, paddingTop: 14, gap: 14 },
  hairline: { height: 1, backgroundColor: uiColors.hairline },
  body: { gap: uiSpace.gap },
});

export default CollapsibleSection;
