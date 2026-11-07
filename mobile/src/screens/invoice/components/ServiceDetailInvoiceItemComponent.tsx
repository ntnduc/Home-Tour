import { tokens, uiColors, uiType, uiWeight } from "@/theme";
import {
  SERVICE_CALCULATE_METHOD_WITH_INFO,
  ServiceCalculateMethod,
} from "@/constant/service.constant";
import { InvoiceItemCreateRequest } from "@/types/invoice.item";
import { formatCurrency } from "@/utils/appUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type ServiceViewInvoiceItemProps = {
  data: InvoiceItemCreateRequest;
  isLast?: boolean;
};

/**
 * Read-only service line (invoice detail / confirm screens).
 *
 * ```
 * ✓ Điện                      Số lượng    Thành tiền
 *   3.500 đ/kWh                  120       420.000đ
 *   80 → 200                                       (hairline between rows)
 * ```
 */
const ServiceDetailInvoiceItemComponent = ({
  data,
  isLast = false,
}: ServiceViewInvoiceItemProps) => {
  const item = data;
  const method = item.calculationMethod as ServiceCalculateMethod;
  const methodInfo = SERVICE_CALCULATE_METHOD_WITH_INFO[method];

  const quantity = useMemo(() => {
    switch (method) {
      case ServiceCalculateMethod.PER_UNIT_SIMPLE:
        return Math.max(
          0,
          (Number(item.helperValue) ?? 0) -
            (Number(item.newHelperValue) ?? Number(item.oldHelperValue) ?? 0),
        );
      case ServiceCalculateMethod.FIXED_PER_PERSON:
        return Number(item.helperValue) ?? 0;
      case ServiceCalculateMethod.FIXED_PER_NUMBER:
        return Number(item.helperValue) ?? 0;
      default:
        return 1;
    }
  }, [item.newHelperValue, item.oldHelperValue, method]);

  const unitLabel = useMemo(() => {
    if (method === ServiceCalculateMethod.PER_UNIT_SIMPLE) {
      return `/${methodInfo?.unit || "đơn vị"}`;
    }
    if (method === ServiceCalculateMethod.FIXED_PER_PERSON) {
      return `/${methodInfo?.unit || "người"}`;
    }
    return "/tháng";
  }, [method, methodInfo?.unit]);

  return (
    <View style={[styles.row, !isLast && styles.divider]}>
      <View style={styles.main}>
        <Ionicons
          name="checkmark-circle"
          size={18}
          color={tokens.colors.success}
        />
        <View style={styles.mainText}>
          <Text style={uiType.bodyStrong} numberOfLines={1}>
            {item.name || "Dịch vụ"}
          </Text>
          <Text style={styles.unitPrice}>
            {formatCurrency((item.amount || 0).toString())} đ{unitLabel}
          </Text>

          {method === ServiceCalculateMethod.PER_UNIT_SIMPLE && (
            <Text style={uiType.caption}>
              {item.newHelperValue ?? item.oldHelperValue ?? 0} →{" "}
              {item.helperValue ?? 0}
            </Text>
          )}

          {method === ServiceCalculateMethod.FIXED_PER_ROOM && (
            <Text style={uiType.caption}>Tính theo phòng</Text>
          )}
        </View>
      </View>

      <View style={styles.quantity}>
        <Text style={uiType.caption}>Số lượng</Text>
        <Text style={styles.quantityValue}>{quantity}</Text>
      </View>

      <View style={styles.total}>
        <Text style={uiType.caption}>Thành tiền</Text>
        <Text style={uiType.bodyStrong}>
          {formatCurrency(item.totalAmount?.toString() || "0")}đ
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: uiColors.hairline,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  mainText: {
    flex: 1,
    gap: 2,
  },
  unitPrice: {
    ...uiType.caption,
    color: tokens.colors.info,
    fontWeight: uiWeight.semibold,
  },
  quantity: {
    width: 72,
    alignItems: "center",
    gap: 2,
  },
  quantityValue: {
    ...uiType.bodyStrong,
    fontSize: 16,
  },
  total: {
    width: 104,
    alignItems: "flex-end",
    gap: 2,
  },
});

export default ServiceDetailInvoiceItemComponent;
