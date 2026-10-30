/**
 * Room card — Modern Minimalist redesign with compact layout and action hierarchy.
 *
 * ```
 * ┌───────────────────────────────────────┐ Card padding="none" · body padding 16 · gap 12
 * │ ⚠ Phòng có công việc quá hạn…         │ NoticeBanner (overdue only)
 * │ [● Đang thuê] [⚡ 3]          (✎) (🗑) │ TOP: StatusBadge sm + CountBadge md icon · IconButton sm ×2
 * │ P.101                                  │ name 18/24 bold −0.3 ink, 1 line
 * │ ▣ Nhà A                                │ building icon 12 subtle + caption, 1 line
 * │ 3.500.000đ /tháng                      │ rent 20/26 bold ink −0.3 + caption " /tháng"
 * │ Phòng góc, ban công…                   │ description caption, max 2 lines
 * │ ┌ RoomContractTile (ACTIVE only) ─┐   │ nested tile, bg canvas, r16, no shadow
 * │ │ (👤) Nguyễn A    [● Đang h.lực] │   │
 * │ │      HĐ #HD-001                 │   │
 * │ │ ─────────────────────────────── │   │ hairline
 * │ │ HẠN THANH TOÁN      TỔNG HOÁ ĐƠN│   │ 2 equal columns, eyebrow + values
 * │ │ 12/10/2026          1.200.000đ  │   │
 * │ └─────────────────────────────────┘   │
 * ├──────────────────────────────────────┤ hairline (only if actions)
 * │ RoomCardActions (primary + secondary) │ padding 16 · gap 10 (moved to RoomCardActions)
 * └───────────────────────────────────────┘
 * ```
 */
import Card from "@/components/Card";
import { CARD_ACTION_PRESETS } from "@/components/CardActionsPresets";
import CountBadge from "@/components/CountBadge";
import IconButton from "@/components/IconButton";
import NoticeBanner from "@/components/NoticeBanner";
import StatusBadge from "@/components/StatusBadge";
import { ROOM_STATUS_BADGE } from "@/constant/room.constant";
import { RootStackParamList } from "@/navigation/types";
import { tokens, uiColors, uiType, uiWeight } from "@/theme";
import { ContractStatus } from "@/types/contract";
import { RoomAction, RoomListResponse } from "@/types/room";
import { formatCurrency } from "@/utils/appUtil";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import RoomCardActions from "./RoomCardActions";
import RoomContractTile from "./RoomContractTile";

