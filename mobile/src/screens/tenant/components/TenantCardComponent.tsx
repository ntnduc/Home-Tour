import { TenantListResponse } from "@/api/tenant/tenant.api";
import Button from "@/components/Button";
import CardComponent from "@/screens/common/CardComponent";
import Chip from "@/components/Chip";
import { StatusBadgeSpec, tokens, uiType } from "@/theme";
import { formatCurrency } from "@/utils/appUtil";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TenantCardComponentProps {
  tenant: TenantListResponse;
  onPress: () => void;
  onUpdate: () => void;
}

const TenantCardComponent = ({
  tenant,
  onPress,
  onUpdate,
}: TenantCardComponentProps) => {
  const getStatusInfo = (
    status: "active" | "expired" | "pending"
  ): StatusBadgeSpec => {
    switch (status) {
      case "active":
        return {
          label: "Đang thuê",
          tone: "success",
        };
      case "expired":
        return {
          label: "Hết hạn",
          tone: "error",
        };
      case "pending":
        return {
          label: "Chờ xử lý",
          tone: "warning",
        };
      default:
        return {
          label: "Không xác định",
          tone: "warning",
        };
    }
  };

  const status = getStatusInfo(tenant.contractStatus);

  return (
    <CardComponent
      title={tenant.name}
      actions={["edit", "delete"]}
      onActionPress={(key) => {
        if (key === "edit") onUpdate();
      }}
      statusBadge={status}
      onPress={onPress}
    >
      <View style={styles.body}>
        <View style={styles.contact}>
          {!!tenant.email && <Text style={uiType.caption}>{tenant.email}</Text>}
          {!!tenant.phone && <Text style={uiType.caption}>{tenant.phone}</Text>}
        </View>

        {tenant.roomName && (
          <View style={styles.roomRow}>
            <Ionicons name="location-outline" size={14} color={tokens.colors.primary} />
            <Text style={styles.roomInfo} numberOfLines={1}>
              {tenant.propertyName} - {tenant.roomName}
            </Text>
          </View>
        )}

        <View style={styles.chips}>
          <Chip icon="cash-outline" label={`${formatCurrency(tenant.rentAmount)}đ`} />
          <Chip icon="shield-checkmark-outline" label={`${formatCurrency(tenant.depositAmount)}đ`} />
          <Chip
            icon="calendar-outline"
            label={new Date(tenant.startDate).toLocaleDateString("vi-VN")}
          />
        </View>

        <View style={styles.actionRow}>
          <Button
            label="Xem hợp đồng"
            variant="soft"
            size="sm"
            icon="document-text"
            block
            onPress={() => {
              // TODO: Navigate to contract detail
            }}
          />
          <Button
            label="Tạo hóa đơn"
            variant="successSoft"
            size="sm"
            icon="receipt"
            block
            onPress={() => {
              // TODO: Navigate to create invoice
            }}
          />
        </View>
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  body: {
    gap: 12,
  },
  contact: {
    gap: 2,
  },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  roomInfo: {
    ...uiType.bodyStrong,
    color: tokens.colors.primary,
    flex: 1,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
});

export default TenantCardComponent;
