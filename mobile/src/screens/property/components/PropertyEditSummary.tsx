/**
 * Live summary card at the top of Create/UpdatePropertyScreen — mirrors the
 * PropertyCard header so the user previews the property they are editing.
 *
 * ```
 * ┌─────────────────────────────────────────────┐ Card soft · radius 24
 * │ ▣44  Property name                          │
 * │      📍 address                             │
 * │ [≡ 3 tầng] [🛏 10 phòng] [⚡ 4 dịch vụ]       │  Chip meta (rooms optional)
 * └─────────────────────────────────────────────┘
 * ```
 */

import Card from "@/components/Card";
import Chip from "@/components/Chip";
import IconSquircle from "@/components/IconSquircle";
import { uiColors, uiSpace, uiType } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface PropertyEditSummaryProps {
  name?: string;
  address?: string;
  numberFloor?: number;
  /** Shown as a chip only when provided (create flow). */
  totalRoom?: number;
  serviceCount: number;
  /** Fallback title when `name` is empty. */
  placeholderName?: string;
}

const PropertyEditSummary = ({
  name,
  address,
  numberFloor,
  totalRoom,
  serviceCount,
  placeholderName = "Chưa đặt tên",
}: PropertyEditSummaryProps) => (
  <Card style={styles.card}>
    <View style={styles.headerRow}>
      <IconSquircle icon="business" />
      <View style={styles.titleCol}>
        <Text style={styles.title} numberOfLines={1}>
          {name?.trim() || placeholderName}
        </Text>
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={12} color={uiColors.textSubtle} />
          <Text style={[uiType.caption, styles.flex]} numberOfLines={1}>
            {address?.trim() || "Chưa có địa chỉ"}
          </Text>
        </View>
      </View>
    </View>

    <View style={styles.chipRow}>
      <Chip icon="layers-outline" label={`${numberFloor ?? 0} tầng`} />
      {totalRoom !== undefined && <Chip icon="bed-outline" label={`${totalRoom} phòng`} />}
      <Chip icon="flash-outline" label={`${serviceCount} dịch vụ`} />
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    gap: uiSpace.gap,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...uiType.section,
    lineHeight: 24,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  flex: {
    flex: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});

export default PropertyEditSummary;
