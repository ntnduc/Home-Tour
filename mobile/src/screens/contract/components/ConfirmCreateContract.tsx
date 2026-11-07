import { createContract } from "@/api/contract/contract.api";
import Card from "@/components/Card";
import DisplayField from "@/components/DisplayField";
import FormScreen from "@/components/FormScreen";
import FormSection from "@/components/FormSection";
import IconSquircle from "@/components/IconSquircle";
import ListRow from "@/components/ListRow";
import NoticeBanner from "@/components/NoticeBanner";
import {
  SERVICE_CALCULATE_METHOD_WITH_INFO,
  ServiceCalculateMethod,
} from "@/constant/service.constant";
import { RootStackParamList } from "@/navigation/types";
import { uiColors, uiType } from "@/theme";
import {
  ContractCreateRequest,
  ContractDetailResponse,
} from "@/types/contract";
import { formatCurrency } from "@/utils/appUtil";
import { formatDate } from "@/utils/dateUtil";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

export interface ConfirmCreateContractRef {
  confirm: () => Promise<boolean>;
}

interface ConfirmCreateContractProps {
  navigation: NativeStackNavigationProp<RootStackParamList, "CreateContract">;
  contract: ContractCreateRequest;
  room: string;
  propertyName: string;
  onNextStep?: (data: ContractDetailResponse) => void;
  onPreviousStep: () => void;
}

const ConfirmCreateContract = forwardRef<
  ConfirmCreateContractRef,
  ConfirmCreateContractProps
