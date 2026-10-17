import { deactivateContract, getContract } from "@/api/contract/contract.api";
import ActionButtonBottom from "@/components/ActionButtonBottom";
import Chip from "@/components/Chip";
import DisplayField from "@/components/DisplayField";
import FormScreen from "@/components/FormScreen";
import FormSection from "@/components/FormSection";
import InputBase from "@/components/Input";
import Loading from "@/components/Loading";
import NoticeBanner from "@/components/NoticeBanner";
import { tokens } from "@/theme";
import { RootStackParamList } from "@/navigation/types";
import { formatCurrency } from "@/utils/appUtil";
import { formatDate } from "@/utils/dateUtil";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { ContractTerminateRequest } from "../../types/contract";


const COMMON_REASONS = [
  'Hết hạn hợp đồng',
  'Người thuê tự ý chấm dứt',
  'Vi phạm quy định thuê',
  'Bảo trì, sửa chữa phòng',
  'Thay đổi mục đích sử dụng',
  'Khác',
];

type TerminateContractScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TerminateContract'>;
  route: { params: { contractId: string } };
};

const TerminateContractScreen = ({
  navigation,
  route,
}: TerminateContractScreenProps) => {
  const { contractId } = route.params;

  const { control, handleSubmit, setValue, setError, watch, formState: { isLoading, defaultValues: contract, errors } } = useForm<ContractTerminateRequest>({
    defaultValues: async () => {
      const response = await getContract(contractId);
      if (response.success && response.data) {
        return response.data;
      }
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: response.message ?? 'Không thể tải thông tin hợp đồng',
      });
      navigation.goBack();
      return {} as ContractTerminateRequest;
    },
  });


  const handleTerminate = async (data: ContractTerminateRequest) => {
    if (!data.reason) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập lý do kết thúc hợp đồng',
      });
      setError("reason", { message: 'Vui lòng nhập lý do kết thúc hợp đồng' });
      return;
    }

    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn kết thúc hợp đồng?', [{ text: 'Cancel', style: 'cancel' }, {
      text: 'OK', style: 'destructive', onPress: () => {
        deactivateContract(data.id, data.reason ?? "")
          .then(() => { })
          .finally(() => {
            Toast.show({
              type: 'success',
              text1: 'Thành công',
              text2: 'Đã kết thúc hợp đồng thành công!',
            });
            navigation.goBack();
          });
      }
    }]);
    return;

    // deactivateContract(data.id, data.reason)
    //   .then(() => { })
    //   .finally(() => {
    //     Toast.show({
    //       type: 'success',
    //       text1: 'Thành công',
    //       text2: 'Đã kết thúc hợp đồng thành công!',
    //     });
    //     navigation.goBack();
    //   });
  }


  if (isLoading || !contract) {
    return <Loading />;
  }

  const terminateClient = contract.contractClient?.findLast(client => client?.isLandlordClient && client.isActiveInContract);

  const enabledServicesTotal = (contract.contractServices ?? [])
    .filter((service) => service?.isEnabled)
    .reduce((sum, service) => sum + Number(service?.price), 0);
  const hasServices = (contract.contractServices?.length ?? 0) > 0;
  const reason = watch('reason');

  return (
    <FormScreen
      footer={
        <ActionButtonBottom
          actions={[
            {
              label: 'Kết thúc hợp đồng',
              icon: 'checkmark-circle',
              variant: 'danger',
              onPress: handleSubmit(handleTerminate, () => {
                Toast.show({
                  type: 'error',
                  text1: 'Lỗi',
                  text2: 'Vui lòng nhập lý do kết thúc hợp đồng',
                });
              }),
            },
          ]}
        />
      }
    >
      <NoticeBanner
        tone="error"
        icon="warning"
        title="Kết thúc hợp đồng"
        message="Hành động này sẽ chuyển phòng về trạng thái trống và không thể hoàn tác."
      />

      <FormSection title="Thông tin hợp đồng" icon="document-text-outline">
        <View>
          <DisplayField strong label="Mã hợp đồng" value={contract.code} />
          <DisplayField strong label="Người thuê" value={terminateClient?.name} />
          <DisplayField label="Phòng" value={contract.room?.name} />
          <DisplayField
            label="Thời hạn"
            value={`${formatDate(contract.startDate ?? '')} - ${formatDate(contract.endDate ?? '')}`}
          />
          <DisplayField
            compact
            label="Tiền thuê"
            value={`${formatCurrency(contract.rentAmountAgreed ?? 0)}đ/tháng`}
          />
        </View>
      </FormSection>

      <FormSection title="Thông tin hoàn trả" icon="wallet-outline" iconTone="info">
        <View>
          <DisplayField label="Tiền cọc" value={`${formatCurrency(contract.depositAmountPaid ?? 0)}đ`} />
          {hasServices && (
            <DisplayField label="Dịch vụ đã trả" value={`${formatCurrency(enabledServicesTotal)}đ`} />
          )}
          {!!contract.depositAmountPaid && hasServices && (
            <DisplayField
              compact
              strong
              label="Tổng hoàn trả"
              value={`${formatCurrency(contract.depositAmountPaid + enabledServicesTotal)}đ`}
              valueStyle={styles.total}
            />
          )}
        </View>
        <NoticeBanner
          tone="info"
          icon="bulb-outline"
          message="Số tiền hoàn trả sẽ được tính toán dựa trên thời gian sử dụng thực tế và tình trạng phòng."
        />
      </FormSection>

      <FormSection title="Lý do kết thúc" icon="create-outline" caption="Bắt buộc · chọn nhanh hoặc tự nhập">
        <View style={styles.reasons}>
          {COMMON_REASONS.map((item) => (
            <Chip
              key={item}
              label={item}
              variant="outline"
              selected={reason === item}
              onPress={() => setValue('reason', item)}
            />
          ))}
        </View>
        <Controller
          control={control}
          name="reason"
          render={({ field: { onChange, value } }) => (
            <InputBase
              required
              type="area"
              placeholder="Lý do kết thúc"
              value={value}
              onChangeText={onChange}
              showClear={false}
              error={errors.reason?.message}
            />
          )}
        />
      </FormSection>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  reasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  total: {
    fontSize: 16,
    color: tokens.colors.primary,
  },
});

export default TerminateContractScreen;
