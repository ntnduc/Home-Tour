import { tokens } from "@/theme";
import { HomepageAlert, HomepageAlertSeverity } from "@/types/homepage";
import { Ionicons } from "@expo/vector-icons";
import IconSquircle from "@/components/IconSquircle";
import StatusBadge from "@/components/StatusBadge";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatCompactMoney } from "../homeFormat";
import {
  HOME_RADIUS,
  homeColors,
  homeShadow,
  homeType,
  homeWeight,
} from "../homeStyles";
import PressableScale from "@/components/PressableScale";
import SkeletonBlock from "@/components/SkeletonBlock";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];


/** Mỗi mức độ = 1 cặp (nền nhạt, màu đậm) + icon riêng → quét mắt là nhận ra độ gấp. */
const SEVERITY_TONE: Record<
  HomepageAlertSeverity,
  { tone: "error" | "warning" | "info"; icon: IoniconName }
> = {
  critical: { tone: "error", icon: "alert-circle" },
  warning: { tone: "warning", icon: "time" },
  info: { tone: "info", icon: "information-circle" },
};

type Props = {
  alerts?: HomepageAlert[];
  isLoading: boolean;
  isFetching: boolean;
  onPressAlert: (alert: HomepageAlert) => void;
};

/**
 * LIVE FEED — "Cần xử lý".
 * Một card trắng duy nhất chứa danh sách dọc (gọn, dễ quét hơn nhiều card rời).
 * Mỗi dòng: icon mức độ | tiêu đề + phòng · tài sản | pill thời hạn + số tiền.
 * Thứ tự đã được backend sắp: nghiêm trọng → cảnh báo → thông tin, cùng mức thì gần hạn trước.
 */
const AlertFeed = ({ alerts, isLoading, isFetching, onPressAlert }: Props) => {
  if (isLoading || !alerts) {
    return (
      <View style={[styles.card, homeShadow.soft, { gap: 18 }]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.row}>
            <SkeletonBlock width={40} height={40} radius={HOME_RADIUS.icon} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonBlock width="60%" height={12} />
              <SkeletonBlock width="40%" height={10} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (alerts.length === 0) {
    return (
      <View style={[styles.card, styles.empty, homeShadow.soft]}>
        <IconSquircle icon="checkmark-done" tone="success" />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Mọi thứ đều ổn</Text>
          <Text style={homeType.caption}>Không có việc gấp cần xử lý.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, homeShadow.soft, isFetching && styles.fetching]}>
      {alerts.map((alert, index) => {
        const tone = SEVERITY_TONE[alert.severity];
        return (
          <PressableScale
            key={alert.id}
            onPress={() => onPressAlert(alert)}
            scaleTo={0.98}
            style={[styles.row, index > 0 && styles.divider]}
          >
            <IconSquircle icon={tone.icon} tone={tone.tone} />
            <View style={styles.body}>
              <Text style={styles.title} numberOfLines={1}>
                {alert.title}
              </Text>
              <Text style={homeType.caption} numberOfLines={1}>
                {alert.roomName}
                {alert.propertyName ? ` · ${alert.propertyName}` : ""}
              </Text>
            </View>
            <View style={styles.meta}>
              <StatusBadge
                label={alert.message}
                tone={tone.tone}
                size="sm"
                showDot={false}
                style={styles.pill}
              />
              {!!alert.amount && (
                <Text style={styles.amount}>
                  {formatCompactMoney(alert.amount)}
                </Text>
              )}
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: HOME_RADIUS.card,
    backgroundColor: homeColors.card,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  fetching: { opacity: 0.6 },
  empty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: tokens.colors.borderStrong,
  },
  body: { flex: 1, gap: 2 },
  title: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: homeWeight.semibold,
    color: homeColors.ink,
  },
  meta: { alignItems: "flex-end", gap: 4, maxWidth: "38%" },
  pill: { alignSelf: "flex-end", maxWidth: "100%" },
  amount: {
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: homeWeight.semibold,
    color: homeColors.text,
  },
});

export default AlertFeed;
