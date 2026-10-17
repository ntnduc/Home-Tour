/**
 * Room card for RoomListScreen (Modern Minimalist).
 *
 * ```
 * ┌───────────────────────────────────────────── (3) ┐ CardComponent · CountBadge = pending tasks
 * │ ⚠ Phòng có công việc quá hạn…                    │ NoticeBanner (overdue only)
 * │ P.101                                  (✎)(🗑)   │ title + IconButton actions
 * │ Nhà A                                            │ description
 * │ 3.500.000đ/tháng                                 │ price (primary)
 * │ Người thuê ··················· Nguyễn A          │ DisplayField rows
 * │ Trạng thái ··················· ● Đang hiệu lực   │ StatusBadge
 * │ [ Thu tiền ] [ Tạo hoá đơn ]                     │ Button (soft · tone by severity)
 * │ ───────── Hành động thêm ⌄ ─────────             │ animated secondary panel
 * └──────────────────────────────────────────────────┘
 * ```
 */
import Button, { ButtonVariant } from "@/components/Button";
import CountBadge from "@/components/CountBadge";
import DisplayField from "@/components/DisplayField";
import NoticeBanner from "@/components/NoticeBanner";
import PressableScale from "@/components/PressableScale";
import StatusBadge from "@/components/StatusBadge";
import CardComponent from "@/screens/common/CardComponent";
import { tokens, uiColors, uiType, uiWeight } from "@/theme";
import { CONTRACT_STATUS_BADGE, ContractStatus } from "@/types/contract";
import { RoomAction, RoomActionType, RoomListResponse } from "@/types/room";
import { formatDate } from "@/utils/dateUtil";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type Props = {
  item: RoomListResponse;
  navigation: any;
};

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const ROOM_ACTION_ICONS: Record<RoomActionType, IoniconName> = {
  INVOICE_PAYMENT: "card-outline",
  CREATE_INVOICE: "receipt-outline",
  CONFIRM_CONTRACT: "checkmark-circle-outline",
  CONFIRM_DEPOSIT: "cash-outline",
  RENEW_CONTRACT: "refresh-outline",
  CREATE_CONTRACT: "document-text-outline",
  VIEW_CONTRACT: "document-outline",
  TERMINATE_CONTRACT: "close-circle-outline",
};

const DEFAULT_OVERDUE_ALERT_MESSAGE = "Phòng có công việc quá hạn cần xử lý";

/** Action severity → button variant. */
const ACTION_VARIANT: Record<RoomAction["severity"], ButtonVariant> = {
  overdue: "dangerSoft",
  warning: "warningSoft",
  normal: "soft",
};

/** Due-date color: overdue → error · within 3 days → warning · otherwise default. */
const getDueDateColor = (endDate: string | Date) => {
  const due = new Date(endDate);
  const now = new Date();
  if (due < now) return tokens.colors.error;
  if (due <= new Date(new Date().setDate(now.getDate() + 3))) return tokens.palette.amber[600];
  return uiColors.ink;
};

