import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** 0–100 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor: string;
  gradient: [string, string];
  children?: React.ReactNode;
};

/**
 * Vòng tiến độ tài chính.
 * - Vẽ bằng SVG: 1 vòng nền (track) + 1 vòng gradient có `strokeDashoffset` động.
 * - Animate trên UI thread (Reanimated) với easing cubic-out → chạy mượt kể cả khi
 *   JS thread đang bận parse dữ liệu; chạy lại mỗi khi `progress` đổi (đổi bộ lọc/refresh).
 * - Xoay -90° để vòng bắt đầu từ đỉnh, đầu nét bo tròn cho cảm giác mềm.
 */
const ProgressRing = ({
  progress,
  size = 112,
  strokeWidth = 12,
  trackColor,
  gradient,
  children,
}: Props) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));

  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = withTiming(clamped / 100, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [animated, clamped]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animated.value),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.rotate}>
        <Defs>
          <LinearGradient id="homeRingGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={gradient[0]} />
            <Stop offset="1" stopColor={gradient[1]} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#homeRingGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          fill="none"
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rotate: { transform: [{ rotate: "-90deg" }] },
  center: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ProgressRing;
