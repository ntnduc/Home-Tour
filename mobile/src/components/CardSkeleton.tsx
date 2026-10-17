import { uiRadius } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import Card from "./Card";
import SkeletonBlock from "./SkeletonBlock";

interface CardSkeletonProps {
  /** Number of body text lines under the header (default 2). */
  lines?: number;
  /** Show a leading icon squircle in the header (default true). */
  withIcon?: boolean;
}

/**
 * Generic first-load placeholder shaped like a content card
 * (header: icon + title/subtitle + pill · body lines).
 */
const CardSkeleton = ({ lines = 2, withIcon = true }: CardSkeletonProps) => (
  <Card style={styles.card}>
    <View style={styles.headerRow}>
      {withIcon && <SkeletonBlock width={44} height={44} radius={uiRadius.icon} />}
      <View style={styles.headerCol}>
        <SkeletonBlock width="70%" height={16} radius={6} />
        <SkeletonBlock width="45%" height={12} radius={6} />
      </View>
      <SkeletonBlock width={64} height={26} radius={uiRadius.pill} />
    </View>
    {Array.from({ length: lines }, (_, i) => (
      <SkeletonBlock key={i} width={i === lines - 1 ? "60%" : "100%"} height={12} radius={6} />
    ))}
  </Card>
);

/** `count` stacked CardSkeletons with list spacing. */
export const CardSkeletonList = ({ count = 3, ...props }: CardSkeletonProps & { count?: number }) => (
  <View style={styles.list}>
    {Array.from({ length: count }, (_, i) => (
      <CardSkeleton key={i} {...props} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    gap: 12,
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
  list: {
    gap: 12,
  },
});

export default CardSkeleton;
