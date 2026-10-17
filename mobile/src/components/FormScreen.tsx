import { uiColors, uiSpace } from "@/theme";
import React, { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export interface FormScreenProps {
  children: ReactNode;
  /** Sticky element under the scroll area (usually `ActionButtonBottom`). */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Standard form / detail screen scaffold (stack screens with a native header).
 *
 * ```
 * canvas surfaceMuted
 * ┌──────────────────────────────┐
 * │ KeyboardAwareScrollView      │ gutter 20 · top 16 · gap 12 · keyboard-safe
 * │   FormSection / Card …       │
 * ├──────────────────────────────┤
 * │ footer (ActionButtonBottom)  │ sticky, safe-area aware
 * └──────────────────────────────┘
 * ```
 */
const FormScreen = ({ children, footer, contentStyle }: FormScreenProps) => (
  <View style={styles.container}>
    <KeyboardAwareScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, contentStyle]}
      enableOnAndroid
      extraScrollHeight={30}
      keyboardOpeningTime={0}
      enableAutomaticScroll
      enableResetScrollToCoords={false}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </KeyboardAwareScrollView>
    {footer}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: uiColors.canvas,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: uiSpace.screen,
    paddingTop: 16,
    paddingBottom: uiSpace.section,
    gap: uiSpace.gap,
  },
});

export default FormScreen;
