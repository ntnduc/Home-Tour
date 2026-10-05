import { tokens } from "@/theme";
import { HomepageSummary } from "@/types/homepage";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatCompactMoney, formatPercent } from "../homeFormat";
import {
  HOME_RADIUS,
  homeColors,
  homeShadow,
  homeType,
  homeWeight,
} from "../homeStyles";
import PressableScale from "./PressableScale";
import ProgressRing from "./ProgressRing";
import SkeletonBlock from "./SkeletonBlock";

type Props = {
  summary?: HomepageSummary;
  isLoading: boolean;
  isFetching: boolean;
  onPress: () => void;
};

/**
 * HERO CARD tài chính — tầng thị giác cao nhất của trang (full-width, bóng màu brand).
 *
 * Chiều sâu xếp lớp (từ dưới lên):
 *   1. Nền brand đậm
 *   2. Hai vòng tròn "kính" mờ trang trí lệch góc (tạo chiều sâu, không mang dữ liệu)
 *   3. Nội dung: cột trái = số tiền đã thu (display) + 2 chip phụ;
 *      cột phải = vòng tiến độ tỷ lệ thu.
 * Bố cục bất đối xứng (trái rộng – phải hẹp) để mắt đọc số tiền trước, tỷ lệ sau.
 */
const RevenueHeroCard = ({
  summary,
  isLoading,
  isFetching,
  onPress,
}: Props) => {
  const revenue = summary?.revenue;
  const period = summary?.period;

  return (
    <PressableScale
      onPress={onPress}
      style={[styles.shadowLayer, homeShadow.hero]}
      scaleTo={0.985}
      disabled={!summary}
    >
      {/* Tách lớp: lớp ngoài giữ bóng, lớp trong cắt orb (iOS: overflow hidden sẽ cắt mất bóng). */}
      <View style={styles.card}>
        <View style={[styles.orb, styles.orbLarge]} />
        <View style={[styles.orb, styles.orbSmall]} />

        {isLoading || !revenue ? (
          <HeroSkeleton />
        ) : (
          <View style={[styles.content, isFetching && styles.fetching]}>
            <View style={styles.left}>
              <Text style={[homeType.eyebrow, styles.eyebrow]}>
                Doanh thu T{period?.month}/{period?.year}
              </Text>
              <Text style={[homeType.display, styles.amount]} numberOfLines={1}>
                {formatCompactMoney(revenue.collected)}
              </Text>
              <Text style={styles.sub} numberOfLines={1}>
                đã thu / {formatCompactMoney(revenue.expected)} dự kiến
              </Text>

              <View style={styles.chips}>
                <View style={styles.chip}>
                  <Ionicons
                    name="hourglass-outline"
                    size={12}
                    color={homeColors.onHero}
                  />
                  <Text style={styles.chipText} numberOfLines={1}>
                    Còn {formatCompactMoney(revenue.outstanding)}
                  </Text>
                </View>
                {summary.overdueInvoiceCount > 0 && (
                  <View style={[styles.chip, styles.chipAlert]}>
                    <Ionicons
                      name="alert-circle"
                      size={12}
                      color={tokens.colors.onSecondary}
                    />
                    <Text style={styles.chipText}>
                      {summary.overdueInvoiceCount} quá hạn
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <ProgressRing
              progress={revenue.collectionRate}
              trackColor={homeColors.ringTrack}
              gradient={[homeColors.ringFrom, homeColors.ringTo]}
            >
              <Text style={styles.ringValue}>
                {formatPercent(revenue.collectionRate)}
              </Text>
              <Text style={styles.ringLabel}>đã thu</Text>
            </ProgressRing>
          </View>
        )}
      </View>
    </PressableScale>
  );
};

const HeroSkeleton = () => (
  <View style={styles.content}>
    <View style={[styles.left, { gap: 10 }]}>
      <SkeletonBlock
        width="55%"
        height={12}
        color={homeColors.heroGlassStrong}
      />
      <SkeletonBlock
        width="80%"
        height={32}
        color={homeColors.heroGlassStrong}
      />
      <SkeletonBlock
        width="65%"
        height={12}
        color={homeColors.heroGlassStrong}
      />
      <SkeletonBlock
        width="50%"
        height={26}
        radius={HOME_RADIUS.pill}
        color={homeColors.heroGlassStrong}
      />
    </View>
    <SkeletonBlock
      width={112}
      height={112}
      radius={56}
      color={homeColors.heroGlassStrong}
    />
  </View>
);

const styles = StyleSheet.create({
  shadowLayer: {
    borderRadius: HOME_RADIUS.hero,
    backgroundColor: homeColors.heroBg,
  },
  card: {
    borderRadius: HOME_RADIUS.hero,
    backgroundColor: homeColors.heroBg,
    padding: 22,
    overflow: "hidden",
  },
  orb: { position: "absolute", borderRadius: HOME_RADIUS.pill },
  orbLarge: {
    width: 220,
    height: 220,
    top: -90,
    right: -60,
    backgroundColor: homeColors.heroGlass,
  },
  orbSmall: {
    width: 120,
    height: 120,
    bottom: -50,
    left: -30,
    backgroundColor: homeColors.heroAccent,
    opacity: 0.55,
  },
  content: { flexDirection: "row", alignItems: "center", gap: 16 },
  fetching: { opacity: 0.6 },
  left: { flex: 1 },
  eyebrow: { color: homeColors.onHeroMuted, marginBottom: 8 },
  amount: { color: homeColors.onHero },
  sub: {
    color: homeColors.onHeroMuted,
    fontSize: tokens.typography.fontSize.sm,
    marginTop: 2,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 16 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: HOME_RADIUS.pill,
    backgroundColor: homeColors.heroGlassStrong,
  },
  chipAlert: { backgroundColor: tokens.colors.secondary },
  chipText: {
    color: homeColors.onHero,
    fontSize: 11,
    fontWeight: homeWeight.semibold,
  },
  ringValue: {
    color: homeColors.onHero,
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: homeWeight.bold,
    letterSpacing: -0.5,
  },
  ringLabel: { color: homeColors.onHeroMuted, fontSize: 11 },
});

export default RevenueHeroCard;
