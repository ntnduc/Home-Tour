/**
 * Skeleton placeholder for PropertyCardComponent.
 *
 * Shape matches the real card anatomy for no layout shift:
 * ```
 * ┌─────────────────────────────┐
 * │ ▭44  ▭text lines ▭pill     │
 * │ ▭chips  ▭chips  ▭chips     │
 * │ ▭track (100%)               │
 * │ ─────────────────────────    │  (hairline)
 * │ ▭button  ▭button  ▭button   │
 * └─────────────────────────────┘
 * ```
 */

import { tokens, shadows } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import SkeletonBlock from "@/components/SkeletonBlock";
import { PROP_RADIUS, PROP_SPACE } from "../propertyListStyles";

/**
 * PropertyCardSkeleton — placeholder during initial load.
 *
 * Dimensions match the real card to prevent layout jank.
 */
const PropertyCardSkeleton = () => (
  <View style={[styles.card, shadows.soft]}>
    {/* Header: icon + title + status pill */}
    <View style={styles.headerRow}>
      <SkeletonBlock width={44} height={44} radius={PROP_RADIUS.icon} />
      <View style={styles.headerCol}>
        <SkeletonBlock width="85%" height={16} radius={6} />
        <SkeletonBlock width="60%" height={12} radius={6} />
      </View>
      <SkeletonBlock width={60} height={26} radius={999} />
    </View>

    {/* Meta chip row */}
    <View style={styles.chipRow}>
      <SkeletonBlock width={84} height={26} radius={999} />
      <SkeletonBlock width={84} height={26} radius={999} />
    </View>

    {/* Occupancy track */}
    <SkeletonBlock width="100%" height={6} radius={999} />

    {/* Hairline */}
    <View style={styles.hairline} />

    {/* Action buttons row */}
    <View style={styles.actionRow}>
      <SkeletonBlock width="30%" height={40} radius={999} />
      <SkeletonBlock width="30%" height={40} radius={999} />
      <SkeletonBlock width={40} height={40} radius={16} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: PROP_RADIUS.card,
    gap: PROP_SPACE.gap,
    backgroundColor: tokens.colors.surface,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerCol: {
    flex: 1,
    gap: 4,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  hairline: {
    height: 1,
    backgroundColor: tokens.colors.border,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
});

export default PropertyCardSkeleton;
