import { tokens } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import {
  HOME_RADIUS,
  homeColors,
  homeShadow,
  homeType,
  homeWeight,
} from "../homeStyles";
import PressableScale from "./PressableScale";

type Props = {
  onRetry: () => void;
  message?: string;
  style?: StyleProp<ViewStyle>;
};

/** Lỗi cục bộ của MỘT section — các section khác vẫn hoạt động bình thường. */
const SectionError = ({
  onRetry,
  message = "Không tải được dữ liệu",
  style,
}: Props) => (
  <View style={[styles.card, homeShadow.soft, style]}>
    <View style={styles.icon}>
      <Ionicons
        name="cloud-offline-outline"
        size={20}
        color={tokens.colors.error}
      />
    </View>
    <Text style={[homeType.body, styles.text]} numberOfLines={2}>
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
    borderRadius: HOME_RADIUS.card,
    backgroundColor: homeColors.card,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: HOME_RADIUS.icon,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.errorSurface,
  },
  text: { flex: 1 },
  retry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: HOME_RADIUS.pill,
    backgroundColor: homeColors.ink,
  },
  retryText: {
    color: tokens.colors.onPrimary,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: homeWeight.bold,
  },
});

export default SectionError;
