import { tokens, uiColors } from '@/theme';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

export interface SliderLoadingProps {
  /**
   * Giá trị tiến trình 0 - 100
   */
  value: number;
  /**
   * Chiều cao của thanh progress
   */
  height?: number;
  /**
   * Màu nền phía sau (track)
   */
  trackColor?: string;
  /**
   * Màu gradient cho progress
   */
  gradientColors?: string[];
  /**
   * Thời gian animation khi thay đổi value (ms)
   */
  animationDuration?: number;
  /**
   * Style container bên ngoài
   */
  style?: ViewStyle;
  /**
   * Animation từ center ra (mặc định: từ trái sang phải)
   */
  animateFromCenter?: boolean;

  /**
   * Bật/tắt hiệu ứng shimmer (giống skeleton) trên phần đã load
   * Mặc định: true
   */
  showShimmer?: boolean;
}

const DEFAULT_GRADIENT = [tokens.palette.brand[700], tokens.palette.brand[500], tokens.palette.brand[400]];

const SliderLoading: React.FC<SliderLoadingProps> = ({
  value,
  height = 3,
  trackColor = uiColors.track,
  gradientColors = DEFAULT_GRADIENT,
  animationDuration = 250,
  style,
  animateFromCenter = false,
  showShimmer = false,
}) => {
  // Giá trị nội bộ 0 - 1
  const animatedValue = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const gradientId = useRef(`sliderGradient_${Math.random().toString(36).slice(2)}`).current;

  const AnimatedRect = useMemo(() => Animated.createAnimatedComponent(Rect), []);

  useEffect(() => {
    // Chuẩn hóa value về 0 - 1
    const clamped = Math.max(0, Math.min(100, value ?? 0));
    const normalized = clamped / 100;

    Animated.timing(animatedValue, {
      toValue: normalized,
      duration: animationDuration,
      useNativeDriver: false, // width / flex không hỗ trợ native driver
    }).start();
  }, [value, animationDuration, animatedValue]);

  const onLayoutTrack = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== trackWidth) setTrackWidth(w);
  };

  // progress width theo px (ổn định nhất cho iOS + SVG)
  const progressWidth = useMemo(() => {
    if (trackWidth <= 0) return 0;
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, trackWidth],
    });
  }, [animatedValue, trackWidth]);

  // shimmer loop
  useEffect(() => {
    if (!showShimmer || trackWidth <= 0) return;

    shimmer.setValue(0);
    const anim = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [showShimmer, trackWidth, shimmer]);

  const shimmerTranslateX = useMemo(() => {
    if (trackWidth <= 0) return 0;
    return shimmer.interpolate({
      inputRange: [0, 1],
      outputRange: [-trackWidth, trackWidth],
    });
  }, [shimmer, trackWidth]);

  // Nếu animateFromCenter = true: dùng scaleX từ center ra hai bên
  if (animateFromCenter) {
    const centerX =
      trackWidth > 0
        ? animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [trackWidth / 2, 0],
        })
        : 0;

    return (
      <View
        style={[styles.container, { height, borderColor: trackColor }, style]}
        onLayout={onLayoutTrack}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              {gradientColors.map((color, index) => {
                const denominator = Math.max(gradientColors.length - 1, 1);
                const offset = (index / denominator) * 100;
                return <Stop key={index} offset={`${offset}%`} stopColor={color} />;
              })}
            </SvgLinearGradient>
          </Defs>

          {/* Progress (center) */}
          {trackWidth > 0 && (
            <AnimatedRect
              x={centerX}
              y="0"
              width={progressWidth}
              height="100%"
              fill={`url(#${gradientId})`}
              rx="999"
              ry="999"
            />
          )}
        </Svg>

        {/* Shimmer overlay (clip theo progress) */}
        {showShimmer && trackWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shimmerClip,
              {
                width: progressWidth as any,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.shimmerBar,
                {
                  transform: [{ translateX: shimmerTranslateX as any }],
                },
              ]}
            />
          </Animated.View>
        )}
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { height, borderColor: trackColor }, style, { height: 5 }]}
      onLayout={onLayoutTrack}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            {gradientColors.map((color, index) => {
              const denominator = Math.max(gradientColors.length - 1, 1);
              const offset = (index / denominator) * 100;
              return <Stop key={index} offset={`${offset}%`} stopColor={color} />;
            })}
          </SvgLinearGradient>
        </Defs>

        {/* Progress */}
        {trackWidth > 0 && (
          <AnimatedRect
            x="0"
            y="0"
            width={progressWidth}
            height="100%"
            fill={`url(#${gradientId})`}
            rx={6}
            ry={6}
          />
        )}
      </Svg>

      {/* Shimmer overlay (clip theo progress) */}
      {showShimmer && trackWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shimmerClip,
            {
              width: progressWidth as any,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.shimmerBar,
              {
                transform: [{ translateX: shimmerTranslateX as any }],
              },
            ]}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    // borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: uiColors.card,
    borderWidth: 1,
    borderRadius: 6,
  },
  progressCenter: {
    height: '100%',
  },
  shimmerClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    // borderRadius: 60,
  },
  shimmerBar: {
    width: 60,
    height: '100%',
    // borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});

export default SliderLoading;
