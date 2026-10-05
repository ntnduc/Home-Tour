import React, { useEffect } from "react";
import { DimensionValue, StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { homeColors } from "../homeStyles";

type Props = {
  width?: DimensionValue;
  height: number;
  radius?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** Placeholder "thở" (pulse) giữ đúng hình khối của nội dung → không giật layout khi dữ liệu về. */
const SkeletonBlock = ({
  width = "100%",
  height,
  radius = 12,
  color = homeColors.skeleton,
  style,
}: Props) => {
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 750, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: color },
        animatedStyle,
        style,
      ]}
    />
  );
};

export default SkeletonBlock;