const RoomCardItemComponent = ({ item, navigation }: Props) => {
  const [isSecondaryExpanded, setIsSecondaryExpanded] = useState(false);
  const [secondaryPanelHeight, setSecondaryPanelHeight] = useState(0);
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  const contractActive = item.contracts?.find(
    (contract) => contract.status === ContractStatus.ACTIVE,
  );

  const sortedActions = useMemo(
    () =>
      [...(item.actions ?? [])].sort(
        (actionA, actionB) => (actionA.priority ?? 0) - (actionB.priority ?? 0),
      ),
    [item.actions],
  );

  const primaryActions = useMemo(
    () => sortedActions.filter((action) => action.primary),
    [sortedActions],
  );

  const secondaryActions = useMemo(
    () => sortedActions.filter((action) => !action.primary),
    [sortedActions],
  );

  const pendingTaskCount = item.pendingTaskCount ?? 0;
  const hasOverdueAlert = item.hasOverdueAlert ?? false;

  useEffect(() => {
    setIsSecondaryExpanded(false);
    chevronAnim.setValue(0);
    expandAnim.setValue(0);
  }, [chevronAnim, expandAnim, item.id]);

  useEffect(() => {
    if (secondaryActions.length === 0 && isSecondaryExpanded) {
      setIsSecondaryExpanded(false);
      chevronAnim.setValue(0);
      expandAnim.setValue(0);
    }
  }, [chevronAnim, expandAnim, isSecondaryExpanded, secondaryActions.length]);

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
      case "CONFIRM_CONTRACT":
      case "CONFIRM_DEPOSIT":
      case "VIEW_CONTRACT":
        if (!payload.contractId) return;
        navigation.navigate("ContractDetail", { contractId: payload.contractId });
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

  const toggleSecondaryActions = () => {
    const nextValue = !isSecondaryExpanded;

    setIsSecondaryExpanded(nextValue);
    Animated.parallel([
      Animated.timing(expandAnim, {
        toValue: nextValue ? 1 : 0,
        duration: 260,
        useNativeDriver: false,
      }),
      Animated.timing(chevronAnim, {
        toValue: nextValue ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const secondaryPanelAnimatedHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, secondaryPanelHeight],
  });

  const secondaryPanelTranslateY = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 0],
  });

  const renderActionButton = (action: RoomAction, index: number) => (
    <Button
      key={`${action.type}-${action.priority}-${index}`}
      label={action.label}
      icon={ROOM_ACTION_ICONS[action.type]}
      variant={ACTION_VARIANT[action.severity] ?? "soft"}
      size="sm"
      block={action.primary}
      onPress={() => handleActionPress(action)}
    />
  );

  return (
    <View>
      <CardComponent
        style={hasOverdueAlert ? styles.cardOverdue : undefined}
        topContent={
          hasOverdueAlert ? (
            <NoticeBanner
              tone="error"
              icon="warning-outline"
              message={item.overdueAlertMessage || DEFAULT_OVERDUE_ALERT_MESSAGE}
            />
          ) : undefined
        }
        title={item.name}
        description={item.property?.name}
        actions={["edit", "delete"]}
        onActionPress={(key) => {
          if (key === "edit") {
            navigation.navigate("UpdateRoom", { roomId: item.id });
          }
        }}
      >
        <View style={styles.content}>
          <Text style={styles.price}>{item.rentAmount?.toLocaleString() ?? ""}đ/tháng</Text>
          {item.description ? <Text style={uiType.caption}>{item.description}</Text> : null}

          {contractActive && (
            <View style={styles.infoBlock}>
              <DisplayField compact label="Người thuê" value={item.landlordClient || "N/A"} strong />
              <DisplayField compact label="Hợp đồng" value={`#${contractActive.code}`} strong />
              <DisplayField
                compact
                label="Trạng thái"
                value={
                  <StatusBadge
                    size="sm"
                    label={CONTRACT_STATUS_BADGE[contractActive.status].label}
                    tone={CONTRACT_STATUS_BADGE[contractActive.status].tone}
                  />
                }
              />
              {contractActive.endDate && (
                <DisplayField
                  compact
                  label="Hạn thanh toán"
                  value={formatDate(contractActive.endDate)}
                  strong
                  valueStyle={{ color: getDueDateColor(contractActive.endDate) }}
                />
              )}
              {contractActive.id && (
                <DisplayField
                  compact
                  label="Tổng hoá đơn"
                  value={`${contractActive.depositAmountPaid.toLocaleString()}đ`}
                  strong
                  valueStyle={styles.amount}
                />
              )}
            </View>
          )}

          {primaryActions.length > 0 && (
            <View style={styles.actionsRow}>{primaryActions.map(renderActionButton)}</View>
          )}

          {secondaryActions.length > 0 && (
            <View>
              <View style={styles.moreRow}>
                <View style={styles.moreDivider} />
                <PressableScale
                  onPress={toggleSecondaryActions}
                  scaleTo={0.96}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isSecondaryExpanded }}
                  style={styles.moreToggle}
                >
                  <Text style={styles.moreToggleText}>Hành động thêm</Text>
                  <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                    <Ionicons name="chevron-down" size={16} color={uiColors.textMuted} />
                  </Animated.View>
                </PressableScale>
                <View style={styles.moreDivider} />
              </View>

              <Animated.View
                style={[
                  styles.secondaryClip,
                  { height: secondaryPanelAnimatedHeight, opacity: expandAnim },
                ]}
                pointerEvents={isSecondaryExpanded ? "auto" : "none"}
              >
                <Animated.View
                  style={[
                    styles.secondaryMeasure,
                    { transform: [{ translateY: secondaryPanelTranslateY }] },
                  ]}
                  onLayout={(event) => {
                    const measuredHeight = event.nativeEvent.layout.height;
                    if (measuredHeight > 0 && measuredHeight !== secondaryPanelHeight) {
                      setSecondaryPanelHeight(measuredHeight);
                    }
                  }}
                >
                  <View style={styles.actionsWrap}>{secondaryActions.map(renderActionButton)}</View>
                </Animated.View>
              </Animated.View>
            </View>
          )}
        </View>
      </CardComponent>
      <CountBadge count={pendingTaskCount} tone="alert" style={styles.pendingBadge} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardOverdue: {
    borderWidth: 1,
    borderColor: tokens.colors.errorSurface,
  },
  content: {
    gap: 12,
  },
  price: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: uiWeight.bold,
    color: tokens.colors.primary,
  },
  infoBlock: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: uiColors.hairline,
  },
  amount: {
    color: tokens.colors.primary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  moreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  moreDivider: {
    flex: 1,
    height: 1,
    backgroundColor: uiColors.hairline,
  },
  moreToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  moreToggleText: {
    ...uiType.caption,
    fontWeight: uiWeight.semibold,
  },
  secondaryClip: {
    overflow: "hidden",
  },
  secondaryMeasure: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    paddingTop: 10,
  },
  pendingBadge: {
    position: "absolute",
    top: -6,
    right: -4,
  },
});

export default RoomCardItemComponent;
