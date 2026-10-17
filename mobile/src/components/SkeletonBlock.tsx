import React, { useEffect } from "react";
import { DimensionValue, StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { tokens } from "@/theme";

type SkeletonBlockProps = {
  width?: DimensionValue;
  height: number;
  radius?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Placeholder "thở" (pulse) giữ đúng hình khối của nội dung → không giật layout khi dữ liệu về.
 *
 * Mặc định màu xám nhạt từ tokens; các section có thể ghi đè với `color` custom.
 * Thường dùng khi `isLoading` để hiển thị skeleton grid cùng kích thước card thực.
 *
 * @default `radius = 12`, `color = tokens.palette.gray[200]`
 */
const SkeletonBlock = ({
  width = "100%",
  height,
  radius = 12,
  color = tokens.palette.gray[200],
  style,
}: SkeletonBlockProps) => {
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
export type { SkeletonBlockProps };
