/**
 * First-load placeholder for Create/UpdatePropertyScreen — same shapes as the
 * summary card + form section cards to avoid layout shift.
 */

import SkeletonBlock from "@/components/SkeletonBlock";
import { shadows } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { PROP_RADIUS, PROP_SPACE, propColors } from "../propertyListStyles";

const FieldSkeleton = () => (
  <View style={styles.field}>
    <SkeletonBlock width="35%" height={12} radius={6} />
    <SkeletonBlock height={44} radius={10} />
  </View>
);

const SectionSkeleton = ({ fields }: { fields: number }) => (
  <View style={[styles.card, shadows.soft]}>
    <View style={styles.headerRow}>
      <SkeletonBlock width={36} height={36} radius={12} />
      <SkeletonBlock width="45%" height={16} radius={6} />
    </View>
    {Array.from({ length: fields }, (_, i) => (
      <FieldSkeleton key={i} />
    ))}
  </View>
);

const PropertyFormSkeleton = () => (
  <View style={styles.container}>
    <View style={[styles.card, shadows.soft]}>
      <View style={styles.headerRow}>
        <SkeletonBlock width={44} height={44} radius={PROP_RADIUS.icon} />
        <View style={styles.headerCol}>
          <SkeletonBlock width="70%" height={16} radius={6} />
          <SkeletonBlock width="50%" height={12} radius={6} />
        </View>
      </View>
      <View style={styles.headerRow}>
        <SkeletonBlock width={84} height={26} radius={PROP_RADIUS.pill} />
        <SkeletonBlock width={84} height={26} radius={PROP_RADIUS.pill} />
      </View>
    </View>
    <SectionSkeleton fields={1} />
    <SectionSkeleton fields={3} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: propColors.canvas,
    paddingHorizontal: PROP_SPACE.screen,
    paddingTop: 16,
    gap: PROP_SPACE.gap,
  },
  card: {
    borderRadius: PROP_RADIUS.card,
    backgroundColor: propColors.card,
    padding: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerCol: {
    flex: 1,
    gap: 6,
  },
  field: {
    gap: 6,
  },
});

export default PropertyFormSkeleton;
