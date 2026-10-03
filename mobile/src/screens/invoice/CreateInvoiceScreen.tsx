import { getContract } from '@/api/contract/contract.api';
import ActionButtonBottom from '@/components/ActionButtonBottom';
import { ComboBox } from '@/components/ComboBox';
import DatePicker from '@/components/DatePicker';
import DisplayField from '@/components/DisplayField';
import Input from '@/components/Input';
import Loading from '@/components/Loading';
import { ServiceCalculateMethod } from '@/constant/service.constant';
import { RootStackParamList } from '@/navigation/types';
import { ContractDetailResponse } from '@/types/contract';
import { InvoiceCreateRequest, InvoiceStatus } from '@/types/invoice';
import {
  InvoiceItemCreateRequest,
  InvoiceItemType,
} from '@/types/invoice.item';
import { formatCurrency } from '@/utils/appUtil';
import { getCurrentDate, getNextMonthDate } from '@/utils/dateUtil';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import CardComponent from '../common/CardComponent';
import ServiceInvoiceItem from './components/ServiceInvoiceItem';

type CreateInvoiceScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateInvoice'>;
  route: { params: RootStackParamList['CreateInvoice'] };
};

const CreateInvoiceScreen = ({
  navigation,
  route,
}: CreateInvoiceScreenProps) => {
  const { contractId, roomId } = route.params || {};

  const methods = useForm<InvoiceCreateRequest>({
    defaultValues: async () => {
      const response = await getContract(contractId || '');
      if (!response.success && !response.data) {
        if (response.message) {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: response.message ?? 'Không thể tải thông tin hợp đồng',
          });
        }
        navigation.goBack();
        return {} as InvoiceCreateRequest;
      }

      const contract = response.data as ContractDetailResponse;
      // Check date payment default is valid
      const currentDate = getCurrentDate();
      const maxDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0,
      ).getDate();
      let dueDate = new Date(
        currentDate.setDate(
          contract.paymentDueDay && contract.paymentDueDay <= maxDayOfMonth
            ? contract.paymentDueDay
            : maxDayOfMonth,
        ),
      );

      dueDate = dueDate < getCurrentDate() ? getCurrentDate() : dueDate;

      const itemRoomRent: InvoiceItemCreateRequest = {
        name: 'Tiền phòng',
        amount: contract.rentAmountAgreed,
        totalAmount: contract.rentAmountAgreed,
        type: InvoiceItemType.ROOM_RENT,
        propertyId: contract.propertyId,
        helperValue: undefined,
        oldHelperValue: undefined,
        newHelperValue: undefined,
        isUpdated: false,
      };

      const invoiceDetail: InvoiceCreateRequest = {
        contractId: contract.id,
        propertyId: contract.propertyId,
        roomName: contract?.room?.name || '',
        roomId: contract.roomId,
        billingPeriodStart: getCurrentDate(),
        billingPeriodEnd: getNextMonthDate(),
        dueDate: dueDate,
        clientName:
          contract.contractClient.find((c) => c.isLandlordClient)?.name || '',
        notes: '',
        isPrepaid: false,
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
        invoiceItems: [itemRoomRent, ...contract.contractServices?.map((serivceItem) => ({
          name: serivceItem.name,
          amount: serivceItem.price || 0,
          type: InvoiceItemType.SERVICE_FEE,
          propertyId: contract.roomId,
          oldHelperValue: serivceItem.helperValue || 0,
          newHelperValue: serivceItem.helperValue || 0,
          helperValue: serivceItem.calculationMethod === ServiceCalculateMethod.PER_UNIT_SIMPLE ? 0 : serivceItem.helperValue || 0,
          isUpdated: false,
          contractServiceId: serivceItem.id,
          calculationMethod: serivceItem.calculationMethod,
        }))],
        paymentMonth: getCurrentDate().getMonth() + 1,
        status: InvoiceStatus.DRAFT,
      };
      return invoiceDetail;
    },
  });

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isLoading },
  } = methods;

  const invoiceItems = watch('invoiceItems') as InvoiceItemCreateRequest[];

  const handleSave = async (data: InvoiceCreateRequest) => {
    // Navigate to confirm screen with invoice data
    navigation.navigate('ConfirmCreateInvoice', {
      invoice: data as InvoiceCreateRequest,
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          padding: 16,
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
        className="gap-y-4"
      >
        <FormProvider {...methods}>
          <CardComponent title="Thông tin hợp đồng">
            <Controller
              control={control}
              name={'roomName'}
              render={({ field: { onChange, value } }) => (
                <DisplayField label="Phòng" value={value} strong />
              )}
            />
            <Controller
              control={control}
              name={'clientName'}
              render={({ field: { onChange, value } }) => (
                <DisplayField label="Người thuê" value={value} />
              )}
            />
          </CardComponent>

          <CardComponent title="Thông tin thanh toán">
            <View className="gap-y-3">
              <Controller
                control={control}
                name={'invoiceItems.0.amount'}
                rules={{ required: 'Vui lòng nhập tiền phòng' }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Input
                    label="Tiền phòng"
                    value={formatCurrency(value?.toString() ?? 0)}
                    error={error?.message}
                    onChangeText={onChange}
                    type="number"
                    keyboardType="numeric"
                    returnKeyType="done"
                    returnKeyLabel="Xong"
                    required
                    showClear={false}
                  />
                )}
              />

              <Controller
                control={control}
                rules={{ required: 'Vui lòng chọn tháng thanh toán' }}
                name={'paymentMonth'}
                render={({ field: { onChange, value } }) => {
                  return (
                    <ComboBox
                      label="Hóa đơn tháng:"
                      required={true}
                      isSearch={false}
                      options={Array.from({ length: 12 }, (_, index) => ({
                        key: index + 1,
                        value: index + 1,
                        label: `Tháng ${index + 1}`,
                      }))}
                      onChange={onChange}
                      value={value}
                      placeholder="Chọn tháng thanh toán"
                    />
                  );
                }}
              />

              <Controller
                control={control}
                name={'dueDate'}
                render={({
                  field: { onChange, value },
                  fieldState: { error },
                }) => {
                  return (
                    <DatePicker
                      error={error?.message}
                      label="Hạn thanh toán"
                      value={value}
                      onChange={onChange}
                      required
                    />
                  );
                }}
              />
            </View>
          </CardComponent>

          <CardComponent title="Thông tin dịch vụ">
            <ServiceInvoiceItem />
          </CardComponent>

          <CardComponent>
            <Controller
              control={control}
              name={'notes'}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Ghi chú"
                  value={value}
                  onChangeText={onChange}
                  type="area"
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              )}
            />
          </CardComponent>
        </FormProvider>
      </KeyboardAwareScrollView>
      <ActionButtonBottom
        actions={[
          {
            label: 'Tạo hóa đơn',
            icon: 'checkmark-circle',
            // isLoading: isSubmitting,
            onPress: handleSubmit(handleSave, (errors) => {
              console.error(
                '💞💓💗💞💓💗 ~ CreateInvoiceScreen ~ errors:',
                JSON.stringify(errors),
              );
              Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập đầy đủ thông tin!',
              });
            }),
          },
        ]}
      />
    </>
  );
};

export default CreateInvoiceScreen;
