/**
 * One service tile inside the "Dịch vụ thu phí" section.
 *
 * ```
 * ┌───────────────────────────────────────────┐ bg canvas · radius 20 (tile)
 * │ DỊCH VỤ 1                            (🗑)  │  eyebrow + IconButton (error tone)
 * │ children (search · price · method)        │
 * └───────────────────────────────────────────┘
 * ```
 */

import IconButton from "@/components/IconButton";
import { uiColors, uiRadius, uiType } from "@/theme";
import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export interface PropertyServiceItemProps {
  index: number;
  onRemove: () => void;
  children: ReactNode;
}

const PropertyServiceItem = ({ index, onRemove, children }: PropertyServiceItemProps) => (
  <View style={styles.tile}>
    <View style={styles.headerRow}>
      <Text style={uiType.eyebrow}>Dịch vụ {index + 1}</Text>
      <IconButton
        icon="trash-outline"
        tone="error"
        size="sm"
        onPress={onRemove}
        accessibilityLabel={`Xóa dịch vụ ${index + 1}`}
      />
    </View>
    <View style={styles.body}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  tile: {
    borderRadius: uiRadius.tile,
    backgroundColor: uiColors.canvas,
    padding: 12,
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  body: {
    gap: 8,
  },
});

export default PropertyServiceItem;