>(
  (
    { navigation, contract, room, propertyName, onPreviousStep, onNextStep },
    ref,
  ) => {
    const depositTotal = useMemo(() => {
      return contract.depositAmountPaid || 0;
    }, [contract.depositAmountPaid]);

    useImperativeHandle(
      ref,
      () => ({
        confirm: async () => {
          try {
            const partnerClients = (contract.contractClient ?? []).map(
              (client) => ({
                ...client,
                isLandlordClient: false,
              }),
            );

            const postData: ContractCreateRequest = {
              ...contract,
              contractClient: [
                ...partnerClients,
                {
                  ...contract.contractClientLandlord,
                  isLandlordClient: true,
                },
              ],
            };

            const response = await createContract(postData);
            if (response.success && response.data) {
              Toast.show({
                type: "success",
                text1: "Thành công",
                text2: "Tạo hợp đồng thành công",
              });
              onNextStep?.(response.data);
              return true;
            }

            Toast.show({
              type: "error",
              text1: "Tạo hợp đồng thất bại, vui lòng thử lại.",
            });
            return false;
          } catch (error: any) {
            Toast.show({
              type: "error",
              text1: "Lỗi",
              text2: error?.response?.data?.message ?? "Tạo hợp đồng thất bại!",
            });
            return false;
          }
        },
      }),
      [contract, navigation, onNextStep],
    );

    const renderRow = (
      label: string,
      value?: string | number,
      strong?: boolean,
    ) => <DisplayField label={label} value={value} strong={strong} />;

    const services = contract.contractServices || [];

    return (
      <FormScreen>
        <Card style={styles.summary}>
          <IconSquircle icon="checkmark-done" tone="success" />
          <View style={styles.flex}>
            <Text style={styles.summaryTitle}>Xác nhận tạo hợp đồng</Text>
            <Text style={uiType.caption}>
              Kiểm tra kỹ các thông tin trước khi xác nhận
            </Text>
          </View>
        </Card>

        {!contract.endDate && (
          <NoticeBanner
            tone="warning"
            message="Hợp đồng chưa xác định ngày kết thúc. Vui lòng đảm bảo hai bên đã thống nhất."
          />
        )}

        <FormSection title="Thông tin phòng" icon="bed-outline">
          <View>
            {renderRow("Phòng", room || "-")}
            {renderRow("Tòa nhà", propertyName || "-")}
          </View>
        </FormSection>

        <FormSection title="Người thuê" icon="person-outline">
          <View>
            {renderRow(
              "Họ và tên",
              contract.contractClientLandlord.name || "-",
              true,
            )}
            {renderRow(
              "Số điện thoại",
              contract.contractClientLandlord.phoneNumber || "-",
            )}
            {renderRow(
              "CCCD/CMND",
              contract.contractClientLandlord.idCardNumber || "-",
            )}
            {renderRow("Số người ở cùng", contract.partnerClientCount ?? 0)}
          </View>
        </FormSection>

        <FormSection title="Thời hạn hợp đồng" icon="calendar-outline">
          <View style={styles.periodRow}>
            <DisplayField
              compact
              direction="vertical"
              label="Ngày bắt đầu"
              value={contract.startDate ? formatDate(contract.startDate) : "-"}
              strong
            />
            <Ionicons
              name="arrow-forward"
              size={18}
              color={uiColors.textSubtle}
            />
            <DisplayField
              compact
              direction="vertical"
              align="end"
              label="Ngày kết thúc"
              value={
                contract.endDate
                  ? formatDate(contract.endDate)
                  : "Không xác định"
              }
              strong
            />
          </View>
        </FormSection>

        <FormSection title="Thông tin thanh toán" icon="cash-outline">
          <View>
            {renderRow(
              "Tiền thuê hàng tháng",
              `${formatCurrency((contract.rentAmountAgreed || 0).toString())}đ`,
              true,
            )}
            {renderRow(
              "Tiền cọc (thanh toán ban đầu)",
              `${formatCurrency((depositTotal || 0).toString())}đ`,
            )}
            {renderRow(
              "Ngày thu tiền hàng tháng",
              contract.paymentDueDay ? `Ngày ${contract.paymentDueDay}` : "-",
            )}
          </View>
        </FormSection>

        <FormSection
          title="Dịch vụ áp dụng"
          icon="flash-outline"
          caption="Các dịch vụ được tính cùng tiền phòng"
        >
          {services.length === 0 ? (
            <Text style={uiType.caption}>Chưa có dịch vụ nào</Text>
          ) : (
            <View style={styles.bleed}>
              {services.map((service, idx) => {
                const method =
                  service.calculationMethod as ServiceCalculateMethod;
                const methodInfo = SERVICE_CALCULATE_METHOD_WITH_INFO[method];
                return (
                  <ListRow
                    key={`${service.serviceId || idx}`}
                    divider={idx > 0}
                    icon={
                      service.isEnabled ? "checkmark-circle" : "close-circle"
                    }
                    iconTone={service.isEnabled ? "success" : "error"}
                    title={service.name || "Dịch vụ"}
                    subtitle={`${methodInfo?.label || "Phương thức"}${
                      service.helperValue
                        ? ` · SL: ${service.helperValue} ${methodInfo?.unit || ""}`
                        : ""
                    }`}
                    trailing={
                      <View style={styles.priceCol}>
                        <Text style={uiType.bodyStrong}>
                          {formatCurrency((service.price || 0).toString())}đ
                        </Text>
                        <Text style={uiType.caption}>
                          {method === ServiceCalculateMethod.PER_UNIT_SIMPLE
                            ? "/đơn vị"
                            : "/tháng"}
                        </Text>
                      </View>
                    }
                  />
                );
              })}
            </View>
          )}
        </FormSection>

        <FormSection title="Điều khoản bổ sung" icon="document-text-outline">
          <Text style={uiType.body}>
            {contract.notes ?? "Không có điều khoản bổ sung"}
          </Text>
        </FormSection>
      </FormScreen>
    );
  },
);

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryTitle: {
    ...uiType.section,
    lineHeight: 24,
  },
  flex: {
    flex: 1,
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  bleed: {
    marginHorizontal: -16,
  },
  priceCol: {
    alignItems: "flex-end",
  },
});

ConfirmCreateContract.displayName = "ConfirmCreateContract";

export default ConfirmCreateContract;
