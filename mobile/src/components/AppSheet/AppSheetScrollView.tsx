import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  TextInput,
  ViewStyle,
} from "react-native";

// Height reserved for the host sheet footer (BottomSheetFooter + safe-area padding).
export const SHEET_FOOTER_CLEARANCE = 120;

// Gap kept between the focused field and the footer / keyboard edge.
const FOCUS_MARGIN = 16;

// Wait for the sheet to finish lifting above the keyboard before measuring.
const SETTLE_DELAY_MS = 250;

type ScrollRef = React.ElementRef<typeof BottomSheetScrollView>;

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Scroll container for form content inside an AppSheet that has a footer.
 *
 * The footer is absolutely positioned at the sheet bottom, so when the keyboard
 * opens it sits right above the keyboard and covers the lower part of the
 * scrollable area. After the keyboard shows, the focused field is measured and
 * the content is scrolled just enough to keep it above the footer.
 *
 * Use `SHEET_FOOTER_CLEARANCE` as `paddingBottom` of the content so the last
 * field can always be scrolled clear of the footer.
 */
const AppSheetScrollView = ({ children, style, contentContainerStyle }: Props) => {
  const scrollRef = useRef<ScrollRef>(null);
  const offsetY = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetY.current = e.nativeEvent.contentOffset.y;
    },
    [],
  );

  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidShow", (event) => {
      const keyboardTop = event.endCoordinates.screenY;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const input = TextInput.State.currentlyFocusedInput();
        input?.measureInWindow((_x, y, _w, height) => {
          const visibleBottom =
            keyboardTop - SHEET_FOOTER_CLEARANCE + FOCUS_MARGIN;
          const overlap = y + height - visibleBottom;
          if (overlap > 0) {
            scrollRef.current?.scrollTo({
              y: offsetY.current + overlap,
              animated: true,
            });
          }
        });
      }, SETTLE_DELAY_MS);
    });
    return () => {
      sub.remove();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <BottomSheetScrollView
      ref={scrollRef}
      style={style}
      contentContainerStyle={contentContainerStyle}
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
      onScroll={handleScroll}
    >
      {children}
    </BottomSheetScrollView>
  );
};

export default AppSheetScrollView;
