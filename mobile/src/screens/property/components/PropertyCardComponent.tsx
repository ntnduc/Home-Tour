/**
 * Property card for list display.
 *
 * Card anatomy (from blueprint §5.1):
 * ```
 * ┌─────────────────────────────────────────────┐ shadow soft · radius 24 · bg surface
 * │ ├─ PressableScale (body + meta)             │
 * │ │  ├─ header row (icon squircle + title + status pill)
 * │ │  ├─ meta chip row (floors + rooms)
 * │ │  └─ occupancy block (eyebrow + ratio + fill bar)
 * │ ├─ hairline divider
 * │ └─ action row (sibling, not nested)
 * │    ├─ "Xem phòng" button
 * │    ├─ "Thêm phòng" button
 * │    └─ Edit icon button
 * └─────────────────────────────────────────────┘
 * ```
 *
 * Key: action row is a **sibling** of the card-level PressableScale to prevent
 * nested touchables (iOS shadow pitfall).
 */

import Button from "@/components/Button";
import Card from "@/components/Card";
import Chip from "@/components/Chip";
import IconButton from "@/components/IconButton";
import IconSquircle from "@/components/IconSquircle";
import PressableScale from "@/components/PressableScale";
import StatusBadge, { StatusTone } from "@/components/StatusBadge";
import { tokens, uiColors, uiSpace, uiType, uiWeight } from "@/theme";
import { PropertyListResponse, PropertyRoomsStatus } from "@/types/property";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { DimensionValue, StyleSheet, Text, View } from "react-native";

export interface PropertyCardComponentProps {
  property: PropertyListResponse;
  onPress: () => void;
  onEdit: () => void;
  onViewRooms: () => void;
  onAddRoom: () => void;
}

const PropertyCardComponent = ({
  property,
  onPress,
  onEdit,
  onViewRooms,
  onAddRoom,
}: PropertyCardComponentProps) => {
  const status = getRoomsStatus(property.statusRooms);
  const occupancyRatio =
    property.totalRoom > 0
      ? (property.totalRoomOccupied ?? 0) / property.totalRoom
      : 0;
  const fillWidth: DimensionValue = `${Math.round(occupancyRatio * 100)}%`;
  const fillColor = getOccupancyFillColor(occupancyRatio);

  return (
    <Card padding="none">
      {/* Card body + meta — whole area is pressable to open PropertyDetail */}
      <PressableScale onPress={onPress} scaleTo={0.97} style={styles.cardBody}>
        <View style={styles.headerRow}>
          <IconSquircle icon="business" />
          <View style={styles.titleCol}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {property.name}
            </Text>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={12} color={uiColors.textSubtle} />
              <Text style={[uiType.caption, styles.flex]} numberOfLines={1}>
                {property.address}
              </Text>
            </View>
          </View>
          <StatusBadge label={status.label} tone={status.tone} />
        </View>

        <View style={styles.chipRow}>
          <Chip icon="layers-outline" label={`${property.numberFloor ?? 0} tầng`} />
          <Chip icon="bed-outline" label={`${property.totalRoom} phòng`} />
        </View>

        {property.totalRoom > 0 ? (
          <>
            <View style={styles.occupancyHeader}>
              <Text style={uiType.eyebrow}>Đã thuê</Text>
              <Text style={styles.occupancyRatio}>
                {property.totalRoomOccupied ?? 0}/{property.totalRoom}
              </Text>
            </View>
            <View style={styles.occupancyTrack}>
              <View
                style={[styles.occupancyFill, { width: fillWidth, backgroundColor: fillColor }]}
              />
            </View>
          </>
        ) : (
          <Text style={uiType.caption}>Chưa có phòng nào</Text>
        )}
      </PressableScale>

      <View style={styles.hairline} />

      {/* Action row — sibling of the pressable body, never nested */}
      <View style={styles.actionRow}>
        <Button label="Xem phòng" icon="bed-outline" variant="soft" size="md" block onPress={onViewRooms} />
        <Button label="Thêm phòng" icon="add" variant="outline" size="md" block onPress={onAddRoom} />
        <IconButton
          icon="create-outline"
          shape="squircle"
          onPress={onEdit}
          accessibilityLabel="Sửa tài sản"
        />
      </View>
    </Card>
  );
};

/** PropertyRoomsStatus → badge label + tone. */
function getRoomsStatus(status?: PropertyRoomsStatus): { label: string; tone: StatusTone } {
  switch (status) {
    case PropertyRoomsStatus.FULL:
      return { label: "Đầy phòng", tone: "success" };
    case PropertyRoomsStatus.PARTIAL:
      return { label: "Còn phòng", tone: "warning" };
    case PropertyRoomsStatus.EMPTY:
    default:
      return { label: "Chưa có phòng", tone: "neutral" };
  }
}

/**
 * Occupancy fill color (from blueprint §5.1).
 * - === 1.0 → success (green)
 * - > 0 && < 1 → amber/warning (yellow)
 * - === 0 → draft/gray (light gray)
 */
function getOccupancyFillColor(ratio: number): string {
  if (ratio === 1) {
    return tokens.colors.success;
  }
  if (ratio > 0) {
    return tokens.palette.amber[500];
  }
  return tokens.palette.gray[300];
}

const styles = StyleSheet.create({
  cardBody: {
    padding: uiSpace.card,
    gap: uiSpace.gap,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  titleCol: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
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
    gap: 8,
  },
  occupancyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  occupancyRatio: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: uiWeight.bold,
    color: uiColors.ink,
  },
  occupancyTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: uiColors.track,
    overflow: "hidden",
  },
  occupancyFill: {
    height: "100%",
    borderRadius: 999,
  },
  hairline: {
    height: 1,
    backgroundColor: uiColors.hairline,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    padding: uiSpace.card,
    alignItems: "center",
  },
});

export default PropertyCardComponent;
