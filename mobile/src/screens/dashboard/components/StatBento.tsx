import { tokens } from "@/theme";
import { HomepageSummary } from "@/types/homepage";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatPercent } from "../homeFormat";
import {
  HOME_RADIUS,
  HOME_SPACE,
  homeColors,
  homeShadow,
  homeType,
  homeWeight,
} from "../homeStyles";
import PressableScale from "@/components/PressableScale";
import SkeletonBlock from "@/components/SkeletonBlock";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  summary?: HomepageSummary;
  isLoading: boolean;
  onPressOccupancy: () => void;
  onPressTenants: () => void;
  onPressContracts: () => void;
};

const { palette, colors } = tokens;

/**
 * LƯỚI BENTO BẤT ĐỐI XỨNG.
 *
 *   ┌──────────────┬──────────┐
 *   │              │ Khách    │
 *   │  Lấp đầy %   ├──────────┤
 *   │  (cao, rộng) │ HĐ sắp   │
 *   │              │ hết hạn  │
 *   └──────────────┴──────────┘
 *
 * Card trái chiếm ~55% và cao bằng 2 card phải cộng lại → nhấn mạnh KPI quan trọng nhất
 * (tỷ lệ lấp đầy) mà vẫn giữ nhịp lưới. Thanh phân đoạn cho thấy cơ cấu trạng thái phòng.
 */
const StatBento = ({
  summary,
  isLoading,
  onPressOccupancy,
  onPressTenants,
  onPressContracts,
}: Props) => {
  if (isLoading || !summary) {
    return (
      <View style={styles.row}>
        <View style={styles.tall}>
          <SkeletonBlock height={196} radius={HOME_RADIUS.card} />
        </View>
        <View style={styles.column}>
          <SkeletonBlock height={92} radius={HOME_RADIUS.card} />
          <SkeletonBlock height={92} radius={HOME_RADIUS.card} />
        </View>
      </View>
    );
  }

  const { rooms } = summary;
  const others = rooms.maintenance + rooms.pendingDeposit + rooms.unavailable;
  const segments = [
    {
      key: "occupied",
      value: rooms.occupied,
      color: colors.success,
      label: "Đang thuê",
    },
    {
      key: "available",
      value: rooms.available,
      color: palette.amber[400],
      label: "Trống",
    },
    { key: "others", value: others, color: palette.gray[400], label: "Khác" },
  ];

  return (
    <View style={styles.row}>
      <PressableScale
        onPress={onPressOccupancy}
        style={[styles.card, styles.tall, homeShadow.medium]}
      >
        <View
          style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}
        >
          <Ionicons name="bed-outline" size={18} color={colors.primary} />
        </View>
        <Text style={[homeType.eyebrow, styles.eyebrow]}>Tỷ lệ lấp đầy</Text>
        <Text style={[homeType.display, styles.ink]}>
          {formatPercent(rooms.occupancyRate)}
        </Text>
        <Text style={homeType.caption}>
          {rooms.occupied}/{rooms.total} phòng đang thuê
        </Text>

        <View style={styles.spacer} />

        {/* Thanh phân đoạn: mỗi đoạn có flex = số phòng của trạng thái đó. */}
        <View style={styles.bar}>
          {rooms.total === 0 ? (
            <View
              style={[
                styles.segment,
                { flex: 1, backgroundColor: homeColors.skeleton },
              ]}
            />
          ) : (
            segments
              .filter((s) => s.value > 0)
              .map((s) => (
                <View
                  key={s.key}
                  style={[
                    styles.segment,
                    { flex: s.value, backgroundColor: s.color },
                  ]}
                />
              ))
          )}
        </View>
        <View style={styles.legend}>
          {segments.map((s) => (
            <View key={s.key} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: s.color }]} />
              <Text style={styles.legendText}>{s.value}</Text>
            </View>
          ))}
        </View>
      </PressableScale>

      <View style={styles.column}>
        <MiniStat
          icon="people-outline"
          tint={colors.infoSurface}
          color={colors.info}
          value={summary.tenantsCount}
          label="Khách đang thuê"
          onPress={onPressTenants}
        />
        <MiniStat
          icon="time-outline"
          tint={colors.warningSurface}
          color={palette.amber[500]}
          value={summary.expiringContractCount}
          label="HĐ sắp hết hạn"
          onPress={onPressContracts}
        />
      </View>
    </View>
  );
};

type MiniStatProps = {
  icon: IoniconName;
  tint: string;
  color: string;
  value: number;
  label: string;
  onPress: () => void;
};

const MiniStat = ({
  icon,
  tint,
  color,
  value,
  label,
  onPress,
}: MiniStatProps) => (
  <PressableScale
    onPress={onPress}
    style={[styles.card, styles.mini, homeShadow.soft]}
  >
    <View style={styles.miniTop}>
      <Text style={[homeType.title, styles.ink]}>{value}</Text>
      <View
        style={[styles.iconWrap, styles.iconSmall, { backgroundColor: tint }]}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
    </View>
    <Text style={homeType.caption} numberOfLines={1}>
      {label}
    </Text>
  </PressableScale>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: HOME_SPACE.gap },
  column: { flex: 1, gap: HOME_SPACE.gap },
  tall: { flex: 1.25 },
  card: {
    borderRadius: HOME_RADIUS.card,
    backgroundColor: homeColors.card,
    padding: 16,
  },
  ink: { color: homeColors.ink },
  eyebrow: { color: homeColors.textSubtle, marginTop: 14, marginBottom: 4 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSmall: { width: 32, height: 32, borderRadius: 10 },
  spacer: { flex: 1, minHeight: 14 },
  bar: {
    flexDirection: "row",
    height: 8,
    borderRadius: HOME_RADIUS.pill,
    overflow: "hidden",
    gap: 3,
  },
  segment: { height: "100%", borderRadius: HOME_RADIUS.pill },
  legend: { flexDirection: "row", gap: 12, marginTop: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legendText: {
    fontSize: 11,
    color: homeColors.textMuted,
    fontWeight: homeWeight.medium,
  },
  mini: { flex: 1, justifyContent: "space-between", minHeight: 92 },
  miniTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
});

export default StatBento;
