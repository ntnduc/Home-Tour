import { tokens, shadows } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import PressableScale from "./PressableScale";

type SectionErrorProps = {
  onRetry: () => void;
  message?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Lỗi cục bộ của MỘT section — các section khác vẫn hoạt động bình thường.
 *
 * Hiển thị khi một phần dữ liệu không tải được, kèm nút "Thử lại" để retry.
 * Thường dùng như `ListEmptyComponent` hoặc `ListErrorComponent` trong section feed.
 */
const SectionError = ({
  onRetry,
  message = "Không tải được dữ liệu",
  style,
}: SectionErrorProps) => (
  <View style={[styles.card, shadows.soft, style]}>
    <View style={styles.icon}>
      <Ionicons
        name="cloud-offline-outline"
        size={20}
        color={tokens.colors.error}
      />
    </View>
    <Text style={[styles.text]} numberOfLines={2}>
      {message}
    </Text>
    <PressableScale onPress={onRetry} style={styles.retry}>
      <Ionicons name="refresh" size={14} color={tokens.colors.onPrimary} />
      <Text style={styles.retryText}>Thử lại</Text>
    </PressableScale>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 24,
    backgroundColor: tokens.colors.surface,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.errorSurface,
  },
  text: {
    flex: 1,
    fontSize: tokens.typography.fontSize.sm,
    lineHeight: tokens.typography.lineHeight.sm,
    color: tokens.colors.foreground,
  },
  retry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: tokens.palette.gray[900],
  },
  retryText: {
    color: tokens.colors.onPrimary,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: "700",
  },
});

export default SectionError;
export type { SectionErrorProps };
