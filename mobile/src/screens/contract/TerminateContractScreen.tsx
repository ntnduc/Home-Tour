import { deactivateContract, getContract } from "@/api/contract/contract.api";
import ActionButtonBottom from "@/components/ActionButtonBottom";
import CardContent from "@/components/CardContent";
import DisplayField from "@/components/DisplayField";
import InputBase from "@/components/Input";
import Loading from "@/components/Loading";
import { RootStackParamList } from "@/navigation/types";
import { formatCurrency } from "@/utils/appUtil";
import { formatDate } from "@/utils/dateUtil";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import { ContractTerminateRequest } from "../../types/contract";


type TerminateContractScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TerminateContract'>;
  route: { params: { contractId: string } };
};

const TerminateContractScreen = ({
  navigation,
  route,
}: TerminateContractScreenProps) => {
  const { contractId } = route.params;

  const { control, handleSubmit, setValue, setError, formState: { isLoading, defaultValues: contract, errors } } = useForm<ContractTerminateRequest>({
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

  return (
    <>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          paddingBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
        enableOnAndroid={true}
        extraScrollHeight={30}
        keyboardOpeningTime={0}
        enableAutomaticScroll={true}
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header cảnh báo */}
        <View className="bg-red-50 rounded-xl p-4 border border-red-200">
          <View className="flex-row items-start">
            <Ionicons
              name="warning"
              size={24}
              color="#DC2626"
              className="mr-3 mt-1"
            />
            <View className="flex-1">
              <Text className="text-lg font-bold text-red-800 mb-2">
                Kết thúc hợp đồng
              </Text>
              <Text className="text-sm text-red-700">
                Hành động này sẽ chuyển phòng về trạng thái trống và không thể
                hoàn tác.
              </Text>
            </View>
          </View>
        </View>

        {/* Thông tin hợp đồng */}
        <CardContent title="Thông tin hợp đồng">
          <View>
            <DisplayField strong label="Mã hợp đồng" value={contract.code} />
            <DisplayField strong label="Người thuê" value={terminateClient?.name} />
            <DisplayField label="Phòng" value={contract.room?.name} />
            <DisplayField label="Thời hạn" value={`${formatDate(contract.startDate ?? "")} - ${formatDate(contract.endDate ?? "")}`} />
            <DisplayField label="Tiền thuê" value={`${formatCurrency(contract.rentAmountAgreed ?? 0)} đ/tháng`} />
          </View>
        </CardContent>

        {/* Thông tin hoàn trả */}
        <View className="bg-blue-50 rounded-xl p-4 mb-3 border border-blue-200">
          <Text className="text-lg font-bold text-blue-800 mb-4">
            Thông tin hoàn trả
          </Text>

          <View className="space-y-3">
            <DisplayField
              label="Tiền cọc"
              value={formatCurrency(contract.depositAmountPaid ?? 0)}
              labelClassName="text-base text-blue-700"
              valueClassName="text-base font-semibold text-blue-800"
            />
            {contract.contractServices && contract.contractServices.length > 0 && <DisplayField
              label="Dịch vụ đã trả"
              value={formatCurrency(
                contract.contractServices
                  .filter((service) => service?.isEnabled)
                  .reduce((sum, service) => sum + Number(service?.price), 0)
              )}
              labelClassName="text-base text-blue-700"
              valueClassName="text-base font-semibold text-blue-800" />}

            <View className="border-t border-blue-200 pt-3">
              {contract.depositAmountPaid && contract.contractServices && contract.contractServices.length > 0 && <DisplayField
                label="Tổng hoàn trả"
                value={formatCurrency(
                  contract.depositAmountPaid +
                  contract.contractServices
                    .filter((service) => service?.isEnabled)
                    .reduce((sum, service) => sum + Number(service?.price), 0)
                )}
                labelClassName="text-base font-semibold text-blue-800"
                valueClassName="text-lg font-bold text-blue-600" />}
            </View>
          </View>

          <View className="mt-3 p-3 bg-blue-100 rounded-lg">
            <Text className="text-xs text-blue-800">
              💡 Lưu ý: Số tiền hoàn trả sẽ được tính toán dựa trên thời gian sử
              dụng thực tế và tình trạng phòng.
            </Text>
          </View>
        </View>

        {/* Lý do kết thúc */}
        <CardContent title={<Text className="text-lg font-bold text-gray-900 mb-4">
          Lý do kết thúc
          <Text style={{ color: "#ff3b30" }}> * </Text>
        </Text>}>
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
        </CardContent>



        {/* Các lý do phổ biến */}
        <CardContent title='Lý do phổ biến'>
          <View className="flex flex-col gap-2">
            {[
              "Hết hạn hợp đồng",
              "Người thuê tự ý chấm dứt",
              "Vi phạm quy định thuê",
              "Bảo trì, sửa chữa phòng",
              "Thay đổi mục đích sử dụng",
              "Khác",
            ].map((reason, index) => (
              <TouchableOpacity
                key={index}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                onPress={() => setValue('reason', reason)}
              >
                <Text className="text-sm text-gray-700">{reason}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </CardContent>
        {/* <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Lý do phổ biến
          </Text>

          
        </View> */}
      </KeyboardAwareScrollView>

      <ActionButtonBottom
        actions={[{
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
        }]}
      />
    </>
  );
};

export default TerminateContractScreen;