type RoomCardItemProps = {
  item: RoomListResponse;
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const DEFAULT_OVERDUE_ALERT_MESSAGE = "Phòng có công việc quá hạn cần xử lý";

const RoomCardItemComponent = ({ item, navigation }: RoomCardItemProps) => {
  const contractActive = item.contracts?.find(
    (contract) => contract.status === ContractStatus.ACTIVE,
  );

  const pendingTaskCount = item.pendingTaskCount ?? 0;
  const hasOverdueAlert = item.hasOverdueAlert ?? false;

  const handleActionPress = (action: RoomAction) => {
    const payload = action.payload ?? {};

    switch (action.type) {
      case "INVOICE_PAYMENT":
        if (!payload.invoiceId) return;
        if (payload.invoiceStatus === "DRAFT") {
          navigation.navigate("ConfirmDraftInvoice", {
            invoiceId: payload.invoiceId,
          });
          return;
        }
        navigation.navigate("InvoiceDetail", { invoiceId: payload.invoiceId });
        return;
      case "CREATE_INVOICE":
        if (!payload.contractId || !payload.roomId) return;
        navigation.navigate("CreateInvoice", {
          contractId: payload.contractId,
          roomId: payload.roomId,
        });
        return;
      case "CONFIRM_PAYMENT":
        if (payload.invoiceId) {
          navigation.navigate("InvoiceDetail", {
            invoiceId: payload.invoiceId,
            confirmContractId: payload.contractId,
          });
          return;
        }
        if (!payload.contractId) return;
        navigation.navigate("ContractDetail", {
          contractId: payload.contractId,
        });
        return;
      case "CONFIRM_CONTRACT":
      case "VIEW_CONTRACT":
        if (!payload.contractId) return;
        navigation.navigate("ContractDetail", {
          contractId: payload.contractId,
        });
        return;
      case "RENEW_CONTRACT":
      case "CREATE_CONTRACT":
        if (!payload.roomId) return;
        navigation.navigate("CreateContract", { roomId: payload.roomId });
        return;
      case "TERMINATE_CONTRACT":
        if (!payload.contractId) return;
        navigation.navigate("TerminateContract", {
          contractId: payload.contractId,
        });
        return;
      default:
        return;
    }
  };

  const statusBadge =
    ROOM_STATUS_BADGE[item.status] ?? ROOM_STATUS_BADGE.UNAVAILABLE;

  return (
    <Card
      padding="none"
      elevation="soft"
      style={hasOverdueAlert ? styles.cardOverdue : undefined}
    >
      {/* Card body */}
      <View style={styles.body}>
        {/* Overdue banner */}
        {hasOverdueAlert && (
          <NoticeBanner
            tone="error"
            icon="warning-outline"
            message={item.overdueAlertMessage || DEFAULT_OVERDUE_ALERT_MESSAGE}
          />
        )}

        {/* Top row: status badge + count badge + actions */}
        <View style={styles.topRow}>
          <View style={styles.badgeCluster}>
            <StatusBadge
              label={statusBadge.label}
              tone={statusBadge.tone}
              size="sm"
            />
            {pendingTaskCount > 0 && (
              <CountBadge
                count={pendingTaskCount}
                tone="alert"
                size="md"
                icon={hasOverdueAlert ? "flame" : "flash"}
              />
            )}
          </View>

          <View style={styles.iconCluster}>
            <IconButton
              icon={CARD_ACTION_PRESETS.edit.icon}
              onPress={() =>
                navigation.navigate("UpdateRoom", {
                  roomId: item.id,
                  room: item,
                })
              }
              accessibilityLabel="Sửa phòng"
              size="sm"
              tone={CARD_ACTION_PRESETS.edit.tone}
            />
            <IconButton
              icon={CARD_ACTION_PRESETS.delete.icon}
              onPress={() => {
                // No-op (existing behavior)
              }}
              accessibilityLabel="Xoá phòng"
              size="sm"
              tone={CARD_ACTION_PRESETS.delete.tone}
            />
          </View>
        </View>

        {/* Name block (room name + building with icon) */}
        <View style={styles.nameBlock}>
          {/* Room name (18/24 bold −0.3) */}
          <Text style={styles.roomName} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Building name with icon (if present) */}
          {item.property?.name ? (
            <View style={styles.buildingRow}>
              <Ionicons
                name="business-outline"
                size={12}
                color={uiColors.textSubtle}
              />
              <Text
                style={[uiType.caption, styles.buildingText]}
                numberOfLines={1}
              >
                {item.property.name}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Rent (20/26 bold −0.3 + caption suffix) */}
        <View style={styles.rentRow}>
          <Text style={styles.rentValue}>
            {formatCurrency(item.rentAmount ?? 0)}đ
          </Text>
          <Text style={uiType.caption}>/tháng</Text>
        </View>

        {/* Description (caption, max 2 lines) */}
        {item.description ? (
          <Text style={[uiType.caption, styles.description]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {/* Contract tile (only if ACTIVE contract) */}
        {contractActive && (
          <RoomContractTile
            contract={contractActive}
            tenantName={item.landlordClient || "N/A"}
          />
        )}
      </View>

      {/* Divider (only if actions exist) */}
      {(item.actions ?? []).length > 0 && <View style={styles.divider} />}

      {/* Actions section (moved to RoomCardActions component) */}
      <RoomCardActions
        actions={item.actions ?? []}
        onActionPress={handleActionPress}
        resetKey={item.id}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  cardOverdue: {
    borderWidth: 1,
    borderColor: tokens.colors.errorSurface,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeCluster: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconCluster: {
    flexDirection: "row",
    gap: 8,
  },
  nameBlock: {
    gap: 2,
  },
  roomName: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: uiWeight.bold,
    letterSpacing: -0.3,
    color: uiColors.ink,
  },
  buildingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  buildingText: {
    flex: 1,
  },
  rentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  rentValue: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: uiWeight.bold,
    letterSpacing: -0.3,
    color: uiColors.ink,
  },
  description: {
    color: uiColors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: uiColors.hairline,
  },
});

export default RoomCardItemComponent;
