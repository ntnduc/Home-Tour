import CardComponent from "@/screens/common/CardComponent";
import { colors } from "@/theme/colors";
import { tokens } from "@/theme";
import {
  CONTRACT_STATUS_COLOR,
  CONTRACT_STATUS_LABEL,
  ContractStatus,
} from "@/types/contract";
import { RoomAction, RoomActionType, RoomListResponse } from "@/types/room";
import { formatDate } from "@/utils/dateUtil";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { Badge } from "react-native-elements";
import styles from "../styles/StyleRoomCardItemComponent";

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

const CARD_ALERT_TONE = {
  foreground: colors.status.error,
  background: tokens.colors.errorSurface,
  shadow: colors.status.error,
};

const getActionTone = (severity: RoomAction["severity"]) => {
  switch (severity) {
    case "overdue":
      return {
        foreground: colors.status.error,
        background: colors.secondary.light,
        border: colors.status.error,
      };
    case "warning":
      return {
        foreground: colors.status.warning,
        background: tokens.colors.warningSurface,
        border: colors.status.warning,
      };
    case "normal":
    default:
      return {
        foreground: colors.primary.main,
        background: colors.primary.light,
        border: colors.primary.main,
      };
  }
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

  const renderActionButton = (action: RoomAction, index: number) => {
    const tone = getActionTone(action.severity);

    return (
      <TouchableOpacity
        activeOpacity={0.82}
        key={`${action.type}-${action.priority}-${index}`}
        onPress={() => handleActionPress(action)}
        style={[
          styles.roomActionButton,
          action.primary
            ? styles.primaryRoomActionButton
            : styles.secondaryRoomActionButton,
          {
            backgroundColor: tone.background,
            borderColor: tone.border,
          },
        ]}
      >
        <Ionicons
          name={ROOM_ACTION_ICONS[action.type]}
          size={16}
          color={tone.foreground}
        />
        <Text
          numberOfLines={1}
          style={[styles.roomActionButtonText, { color: tone.foreground }]}
        >
          {action.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const cardTitle = (
    <Text style={styles.cardTitle} numberOfLines={1}>
      {item.name}
    </Text>
  );

  const alertTone = hasOverdueAlert ? CARD_ALERT_TONE : null;

  const cardNotice = alertTone ? (
    <View style={styles.cardNotice}>
      <Ionicons
        name="warning-outline"
        size={17}
        color={alertTone.foreground}
      />
      <Text style={[styles.cardNoticeText, { color: alertTone.foreground }]}>
        {item.overdueAlertMessage || DEFAULT_OVERDUE_ALERT_MESSAGE}
      </Text>
    </View>
  ) : undefined;

  return (
    <View style={styles.cardWrapper}>
      <CardComponent
        style={[
          styles.card,
          alertTone
            ? {
                backgroundColor: alertTone.background,
                borderWidth: 0,
                shadowColor: alertTone.shadow,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.18,
                shadowRadius: 5,
                elevation: 5,
              }
            : null,
        ]}
        topContent={cardNotice}
        title={cardTitle}
        actions={["edit", "delete"]}
        onActionPress={(key) => {
          if (key === "edit") {
            navigation.navigate("UpdateRoom", { roomId: item.id });
          }
        }}
        description={item.property?.name}
      >
      <View style={styles.contentRow}>
        <View style={styles.contentColumn}>
          <Text style={styles.price}>
            {item.rentAmount?.toLocaleString() ?? ""}đ/tháng
          </Text>
          {item.description && (
            <Text style={styles.roomDesc}>{item.description}</Text>
          )}

          {contractActive && (
            <View style={styles.contractInfo}>
              <View style={styles.contractRow}>
                <Text style={styles.contractLabel}>Người thuê:</Text>
                <Text style={styles.contractText}>
                  {item.landlordClient || "N/A"}
                </Text>
              </View>
              <View style={styles.contractRow}>
                <Text style={styles.contractLabel}>Hợp đồng:</Text>
                <Text style={styles.contractText}>#{contractActive.code}</Text>
              </View>
            </View>
          )}

          {contractActive && contractActive.status === ContractStatus.ACTIVE && (
            <View style={styles.paymentInfo}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Trạng thái thanh toán:</Text>
                <View
                  style={[
                    styles.paymentStatusBadge,
                    {
                      backgroundColor:
                        CONTRACT_STATUS_COLOR[contractActive.status].bg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentStatusText,
                      {
                        color:
                          CONTRACT_STATUS_COLOR[contractActive.status].color,
                      },
                    ]}
                  >
                    {CONTRACT_STATUS_LABEL[contractActive.status]}
                  </Text>
                </View>
              </View>
              {contractActive.endDate && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Hạn thanh toán:</Text>
                  <Text
                    style={[
                      styles.paymentDateText,
                      contractActive.endDate &&
                      new Date(contractActive.endDate) < new Date()
                        ? styles.overdueText
                        : contractActive.endDate &&
                            new Date(contractActive.endDate) <=
                              new Date(
                                new Date().setDate(new Date().getDate() + 3),
                              )
                          ? styles.warningText
                          : styles.normalText,
                    ]}
                  >
                    {formatDate(contractActive.endDate)}
                  </Text>
                </View>
              )}
              {contractActive.id && (
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Tổng hóa đơn:</Text>
                  <Text style={styles.invoiceAmount}>
                    {contractActive.depositAmountPaid.toLocaleString()}đ
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {primaryActions.length > 0 && (
        <View style={styles.primaryActionsContainer}>
          {primaryActions.map(renderActionButton)}
        </View>
      )}

      {secondaryActions.length > 0 && (
        <View style={styles.moreActionsWrapper}>
          <View style={styles.moreActionsDividerRow}>
            <View style={styles.moreActionsDivider} />
            <TouchableOpacity
              activeOpacity={0.72}
              onPress={toggleSecondaryActions}
              style={styles.moreActionsToggle}
            >
              <Text style={styles.moreActionsToggleText}>Hành động thêm</Text>
              <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={colors.text.secondary}
                />
              </Animated.View>
            </TouchableOpacity>
            <View style={styles.moreActionsDivider} />
          </View>

          <Animated.View
            style={[
              styles.secondaryActionsAnimatedWrapper,
              { height: secondaryPanelAnimatedHeight, opacity: expandAnim },
            ]}
            pointerEvents={isSecondaryExpanded ? "auto" : "none"}
          >
            <Animated.View
              style={[
                styles.secondaryActionsMeasure,
                { transform: [{ translateY: secondaryPanelTranslateY }] },
              ]}
              onLayout={(event) => {
                const measuredHeight = event.nativeEvent.layout.height;
                if (measuredHeight > 0 && measuredHeight !== secondaryPanelHeight) {
                  setSecondaryPanelHeight(measuredHeight);
                }
              }}
            >
              <View style={styles.secondaryActionsPanel}>
                <View style={styles.secondaryActionsContainer}>
                  {secondaryActions.map(renderActionButton)}
                </View>
              </View>
            </Animated.View>
          </Animated.View>
        </View>
      )}
      </CardComponent>
      {pendingTaskCount > 0 && (
        <Badge
          value={pendingTaskCount > 99 ? "99+" : pendingTaskCount}
          status="error"
          containerStyle={styles.pendingBadgeContainer}
          badgeStyle={styles.pendingBadge}
          textStyle={styles.pendingBadgeText}
        />
      )}
    </View>
  );
};

export default RoomCardItemComponent;
