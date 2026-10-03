import { getContract } from '@/api/contract/contract.api';
import ActionButtonBottom from '@/components/ActionButtonBottom';
import DisplayField from '@/components/DisplayField';
import Loading from '@/components/Loading';
import Status from '@/components/Status';
import { CONTRACT_STATUS_OPTIONS } from '@/constant/contract.constant';
import { RootStackParamList } from '@/navigation/types';
import CardComponent from '@/screens/common/CardComponent';
import { ContractDetailResponse, ContractStatus } from '@/types/contract';
import { formatCurrency } from '@/utils/appUtil';
import { formatDate } from '@/utils/dateUtil';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';

type ContractDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ContractDetail'>;
  route: { params: RootStackParamList['ContractDetail'] };
};

const ContractDetailScreen = ({
  navigation,
  route,
}: ContractDetailScreenProps) => {
  const { contractId } = route.params;
  const [isLoading, setIsLoading] = useState(true);

  const {
    watch,
    formState: { defaultValues },
    reset
  } = useForm<ContractDetailResponse>({
    defaultValues: {} as ContractDetailResponse
  });

  const fetchData = useCallback(async () => {
    if (!contractId) {
      return {} as ContractDetailResponse;
    }
    try {
      const response = await getContract(contractId);
      if (response.success && response.data) {
        reset(response.data);
        return;
      }

      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: response.message ?? 'Không thể tải thông tin hợp đồng',
      });
      navigation.goBack();
    } catch (error: any) {
      console.error('Error fetching contract detail:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2:
          error.response?.data?.message ?? 'Không thể tải thông tin hợp đồng',
      });
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }

    return {} as ContractDetailResponse;
  }, [contractId, reset]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const contract = watch() as ContractDetailResponse | undefined;

  const getDaysRemaining = () => {
    if (!contract?.endDate) return null;
    const today = new Date();
    const endDate = new Date(contract.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleTerminateContract = () => {
    if (!contract) return;
    navigation.navigate('TerminateContract', { contractId: contract.id });
    return;

    // const landlordClient = contract.contractClient?.find(
    //   (client) => client.isActiveInContract,
    // );
    // Alert.prompt(
    //   'Xác nhận kết thúc hợp đồng',
    //   `Bạn có chắc chắn muốn kết thúc hợp đồng với ${landlordClient?.name || 'người thuê'}?\nHành động này sẽ chuyển phòng về trạng thái trống.
    //   \nLý do kết thúc:`,
    //   async (text: string) => {
    //     if (!text.trim()) {
    //       Toast.show({
    //         type: 'error',
    //         text1: 'Lỗi',
    //         text2: 'Vui lòng nhập lý do kết thúc hợp đồng',
    //       });
    //       return;
    //     }

    //     deactivateContract(contract.id, text)
    //       .then(() => { })
    //       .finally(() => {
    //         Toast.show({
    //           type: 'success',
    //           text1: 'Thành công',
    //           text2: 'Đã kết thúc hợp đồng thành công!',
    //         });
    //         navigation.goBack();
    //       });
    //   },
    // );
  };

  const handleRenewContract = () => {
    Alert.alert(
      'Gia hạn hợp đồng',
      'Tính năng gia hạn hợp đồng sẽ được phát triển trong phiên bản tiếp theo.',
      [{ text: 'OK' }],
    );
  };

  const renderRow = (
    label: string,
    value?: string | number | React.ReactNode,
    strong?: boolean,
    type: 'text' | 'phone' = 'text',
  ) => <DisplayField label={label} value={value} strong={strong} type={type} />;

  if (isLoading && !defaultValues) {
    return <Loading />;
  }

  if (!contract || !contract.id) {
    return <Loading />;
  }

  const landlordClient = contract.contractClient?.find(
    (client) => client.isActiveInContract,
  );
  const canTerminate = contract.status === ContractStatus.ACTIVE;
  const daysRemaining = getDaysRemaining();
  const canRenew =
    contract.status === ContractStatus.ACTIVE &&
    daysRemaining !== null &&
    daysRemaining <= 30;

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
        {/* Cảnh báo nếu không có ngày kết thúc */}
        {!contract.endDate && (
          <View className="flex-row items-center w-full bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <Ionicons name="alert-circle-outline" size={18} color="#CA8A04" />
            <Text className="text-sm text-yellow-700 ml-2 flex-1">
              Hợp đồng chưa xác định ngày kết thúc. Vui lòng đảm bảo hai bên đã
              thống nhất.
            </Text>
          </View>
        )}

        {/* Header tổng quan */}
        <CardComponent>
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                Mã: {contract.code}
              </Text>
              <Text className="text-sm text-gray-600">
                {contract?.room?.name} - {contract?.property?.name}
              </Text>
            </View>
            <Status value={contract.status} options={CONTRACT_STATUS_OPTIONS} />
          </View>
        </CardComponent>

        {/* Phòng & Tòa nhà */}
        <CardComponent title="Thông tin phòng">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              {renderRow('Phòng', contract?.room?.name)}
              {renderRow('Tòa nhà', contract?.property?.name)}
              {renderRow('Địa chỉ', contract.property?.address)}
              {renderRow(
                'Giá thuê',
                `${formatCurrency(contract.rentAmountAgreed)} đ/tháng`,
              )}
            </View>
            <View className="items-end"></View>
          </View>
        </CardComponent>

        {/* Người thuê chính */}
        <CardComponent title="Người thuê">
          <View>
            {landlordClient && (
              <>
                {renderRow('Họ và tên', landlordClient.name)}
                {renderRow(
                  'Số điện thoại',
                  landlordClient?.phoneNumber ?? '-',
                  false,
                  'phone',
                )}
                {/* {landlordClient?.client?.email &&
                  renderRow('Email', landlordClient?.client?.email)} */}
                {landlordClient.moveInDate &&
                  renderRow(
                    'Ngày vào ở',
                    formatDate(landlordClient.moveInDate?.toISOString()),
                  )}
                {landlordClient.moveOutDate &&
                  renderRow(
                    'Ngày ra',
                    formatDate(landlordClient.moveOutDate?.toISOString()),
                  )}
              </>
            )}
            {(contract.contractClient?.length ?? 0) > 1 && (
              <View className="mt-2 pt-2 border-t border-gray-200">
                <Text className="text-sm text-gray-600 mb-1">
                  Số người ở cùng: {(contract.contractClient?.length ?? 1) - 1}
                </Text>
              </View>
            )}
          </View>
        </CardComponent>

        {/* Thời hạn hợp đồng */}
        <CardComponent title="Thời hạn hợp đồng">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-1">
              <DisplayField
                label="Ngày bắt đầu"
                containerClassName="items-start mb-0"
                value={formatDate(contract.startDate)}
                direction="vertical"
                strong
              />
            </View>
            <Ionicons name="arrow-forward" size={20} color="#6B7280" />
            <View className="flex-1 items-end">
              <DisplayField
                label="Ngày kết thúc"
                containerClassName="justify-end items-end mb-0"
                value={
                  contract.endDate
                    ? formatDate(contract.endDate)
                    : 'Không xác định'
                }
                direction="vertical"
                strong
              />
            </View>
          </View>

          {contract.status === ContractStatus.ACTIVE &&
            daysRemaining !== null && (
              <View
                className={`rounded-lg p-3 border ${daysRemaining <= 7
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
                  }`}
              >
                <Text
                  className={`text-sm font-semibold mb-1 ${daysRemaining <= 7 ? 'text-yellow-800' : 'text-blue-800'
                    }`}
                >
                  Thời gian còn lại:
                </Text>
                <Text
                  className={`text-base font-bold ${daysRemaining <= 7 ? 'text-yellow-600' : 'text-blue-600'
                    }`}
                >
                  {daysRemaining > 0
                    ? `${daysRemaining} ngày`
                    : 'Hết hạn hôm nay'}
                </Text>
              </View>
            )}
        </CardComponent>

        {/* Thanh toán */}
        <CardComponent title="Thông tin thanh toán">
          <View>
            {renderRow(
              'Tiền thuê hàng tháng',
              `${formatCurrency(contract.rentAmountAgreed)}đ`,
              true,
            )}
            {renderRow(
              'Tiền cọc (đã thanh toán)',
              `${formatCurrency(contract.depositAmountPaid)}đ`,
            )}
            <View className="h-[1px] bg-gray-200 my-2" />
            {renderRow(
              'Ngày thu tiền hàng tháng',
              contract.paymentDueDay ? `Ngày ${contract.paymentDueDay}` : '-',
            )}
          </View>
        </CardComponent>

        {/* Dịch vụ */}
        <CardComponent
          title="Dịch vụ áp dụng"
          description="Các dịch vụ được tính cùng tiền phòng"
        >
          {(contract.contractServices || []).length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center mb-2">
                <Ionicons name="construct-outline" size={22} color="#9CA3AF" />
              </View>
              <Text className="text-gray-500">Chưa có dịch vụ nào</Text>
            </View>
          ) : (
            <View className="flex flex-col">
              {(contract.contractServices || []).map((service, idx) => {
                return (
                  <View
                    key={service.id || idx}
                    className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  >
                    <View className="flex-row items-center flex-1">
                      <Ionicons
                        name={
                          service.isEnabled
                            ? 'checkmark-circle'
                            : 'close-circle'
                        }
                        size={18}
                        color={service.isEnabled ? '#34C759' : '#FF3B30'}
                      />
                      <View className="ml-2 flex-1">
                        <Text className="text-base font-medium text-gray-900">
                          {service.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          {/* <Ionicons
                              name={service.service.icon as any}
                              size={14}
                              color="#9CA3AF"
                            /> */}
                          {/* <Text className="text-xs text-gray-500 ml-1">
                            {formatCurrency(service.price)}đ/tháng
                          </Text> */}
                        </View>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-semibold text-gray-900">
                        {formatCurrency(service.price)} đ/tháng
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </CardComponent>

        {/* Thông tin bổ sung */}
        <CardComponent title="Thông tin bổ sung">
          <View>
            {renderRow('Ngày tạo', formatDate(contract.createdAt ?? ""))}
            {renderRow('Ngày cập nhật', formatDate(contract.updatedAt ?? ""), true)}
            {renderRow('Số người ở cùng', contract.partnerClientCount ?? 0)}
            {contract.notes && (
              <View className="mt-2 pt-2 border-t border-gray-200">
                <Text className="text-sm text-gray-600 mb-1">Ghi chú</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {contract.notes}
                </Text>
              </View>
            )}
            {contract.contractScanURL && (
              <View className="mt-2 pt-2 border-t border-gray-200">
                <Text className="text-sm text-gray-600 mb-1">
                  Hợp đồng đã quét
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    // TODO: Mở xem hợp đồng đã quét
                    Alert.alert(
                      'Thông báo',
                      'Tính năng xem hợp đồng đã quét sẽ được phát triển',
                    );
                  }}
                  className="flex-row items-center mt-1"
                >
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color="#3B82F6"
                  />
                  <Text className="text-sm text-blue-600 ml-1">
                    Xem hợp đồng
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </CardComponent>
      </KeyboardAwareScrollView>

      {/* Action Buttons */}
      {(canTerminate || canRenew) && (
        <ActionButtonBottom
          actions={[
            ...(canRenew
              ? [
                {
                  label: 'Gia hạn',
                  icon: 'refresh' as keyof typeof Ionicons.glyphMap,
                  variant: 'success' as const,
                  onPress: handleRenewContract,
                },
              ]
              : []),
            ...(canTerminate
              ? [
                {
                  label: 'Kết thúc hợp đồng',
                  icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
                  variant: 'danger' as const,
                  onPress: handleTerminateContract,
                },
              ]
              : []),
          ]}
        />
      )}
    </>
  );
};

export default ContractDetailScreen;
