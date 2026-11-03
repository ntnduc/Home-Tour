import SkeletonBlock from "@/components/SkeletonBlock";
import { shadows, uiColors, uiRadius, uiSpace } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

/**
 * Timeline-shaped skeleton: time stub · rail · card (badge row, subtitle, total, payment).
 */
const InvoiceTimelineSkeleton = () => (
  <View style={styles.row}>
    <View style={styles.timeCol}>
      <SkeletonBlock width={36} height={14} radius={6} />
      <SkeletonBlock width={28} height={12} radius={6} />
    </View>
    <View style={styles.rail}>
      <SkeletonBlock width={12} height={12} radius={6} />
    </View>
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <SkeletonBlock width="40%" height={18} radius={8} />
        <SkeletonBlock width={76} height={22} radius={999} />
      </View>
      <SkeletonBlock width="70%" height={12} radius={6} />
      <SkeletonBlock width="45%" height={22} radius={8} />
      <SkeletonBlock width="80%" height={14} radius={6} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginBottom: uiSpace.gap },
  timeCol: { width: 52, paddingTop: 14, alignItems: "flex-end", gap: 4 },
  rail: { width: 28, alignItems: "center", paddingTop: 18 },
  card: {
    flex: 1,
    backgroundColor: uiColors.card,
    borderRadius: uiRadius.tile,
    padding: uiSpace.card,
    gap: 10,
    ...shadows.soft,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});

export default InvoiceTimelineSkeleton;
