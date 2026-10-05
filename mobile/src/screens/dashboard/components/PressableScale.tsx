import React from "react";
import {
  GestureResponderEvent,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const SPRING = { damping: 18, stiffness: 320, mass: 0.6 } as const;

type Props = TouchableOpacityProps & {
  /** Mức thu nhỏ khi nhấn (1 = không thu). */
  scaleTo?: number;
};

/**
 * Micro-interaction xúc giác dùng chung cho mọi phần tử bấm được trên trang chủ:
 *  - `activeOpacity={0.6}`: mờ đi tức thì khi chạm (phản hồi thị giác).
 *  - Lò xo thu nhỏ nhẹ (UI thread, Reanimated) → cảm giác "nhấn vật lý".
 */
const PressableScale = ({
  scaleTo = 0.97,
  style,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: Props) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: GestureResponderEvent) => {
    scale.value = withSpring(scaleTo, SPRING);
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    scale.value = withSpring(1, SPRING);
    onPressOut?.(e);
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.6}
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedTouchable>
  );
};

export default PressableScale;
