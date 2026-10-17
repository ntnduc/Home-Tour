import DisplayField from "@/components/DisplayField";
import IconSquircle from "@/components/IconSquircle";
import StatusBadge from "@/components/StatusBadge";
import CardComponent from "@/screens/common/CardComponent";
import { uiColors, uiType } from "@/theme";
import { formatCurrency, formatPhoneNumber } from "@/utils/appUtil";
import { formatDate } from "@/utils/dateUtil";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  CONTRACT_STATUS_BADGE,
  ContractListResponse,
  ContractStatus
} from "../../../types/contract";

interface ContractCardProps {
  contract: ContractListResponse;
  onPress: () => void;
  showActions?: boolean;
  onViewDetails?: () => void;
  onTerminate?: () => void;
  onRenew?: () => void;
}

const ContractCard = ({
  contract,
  onPress,
  showActions = false,
  onViewDetails,
  onTerminate,
  onRenew,
}: ContractCardProps) => {

  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(contract.endDate ?? "");
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const canRenew =
    contract.status === ContractStatus.ACTIVE && daysRemaining <= 30;
  const canTerminate = contract.status === ContractStatus.ACTIVE;

  const tenantContract = contract.client?.findLast(item => item.isLandlordClient && item.isActiveInContract);

  const remainingLabel =
    daysRemaining > 0
      ? `Còn lại ${daysRemaining} ngày`
      : daysRemaining === 0
        ? "Hết hạn hôm nay"
        : `Quá hạn ${Math.abs(daysRemaining)} ngày`;

  return (
    <CardComponent
      onPress={onPress}
      actions={showActions ? ["view", { key: "renew", disabled: !canRenew }, { key: "terminate", disabled: !canTerminate }] : undefined}
      title={contract.code}
      description={`${contract.roomName} - ${contract.propertyName}`}
      onActionPress={(key) => {
        if (key === "view") {
          onViewDetails?.();
        } else if (key === "renew" && canRenew) {
          onRenew?.();
        } else if (key === "terminate" && canTerminate) {
          onTerminate?.();
        }
      }}
      statusBadge={CONTRACT_STATUS_BADGE[contract.status]}
    >
      <View style={styles.body}>
        {/* Tenant */}
        <View style={styles.tenantRow}>
          <IconSquircle icon="person-outline" tone="neutral" size="sm" />
          <View style={styles.flex}>
            <Text style={uiType.bodyStrong} numberOfLines={1}>
              {tenantContract?.name ?? "—"}
            </Text>
            <Text style={uiType.caption}>
              {formatPhoneNumber(tenantContract?.phoneNumber ?? "")}
            </Text>
          </View>
        </View>

        {/* Period */}
        <View style={styles.section}>
          <View style={styles.periodRow}>
            <DisplayField compact direction="vertical" label="Bắt đầu" value={formatDate(contract.startDate)} strong />
            {contract.endDate && (
              <>
                <Ionicons name="arrow-forward" size={16} color={uiColors.textSubtle} />
                <DisplayField
                  compact
                  direction="vertical"
                  align="end"
                  label="Kết thúc"
                  value={formatDate(contract.endDate)}
                  strong
                />
              </>
            )}
          </View>
          {contract.status === ContractStatus.ACTIVE && (
            <StatusBadge
              size="sm"
              showDot={false}
              label={remainingLabel}
              tone={daysRemaining <= 0 ? "error" : daysRemaining <= 7 ? "warning" : "info"}
            />
          )}
        </View>

        {/* Money */}
        <View style={styles.section}>
          <DisplayField compact label="Tiền thuê" value={`${formatCurrency(contract.rentAmountAgreed)}đ/tháng`} strong />
          <DisplayField compact label="Tiền cọc" value={`${formatCurrency(contract.depositAmountPaid)}đ`} strong />
        </View>
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  body: {
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  tenantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  section: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: uiColors.hairline,
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
});

export default ContractCard;
