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

import { tokens, shadows, statusColor } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { PropertyListResponse, PropertyRoomsStatus } from "@/types/property";
import React from "react";
import { StyleSheet, Text, View, DimensionValue } from "react-native";
import PressableScale from "@/components/PressableScale";
import {
  PROP_RADIUS,
  PROP_SPACE,
  propColors,
  propType,
} from "../propertyListStyles";

export interface PropertyCardComponentProps {
  property: PropertyListResponse;
  onPress: () => void;
  onEdit: () => void;
  onViewRooms: () => void;
  onAddRoom: () => void;
}

/**
 * Card body — everything except the action row (which is outside PressableScale).
 */
const PropertyCardComponent = ({
  property,
  onPress,
  onEdit,
  onViewRooms,
  onAddRoom,
}: PropertyCardComponentProps) => {
  const statusInfo = getStatusPill(property.statusRooms);
  const occupancyRatio =
    property.totalRoom > 0
      ? (property.totalRoomOccupied ?? 0) / property.totalRoom
      : 0;
  const occupancyPercent = Math.round(occupancyRatio * 100);
  const fillWidth: DimensionValue = `${occupancyPercent}%`;
  const fillColor = getOccupancyFillColor(occupancyRatio);

  return (
    <View style={[styles.cardContainer, shadows.soft]}>
      {/* Card body + meta — whole area is pressable to open PropertyDetail */}
      <PressableScale onPress={onPress} scaleTo={0.97} style={styles.cardBody}>
        {/* Header: icon + name + status pill */}
        <View style={styles.headerRow}>
          <View style={styles.iconSquircle}>
            <Ionicons name="business" size={20} color={tokens.colors.primary} />
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {property.name}
            </Text>
            <View style={styles.addressRow}>
              <Ionicons
                name="location-outline"
                size={12}
                color={tokens.colors.subtle}
              />
              <Text
                style={[propType.caption, { fontSize: 12 }]}
                numberOfLines={1}
              >
                {property.address}
              </Text>
            </View>
          </View>
          <View
            style={[styles.statusPill, { backgroundColor: statusInfo.bgColor }]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusInfo.dotColor },
              ]}
            />
            <Text
              style={[
                propType.caption,
                { color: statusInfo.textColor, fontWeight: "600" },
              ]}
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Meta chip row: floors + rooms */}
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Ionicons
              name="layers-outline"
              size={12}
              color={tokens.colors.muted}
            />
            <Text style={[propType.caption, { fontSize: 12 }]}>
              {property.numberFloor ?? 0} tầng
            </Text>
          </View>
          <View style={styles.chip}>
            <Ionicons
              name="bed-outline"
              size={12}
              color={tokens.colors.muted}
            />
            <Text style={[propType.caption, { fontSize: 12 }]}>
              {property.totalRoom} phòng
            </Text>
          </View>
        </View>

        {/* Occupancy: eyebrow + ratio + bar */}
        {property.totalRoom > 0 ? (
          <>
            <View style={styles.occupancyHeader}>
              <Text style={[propType.eyebrow, { color: tokens.colors.subtle }]}>
                ĐÃ THUÊ
              </Text>
              <Text style={styles.occupancyRatio}>
                {property.totalRoomOccupied ?? 0}/{property.totalRoom}
              </Text>
            </View>
            <View style={styles.occupancyTrack}>
              <View
                style={[
                  styles.occupancyFill,
                  { width: fillWidth, backgroundColor: fillColor },
                ]}
              />
            </View>
          </>
        ) : (
          <Text style={[propType.caption, { color: tokens.colors.muted }]}>
            Chưa có phòng nào
          </Text>
        )}
      </PressableScale>

      {/* Hairline divider */}
      <View style={styles.hairline} />

      {/* Action buttons row — sibling, not nested (iOS shadow fix) */}
      <View style={styles.actionRow}>
        <PressableScale
          onPress={onViewRooms}
          scaleTo={0.94}
          style={[styles.actionButton, styles.actionPrimary]}
        >
          <Ionicons
            name="bed-outline"
            size={16}
            color={tokens.colors.primary}
          />
          <Text style={[styles.actionLabel, { color: tokens.colors.primary }]}>
            Xem phòng
          </Text>
        </PressableScale>

        <PressableScale
          onPress={onAddRoom}
          scaleTo={0.94}
          style={[styles.actionButton, styles.actionSecondary]}
        >
          <Ionicons name="add" size={16} color={tokens.palette.gray[900]} />
          <Text
            style={[styles.actionLabel, { color: tokens.palette.gray[900] }]}
          >
            Thêm phòng
          </Text>
        </PressableScale>

        <PressableScale
          onPress={onEdit}
          scaleTo={0.92}
          accessibilityLabel="Sửa tài sản"
          hitSlop={4}
          style={styles.editButton}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color={tokens.palette.gray[900]}
          />
        </PressableScale>
      </View>
    </View>
  );
};

/**
 * Status pill (PropertyRoomsStatus → label + color + background).
 * From blueprint §5.1 table, uses statusColor tone table.
 */
function getStatusPill(status?: PropertyRoomsStatus) {
  switch (status) {
    case PropertyRoomsStatus.FULL:
      return {
        label: "Đầy phòng",
        textColor: statusColor.success.color,
        dotColor: statusColor.success.color,
        bgColor: statusColor.success.bg,
      };
    case PropertyRoomsStatus.PARTIAL:
      return {
        label: "Còn phòng",
        textColor: statusColor.pending.color,
        dotColor: statusColor.pending.color,
        bgColor: statusColor.pending.bg,
      };
    case PropertyRoomsStatus.EMPTY:
    default:
      return {
        label: "Chưa có phòng",
        textColor: statusColor.draft.color,
        dotColor: statusColor.draft.color,
        bgColor: statusColor.draft.bg,
      };
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
  cardContainer: {
    borderRadius: PROP_RADIUS.card,
    backgroundColor: tokens.colors.surface,
  },
  cardBody: {
    padding: 16,
    gap: PROP_SPACE.gap,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  iconSquircle: {
    width: 44,
    height: 44,
    borderRadius: PROP_RADIUS.icon,
    backgroundColor: tokens.colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  titleCol: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: tokens.palette.gray[900],
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexShrink: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: tokens.colors.surfaceMuted,
  },
  occupancyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  occupancyRatio: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    color: tokens.palette.gray[900],
  },
  occupancyTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: tokens.palette.gray[200],
    overflow: "hidden",
  },
  occupancyFill: {
    height: "100%",
    borderRadius: 999,
  },
  hairline: {
    height: 1,
    backgroundColor: tokens.colors.border,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: 999,
  },
  actionPrimary: {
    flex: 1,
    backgroundColor: tokens.colors.primaryMuted,
  },
  actionSecondary: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: PROP_RADIUS.icon,
    backgroundColor: tokens.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PropertyCardComponent;
