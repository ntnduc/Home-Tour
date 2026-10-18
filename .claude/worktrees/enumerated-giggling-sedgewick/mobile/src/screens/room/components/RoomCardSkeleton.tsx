/**
 * Skeleton placeholder for room card — shape-preserving loading state.
 *
 * ```
 * ┌────────────────────────────────┐ Card padding="none" · inner padding 16 · gap 12
 * │ [▬▬▬ 84×22 r999] [▬ 32×22 r999]│ badge row (row, gap 6)
 * │ ▬▬▬▬ 45% × 22 r8               │ name
 * │ ▬▬▬ 30% × 14 r6                │ building
 * │ ▬▬▬▬ 40% × 24 r8               │ rent
 * │ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ 100% × 88 r16│ contract tile
 * ├────────────────────────────────┤ hairline
 * │ [▬▬▬ flex1 ×44 r999] [▬ flex1] │ buttons row (padding 16 · row gap 8)
 * └────────────────────────────────┘
 * ```
 */
import Card from "@/components/Card";
import SkeletonBlock from "@/components/SkeletonBlock";
import { uiColors } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

/**
 * Card-shaped skeleton block (no props).
 */
const RoomCardSkeleton = () => {
  return (
    <Card padding="none">
      <View style={styles.inner}>
        {/* Badge row: status badge + count badge */}
        <View style={styles.badgeRow}>
          <SkeletonBlock width={84} height={22} radius={999} />
          <SkeletonBlock width={32} height={22} radius={999} />
        </View>

        {/* Name (45% width) */}
        <SkeletonBlock width="45%" height={22} radius={8} />

        {/* Building (30% width) */}
        <SkeletonBlock width="30%" height={14} radius={6} />

        {/* Rent (40% width) */}
        <SkeletonBlock width="40%" height={24} radius={8} />

        {/* Contract tile (100% width) */}
        <SkeletonBlock width="100%" height={88} radius={16} />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Action buttons row */}
      <View style={styles.buttonRow}>
        <View style={styles.buttonSlot}>
          <SkeletonBlock width="100%" height={44} radius={999} />
        </View>
        <View style={styles.buttonSlot}>
          <SkeletonBlock width="100%" height={44} radius={999} />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  inner: {
    padding: 16,
    gap: 12,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
  },
  divider: {
    height: 1,
    backgroundColor: uiColors.hairline,
  },
  buttonRow: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  buttonSlot: {
    flex: 1,
  },
});

export default RoomCardSkeleton;
