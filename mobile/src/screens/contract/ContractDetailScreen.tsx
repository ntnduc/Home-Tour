import { getContract } from '@/api/contract/contract.api';
import ActionButtonBottom from '@/components/ActionButtonBottom';
import Button from '@/components/Button';
import Card from '@/components/Card';
import DisplayField from '@/components/DisplayField';
import FormScreen from '@/components/FormScreen';
import FormSection from '@/components/FormSection';
import IconSquircle from '@/components/IconSquircle';
import ListRow from '@/components/ListRow';
import Loading from '@/components/Loading';
import NoticeBanner from '@/components/NoticeBanner';
import ScreenHeader from '@/components/ScreenHeader';
import Status from '@/components/Status';
import { CONTRACT_STATUS_OPTIONS } from '@/constant/contract.constant';
import { RootStackParamList } from '@/navigation/types';
import { uiColors, uiType } from '@/theme';
import { ContractDetailResponse, ContractStatus } from '@/types/contract';
import { formatCurrency } from '@/utils/appUtil';
import { formatDate } from '@/utils/dateUtil';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type ContractDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ContractDetail'>;
  route: { params: RootStackParamList['ContractDetail'] };
  /** Rendered inside another screen (CreateContract step) — hides the header. */
  embedded?: boolean;
};

const ContractDetailScreen = ({
  navigation,
  route,
  embedded,
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

  const withHeader = (content: React.ReactNode) =>
    embedded ? (
      content
    ) : (
      <SafeAreaView edges={[]} style={styles.screen}>
        <ScreenHeader
          title="Chi tiết hợp đồng"
          onBack={() => navigation.goBack()}
          insetTop
        />
        {content}
      </SafeAreaView>
    );

  if ((isLoading && !defaultValues) || !contract || !contract.id) {
    return withHeader(<Loading />);
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

  const footer =
    canTerminate || canRenew ? (
      <ActionButtonBottom
        actions={[
          [
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
          ],
        ]}
      />
    ) : undefined;

  const services = contract.contractServices || [];

  return withHeader(
    <FormScreen footer={footer}>
      {!contract.endDate && (
        <NoticeBanner
          tone="warning"
          message="Hợp đồng chưa xác định ngày kết thúc. Vui lòng đảm bảo hai bên đã thống nhất."
        />
      )}

      {/* Tổng quan */}
      <Card style={styles.summary}>
        <IconSquircle icon="document-text" />
        <View style={styles.flex}>
          <Text style={styles.summaryTitle} numberOfLines={1}>
            {contract.code}
          </Text>
          <Text style={uiType.caption} numberOfLines={1}>
            {contract?.room?.name} - {contract?.property?.name}
          </Text>
        </View>
        <Status value={contract.status} options={CONTRACT_STATUS_OPTIONS} />
      </Card>

      <FormSection title="Thông tin phòng" icon="bed-outline">
        <View>
          {renderRow('Phòng', contract?.room?.name)}
          {renderRow('Tòa nhà', contract?.property?.name)}
          {renderRow('Địa chỉ', contract.property?.address)}
          {renderRow('Giá thuê', `${formatCurrency(contract.rentAmountAgreed)}đ/tháng`, true)}
        </View>
      </FormSection>

      <FormSection title="Người thuê" icon="person-outline">
        <View>
          {landlordClient && (
            <>
              {renderRow('Họ và tên', landlordClient.name, true)}
              {renderRow('Số điện thoại', landlordClient?.phoneNumber ?? '-', false, 'phone')}
              {landlordClient.moveInDate &&
                renderRow('Ngày vào ở', formatDate(landlordClient.moveInDate?.toISOString()))}
              {landlordClient.moveOutDate &&
                renderRow('Ngày ra', formatDate(landlordClient.moveOutDate?.toISOString()))}
            </>
          )}
          {(contract.contractClient?.length ?? 0) > 1 &&
            renderRow('Số người ở cùng', (contract.contractClient?.length ?? 1) - 1)}
        </View>
      </FormSection>

      <FormSection title="Thời hạn hợp đồng" icon="calendar-outline">
        <View style={styles.periodRow}>
          <DisplayField
            compact
            direction="vertical"
            label="Ngày bắt đầu"
            value={formatDate(contract.startDate)}
            strong
          />
          <Ionicons name="arrow-forward" size={18} color={uiColors.textSubtle} />
          <DisplayField
            compact
            direction="vertical"
            align="end"
            label="Ngày kết thúc"
            value={contract.endDate ? formatDate(contract.endDate) : 'Không xác định'}
            strong
          />
        </View>
        {contract.status === ContractStatus.ACTIVE && daysRemaining !== null && (
          <NoticeBanner
            tone={daysRemaining <= 7 ? 'warning' : 'info'}
            icon="time-outline"
            title="Thời gian còn lại"
            message={daysRemaining > 0 ? `${daysRemaining} ngày` : 'Hết hạn hôm nay'}
          />
        )}
      </FormSection>

      <FormSection title="Thông tin thanh toán" icon="cash-outline">
        <View>
          {renderRow('Tiền thuê hàng tháng', `${formatCurrency(contract.rentAmountAgreed)}đ`, true)}
          {renderRow('Tiền cọc (đã thanh toán)', `${formatCurrency(contract.depositAmountPaid)}đ`)}
          {renderRow(
            'Ngày thu tiền hàng tháng',
            contract.paymentDueDay ? `Ngày ${contract.paymentDueDay}` : '-',
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
            {services.map((service, idx) => (
              <ListRow
                key={service.id || idx}
                divider={idx > 0}
                icon={service.isEnabled ? 'checkmark-circle' : 'close-circle'}
                iconTone={service.isEnabled ? 'success' : 'error'}
                title={service.name}
                trailing={
                  <Text style={uiType.bodyStrong}>{formatCurrency(service.price)}đ/tháng</Text>
                }
              />
            ))}
          </View>
        )}
      </FormSection>

      <FormSection title="Thông tin bổ sung" icon="information-circle-outline">
        <View>
          {renderRow('Ngày tạo', formatDate(contract.createdAt ?? ''))}
          {renderRow('Ngày cập nhật', formatDate(contract.updatedAt ?? ''))}
          {renderRow('Số người ở cùng', contract.partnerClientCount ?? 0)}
          {contract.notes && (
            <DisplayField direction="vertical" label="Ghi chú" value={contract.notes} />
          )}
        </View>
        {contract.contractScanURL && (
          <Button
            label="Xem hợp đồng đã quét"
            icon="document-text-outline"
            variant="soft"
            size="sm"
            style={styles.selfStart}
            onPress={() => {
              // TODO: Mở xem hợp đồng đã quét
              Alert.alert('Thông báo', 'Tính năng xem hợp đồng đã quét sẽ được phát triển');
            }}
          />
        )}
      </FormSection>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.canvas,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  bleed: {
    marginHorizontal: -16,
  },
  selfStart: {
    alignSelf: 'flex-start',
  },
});

export default ContractDetailScreen;
