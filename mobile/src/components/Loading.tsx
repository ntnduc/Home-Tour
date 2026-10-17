import { tokens, uiColors } from "@/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

/**
 * Full-screen fallback loader on the app canvas. Prefer shaped `SkeletonBlock`s
 * for first loads of content screens; use this only for blocking transitions.
 */
const Loading = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={tokens.colors.primary} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: uiColors.canvas,
  },
});

export default Loading;
