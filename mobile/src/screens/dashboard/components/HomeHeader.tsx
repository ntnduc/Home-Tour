import { tokens } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatHeaderDate, getGreeting, getInitials } from "../homeFormat";
import {
  HOME_RADIUS,
  homeColors,
  homeShadow,
  homeType,
  homeWeight,
} from "../homeStyles";
import PressableScale from "./PressableScale";

type Props = {
  fullName?: string;
  alertCount: number;
  onPressBell: () => void;
  onPressAvatar: () => void;
};

/**
 * HEADER cá nhân hóa.
 * Bố cục 2 cột: trái = eyebrow ngày + lời chào theo giờ + tên (thứ bậc chữ rõ ràng),
 * phải = cụm nút tròn nổi (chuông có badge đếm việc cần xử lý + avatar viết tắt).
 */
const HomeHeader = ({
  fullName,
  alertCount,
  onPressBell,
  onPressAvatar,
}: Props) => {
  const firstName = fullName?.trim().split(/\s+/).pop();

  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={[homeType.eyebrow, styles.date]}>
          {formatHeaderDate()}
        </Text>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={[homeType.title, styles.name]} numberOfLines={1}>
          {firstName ?? "bạn"} 👋
        </Text>
      </View>

      <View style={styles.actions}>
        <PressableScale
          onPress={onPressBell}
          style={[styles.roundButton, homeShadow.soft]}
          scaleTo={0.92}
          accessibilityLabel="Việc cần xử lý"
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={homeColors.ink}
          />
          {alertCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {alertCount > 9 ? "9+" : alertCount}
              </Text>
            </View>
          )}
        </PressableScale>
        <PressableScale
          onPress={onPressAvatar}
          style={[styles.roundButton, styles.avatar]}
          scaleTo={0.92}
          accessibilityLabel="Hồ sơ"
        >
          <Text style={styles.avatarText}>{getInitials(fullName)}</Text>
        </PressableScale>
      </View>
    </View>
  );
};

const SIZE = 46;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  texts: { flex: 1, paddingRight: 12 },
  date: { color: homeColors.textSubtle, marginBottom: 6 },
  greeting: {
    fontSize: tokens.typography.fontSize.md,
    color: homeColors.textMuted,
  },
  name: { color: homeColors.ink },
  actions: { flexDirection: "row", gap: 10 },
  roundButton: {
    width: SIZE,
    height: SIZE,
    borderRadius: HOME_RADIUS.pill,
    backgroundColor: homeColors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { backgroundColor: homeColors.ink },
  avatarText: {
    color: tokens.colors.onInverse,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: homeWeight.bold,
    letterSpacing: 0.5,
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: HOME_RADIUS.pill,
    backgroundColor: tokens.colors.secondary,
    borderWidth: 2,
    borderColor: homeColors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: tokens.colors.onSecondary,
    fontSize: 9,
    fontWeight: homeWeight.bold,
  },
});

export default HomeHeader;
