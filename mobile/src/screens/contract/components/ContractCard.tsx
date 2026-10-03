import CardComponent from "@/screens/common/CardComponent";
import { colors } from "@/theme/colors";
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

  // const getStatusColor = (status: ContractStatus) => {
  //   return CONTRACT_STATUS_COLOR[status] || { bg: "#F3F4F6", color: "#6B7280" };
  // };

  const daysRemaining = getDaysRemaining();
  // const statusColor = getStatusColor(contract.status);
  const canRenew =
    contract.status === ContractStatus.ACTIVE && daysRemaining <= 30;
  const canTerminate = contract.status === ContractStatus.ACTIVE;

  const tenantContract = contract.client?.findLast(item => item.isLandlordClient && item.isActiveInContract);

  return (
    <CardComponent style={styles.card}
      actions={['view', {
        key: 'renew',
        disabled: !canRenew
      }, {
          key: 'terminate',
          disabled: !canTerminate
        }]}
      title={contract.code}
      description={`${contract.roomName} - ${contract.propertyName}`}
      onActionPress={(key) => {
        if (key === 'view') {
          onViewDetails?.();
        } else if (key === 'renew' && canRenew) {
          onRenew?.();
        } else if (key === 'terminate' && canTerminate) {
          onTerminate?.();
        }
      }}
      statusBadge={CONTRACT_STATUS_BADGE[contract.status]}>

      {/* Tenant Info */}
      <View style={styles.tenantSection}>
        <View style={styles.tenantHeader}>
          <Ionicons name="person" size={16} color="#6B7280" />
          <Text style={styles.tenantName}>{tenantContract?.name}</Text>
        </View>
        <Text style={styles.tenantPhone}>📞 {formatPhoneNumber(tenantContract?.phoneNumber ?? "")}</Text>
      </View>

      {/* Contract Period */}
      <View style={styles.periodSection}>
        <View style={styles.periodHeader}>
          <Ionicons name="calendar" size={16} color="#6B7280" />
          <Text style={styles.periodHeaderText}>Thời hạn hợp đồng</Text>
        </View>
        <View style={styles.periodRow}>
          <View style={styles.periodItem}>
            <Text style={styles.periodLabel}>Bắt đầu</Text>
            <Text style={styles.periodDate}>
              {formatDate(contract.startDate)}
            </Text>
          </View>
          {contract.endDate &&
            <Ionicons name="arrow-forward" size={16} color="#6B7280" />}
          {contract.endDate && <View style={[styles.periodItem, { alignItems: 'flex-end' }]}>
            <Text style={styles.periodLabel}>Kết thúc</Text>
            <Text style={styles.periodDate}>
              {formatDate(contract.endDate ?? "")}
            </Text>
          </View>}
        </View>

        {contract.status === ContractStatus.ACTIVE && (
          <View
            style={[
              styles.remainingDays,
              daysRemaining <= 7 ? styles.urgentDays : null,
            ]}
          >
            <Text
              style={[
                styles.remainingDaysText,
                daysRemaining <= 7 ? styles.urgentDaysText : null,
              ]}
            >
              {daysRemaining > 0
                ? `Còn lại: ${daysRemaining} ngày`
                : daysRemaining === 0
                  ? "Hết hạn hôm nay"
                  : `Quá hạn: ${Math.abs(daysRemaining)} ngày`}
            </Text>
          </View>
        )}
      </View>

      {/* Financial Info */}
      <View style={styles.financialSection}>
        <View style={styles.financialHeader}>
          <Ionicons name="cash" size={16} color="#6B7280" />
          <Text style={styles.financialHeaderText}>Thông tin tài chính</Text>
        </View>
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>Tiền thuê:</Text>
          <Text style={styles.financialValue}>
            {formatCurrency(contract.rentAmountAgreed)}đ/tháng
          </Text>
        </View>
        <View style={styles.financialRow}>
          <Text style={styles.financialLabel}>Tiền cọc:</Text>
          <Text style={styles.financialValue}>
            {formatCurrency(contract.depositAmountPaid)}đ
          </Text>
        </View>
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.default,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.neutral.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  contractId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  roomInfo: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionMenu: {
    flexDirection: "row",
    gap: 4,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  renewButton: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  terminateButton: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  tenantSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tenantHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  tenantHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 6,
  },
  tenantName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
    marginLeft: 6,
  },
  tenantPhone: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 1,
  },
  tenantEmail: {
    fontSize: 13,
    color: "#6B7280",
  },
  periodSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  periodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  periodHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 6,
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  periodItem: {
    flex: 1,
    justifyContent: 'space-between',
    alignContent: 'space-between'
  },
  periodLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  periodDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  remainingDays: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  urgentDays: {
    backgroundColor: "#FEF3C7",
  },
  remainingDaysText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1D4ED8",
  },
  urgentDaysText: {
    color: "#D97706",
  },
  financialSection: {
    marginBottom: 12,
  },
  financialHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  financialHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 6,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  financialLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  financialValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
});

export default ContractCard;
