import { tokens, uiColors, uiType, uiWeight } from "@/theme";
import React from "react";
import { DimensionValue, StyleSheet, Text, View } from "react-native";

interface ProgressBarProps {
  /** 0–100 */
  percentage: number;
  label?: string;
  color?: string;
  showPercentage?: boolean;
}

/**
 * Labelled progress bar (6pt pill track, matches the property occupancy bar).
 *
 * ```
 * Label                                 72%
 * ████████████████████░░░░░░░░
 * ```
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  color = tokens.colors.primary,
  showPercentage = true,
}) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  const width: DimensionValue = `${clamped}%`;
  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label ? <Text style={uiType.caption}>{label}</Text> : <View />}
          {showPercentage && <Text style={styles.value}>{Math.round(clamped)}%</Text>}
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  value: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: uiWeight.bold,
    color: uiColors.ink,
  },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: uiColors.track,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});

export default ProgressBar;
