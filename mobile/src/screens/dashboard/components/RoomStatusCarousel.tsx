import { statusColor, tokens } from "@/theme";
import { StatusColorValue } from "@/theme/status";
import { HomepageRoomFeedItem } from "@/types/homepage";
import { RoomActionSeverity, RoomStatus } from "@/types/room";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { formatCompactMoney } from "../homeFormat";
import {
  HOME_RADIUS,
  HOME_SPACE,
  homeColors,
  homeShadow,
  homeType,
  homeWeight,
} from "../homeStyles";
import PressableScale from "@/components/PressableScale";
import SkeletonBlock from "@/components/SkeletonBlock";

const CARD_WIDTH = 232;
const CARD_GAP = 12;

const ROOM_STATUS_UI: Record<
  RoomStatus,
  { label: string; tone: StatusColorValue }
> = {
  [RoomStatus.OCCUPIED]: { label: "Đang thuê", tone: statusColor.success },
  [RoomStatus.AVAILABLE]: { label: "Trống", tone: statusColor.info },
  [RoomStatus.MAINTENANCE]: { label: "Đang sửa", tone: statusColor.pending },
  [RoomStatus.PENDING_DEPOSIT]: {
    label: "Chờ đặt cọc",
    tone: statusColor.pending,
  },
  [RoomStatus.UNAVAILABLE]: {
    label: "Không hoạt động",
    tone: statusColor.cancelled,
  },
};

const ACTION_TONE: Record<RoomActionSeverity, StatusColorValue> = {
  overdue: statusColor.error,
  warning: statusColor.pending,
  normal: { bg: tokens.colors.primaryMuted, color: tokens.colors.primary },
};

type Props = {
  rooms?: HomepageRoomFeedItem[];
  isLoading: boolean;
  onPressRoom: (room: HomepageRoomFeedItem) => void;
  onPressAction: (room: HomepageRoomFeedItem) => void;
};

/**
 * CAROUSEL TRẠNG THÁI PHÒNG — cuộn ngang, snap từng card.
 * Card cố định chiều rộng (232) để luôn "ló" một phần card kế tiếp → gợi ý vuốt.
 * Cấu trúc card (trên → dưới): badge trạng thái + cờ quá hạn | tên phòng (đậm) |
 * tài sản · khách | giá thuê | nút hành động gợi ý (màu theo mức độ) hoặc "Xem chi tiết".
 */
const RoomStatusCarousel = ({
  rooms,
  isLoading,
  onPressRoom,
  onPressAction,
}: Props) => {
  if (isLoading || !rooms) {
    return (
      <View style={styles.skeletonRow}>
        {[0, 1].map((i) => (
          <SkeletonBlock
            key={i}
            width={CARD_WIDTH}
            height={196}
            radius={HOME_RADIUS.card}
          />
        ))}
      </View>
    );
  }

  if (rooms.length === 0) {
    return (
      <View style={[styles.emptyCard, homeShadow.soft]}>
        <Ionicons name="home-outline" size={22} color={homeColors.textSubtle} />
        <Text style={homeType.caption}>Chưa có phòng nào để hiển thị.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.roomId}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + CARD_GAP}
      decelerationRate="fast"
      style={styles.list}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
      renderItem={({ item }) => (
        <RoomCard
          room={item}
          onPress={() => onPressRoom(item)}
          onPressAction={() => onPressAction(item)}
        />
      )}
    />
  );
};

type RoomCardProps = {
  room: HomepageRoomFeedItem;
  onPress: () => void;
  onPressAction: () => void;
};

const RoomCard = ({ room, onPress, onPressAction }: RoomCardProps) => {
  const status = ROOM_STATUS_UI[room.status] ?? ROOM_STATUS_UI.UNAVAILABLE;
  const actionTone = room.topAction
    ? ACTION_TONE[room.topAction.severity]
    : { bg: tokens.colors.surfaceMuted, color: homeColors.ink };

  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.card,
        homeShadow.medium,
        room.hasOverdueAlert && styles.cardOverdue,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: status.tone.bg }]}>
          <View
            style={[styles.badgeDot, { backgroundColor: status.tone.color }]}
          />
          <Text style={[styles.badgeText, { color: status.tone.color }]}>
            {status.label}
          </Text>
        </View>
        {room.pendingTaskCount > 0 && (
          <View style={styles.taskCount}>
            <Ionicons
              name={room.hasOverdueAlert ? "flame" : "flash"}
              size={11}
              color={tokens.colors.onInverse}
            />
            <Text style={styles.taskCountText}>{room.pendingTaskCount}</Text>
          </View>
        )}
      </View>

      <Text style={[homeType.title, styles.roomName]} numberOfLines={1}>
        {room.roomName}
      </Text>
      <Text style={homeType.caption} numberOfLines={1}>
        {room.propertyName}
      </Text>

      <View style={styles.infoRow}>
        <Ionicons
          name="person-outline"
          size={13}
          color={homeColors.textMuted}
        />
        <Text style={[homeType.caption, styles.flex]} numberOfLines={1}>
          {room.tenantName ?? "Chưa có khách"}
        </Text>
        <Text style={styles.rent}>{formatCompactMoney(room.rentAmount)}</Text>
      </View>

      <PressableScale
        onPress={onPressAction}
        style={[styles.action, { backgroundColor: actionTone.bg }]}
        scaleTo={0.95}
      >
        <Text
          style={[styles.actionText, { color: actionTone.color }]}
          numberOfLines={1}
        >
          {room.topAction?.label ?? "Xem chi tiết"}
        </Text>
        <Ionicons name="arrow-forward" size={14} color={actionTone.color} />
      </PressableScale>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  // Tràn mép để card cuộn sát viền màn hình nhưng card đầu vẫn thẳng lề nội dung.
  list: { marginHorizontal: -HOME_SPACE.screen, overflow: "visible" },
  listContent: { paddingHorizontal: HOME_SPACE.screen, paddingBottom: 12 },
  skeletonRow: { flexDirection: "row", gap: CARD_GAP },
  emptyCard: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 24,
    borderRadius: HOME_RADIUS.card,
    backgroundColor: homeColors.card,
  },
  card: {
    width: CARD_WIDTH,
    padding: 16,
    borderRadius: HOME_RADIUS.card,
    backgroundColor: homeColors.card,
    borderWidth: 1,
    borderColor: homeColors.card,
  },
  cardOverdue: { borderColor: tokens.colors.errorSurface },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: HOME_RADIUS.pill,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: homeWeight.bold },
  taskCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: HOME_RADIUS.pill,
    backgroundColor: tokens.colors.secondary,
  },
  taskCountText: {
    color: tokens.colors.onInverse,
    fontSize: 11,
    fontWeight: homeWeight.bold,
  },
  roomName: { color: homeColors.ink },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
    marginBottom: 14,
  },
  flex: { flex: 1 },
  rent: {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: homeWeight.bold,
    color: homeColors.ink,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  actionText: {
    flex: 1,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: homeWeight.bold,
  },
});

export default RoomStatusCarousel;
