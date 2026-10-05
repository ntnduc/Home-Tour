import Input from '@/components/Input';
import { tokens } from "@/theme";
import {
  SERVICE_CALCULATE_METHOD_WITH_INFO,
  ServiceCalculateMethod,
} from '@/constant/service.constant';
import CardComponent from '@/screens/common/CardComponent';
import { InvoiceCreateRequest } from '@/types/invoice';
import { InvoiceItemCreateRequest, InvoiceItemType } from '@/types/invoice.item';
import { formatCurrency, isAndroidSystem, isIOSSystem } from '@/utils/appUtil';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

const ServiceInvoiceItem = () => {

  const { control, getValues, setValue } = useFormContext<InvoiceCreateRequest>();

  const invoiceItems = useWatch({
    control,
    name: 'invoiceItems',
    defaultValue: []
  });

  const handleConfirmEditNew = useCallback((index: number, callback?: () => void) => {
    const isUpdate = getValues(`invoiceItems.${index}.isUpdated`);
    if (!isUpdate) {
      Alert.alert(
        'Chỉnh sửa chỉ số cũ',
        'Bạn chắc chắn muốn sửa chỉ số cũ? Hãy đảm bảo ghi nhận đúng số trước đó.',
        [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Đồng ý',
            style: 'destructive',
            onPress: () => {
              setValue(`invoiceItems.${index}.isUpdated`, true);
            },
          },
        ],
      );
    } else {
      Alert.alert(
        'Hủy và đặt lại',
        'Bạn chắc chắn muốn hủy và đặt lại chỉ số cũ?',
        [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Đồng ý',
            style: 'destructive',
            onPress: () => {
              setValue(`invoiceItems.${index}.isUpdated`, false);
              callback?.();
            },
          },
        ],
      );
    }
  }, []);

  const calPrice = useCallback((serviceItem: InvoiceItemCreateRequest, index: number) => {
    const calculatedHelperValueNumber = calculatedHelperValue(serviceItem, index);
    const amount = getValues(`invoiceItems.${index}.amount`);
    return (
      Number(amount) * calculatedHelperValueNumber
    );
  }, []);

  const calculatedHelperValue = useCallback((serviceItem: InvoiceItemCreateRequest, index: number) => {
    const newHelperValue = getValues(`invoiceItems.${index}.newHelperValue`);
    const oldHelperValue = getValues(`invoiceItems.${index}.oldHelperValue`);
    const checkHelperValue = newHelperValue ? newHelperValue : oldHelperValue ?? 0;

    if (Number(serviceItem.helperValue) <= Number(checkHelperValue)) {
      return 0;
    }
    return (serviceItem.helperValue ?? 0) - checkHelperValue;
  }, []);


  const _serviceCalculatorSimple = (serviceItem: InvoiceItemCreateRequest, index: number) => {
    return (
      <CardComponent
        key={serviceItem.contractServiceId}
        title={serviceItem.name}
        style={{
          elevation: isAndroidSystem() ? 3 : 0,
        }}
        className={`${isIOSSystem() ? 'shadow-[0_8px_30px_rgb(0,0,0,0.12)]' : ''}`}
        description={`${formatCurrency(serviceItem.amount)} đ/ ${SERVICE_CALCULATE_METHOD_WITH_INFO[serviceItem.calculationMethod ?? ServiceCalculateMethod.PER_UNIT_SIMPLE].unit}`}
        renderActions={() => (
          <TouchableOpacity
            onPress={() => handleConfirmEditNew(index,
              () => {
                setValue(`invoiceItems.${index}.newHelperValue`, getValues(`invoiceItems.${index}.oldHelperValue`));
              }
            )}
            className={`flex-row items-center rounded-full px-3 py-1 
          ${getValues(`invoiceItems.${index}.isUpdated`)
                ? 'bg-yellow-50 border border-yellow-100'
                : 'bg-gray-50 border border-gray-100'
              }`}
          >
            <Ionicons
              name={
                getValues(`invoiceItems.${index}.isUpdated`)
                  ? 'refresh-outline'
                  : 'create-outline'
              }
              size={18}
              color={
                getValues(`invoiceItems.${index}.isUpdated`)
                  ? tokens.palette.amber[600]
                  : tokens.colors.info
              }
            />
            <Text
              className={`ml-1 text-sm font-semibold ${getValues(`invoiceItems.${index}.isUpdated`)
                ? 'text-yellow-500'
                : 'text-info'
                }`}
            >
              {getValues(`invoiceItems.${index}.isUpdated`)
                ? 'Hủy và đặt lại'
                : 'Sửa số người'}
            </Text>
          </TouchableOpacity>
        )}
      >
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-lg bg-white p-2 border border-gray-100">
            <Controller
              control={control}
              rules={{ required: 'Vui lòng nhập số cũ' }}
              name={`invoiceItems.${index}.newHelperValue`}
              render={({ field: { onChange, value } }) => {
                return (
                  <Input
                    label="Số cũ"
                    value={value?.toString()}
                    type="number"
                    keyboardType="numeric"
                    min={0}
                    disabled={!getValues(`invoiceItems.${index}.isUpdated`)}
                    onChangeText={onChange}
                    showClear={false}
                  />
                );
              }}
            />
          </View>

          <View className="flex-1 rounded-lg bg-white p-2 border border-gray-100">
            <Controller
              control={control}
              name={`invoiceItems.${index}.helperValue`}
              rules={{ required: 'Vui lòng nhập số mới' }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => {
                return (
                  <Input
                    label="Số mới"
                    value={value?.toString()}
                    type="number"
                    keyboardType="numeric"
                    required
                    error={error?.message}
                    onChangeText={onChange}
                    showClear={false}
                  />
                );
              }}
            />
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-gray-700">Sản lượng</Text>
          <Text className="text-base font-semibold text-gray-900">
            {formatCurrency(calculatedHelperValue(serviceItem, index)) || '0'}{' '}
            {SERVICE_CALCULATE_METHOD_WITH_INFO[serviceItem.calculationMethod ?? ServiceCalculateMethod.PER_UNIT_SIMPLE].unit}
          </Text>
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-gray-800">
            Tạm tính
          </Text>
          <Text className="text-xl font-extrabold text-info">
            {formatCurrency(calPrice(serviceItem, index))} đ
          </Text>
        </View>
      </CardComponent>
    );
  };

  const _serviceCalculatorFixedPerRoom = (serviceItem: InvoiceItemCreateRequest, index: number) => {
    return (
      <CardComponent
        style={{
          elevation: isAndroidSystem() ? 3 : 0,
        }}
        title={serviceItem.name}
        className={`${isIOSSystem() ? 'shadow-[0_8px_30px_rgb(0,0,0,0.12)]' : ''}`}
        key={serviceItem.contractServiceId}
      >
        <View className=" flex-row items-center justify-between">
          <Text className="text-base font-semibold text-gray-800">
            Tạm tính
          </Text>
          <Text className="text-xl font-extrabold text-info">
            {formatCurrency(serviceItem.amount)} đ
          </Text>
        </View>
      </CardComponent>
    );
  };

  const _serviceCalculatorFixedPerPerson = (serviceItem: InvoiceItemCreateRequest, index: number) => {
    return (
      <CardComponent
        style={{
          elevation: isAndroidSystem() ? 3 : 0,
        }}
        className={`${isIOSSystem() ? 'shadow-[0_8px_30px_rgb(0,0,0,0.12)]' : ''}`}
        key={serviceItem.contractServiceId}
        title={serviceItem.name}
        description={`${formatCurrency(serviceItem.amount)} đ/ ${SERVICE_CALCULATE_METHOD_WITH_INFO[serviceItem.calculationMethod ?? ServiceCalculateMethod.FIXED_PER_PERSON].unit}`}
        renderActions={() => (
          <TouchableOpacity
            onPress={() => handleConfirmEditNew(index, () => {
              setValue(`invoiceItems.${index}.helperValue`, getValues(`invoiceItems.${index}.oldHelperValue`));
            })}
            className={`flex-row items-center rounded-full px-3 py-1 
          ${getValues(`invoiceItems.${index}.isUpdated`)
                ? 'bg-yellow-50 border border-yellow-100'
                : 'bg-gray-50 border border-gray-100'
              }`}
          >
            <Ionicons
              name={
                getValues(`invoiceItems.${index}.isUpdated`)
                  ? 'refresh-outline'
                  : 'create-outline'
              }
              size={18}
              color={
                getValues(`invoiceItems.${index}.isUpdated`)
                  ? tokens.palette.amber[600]
                  : tokens.colors.info
              }
            />
            <Text
              className={`ml-1 text-sm font-semibold ${getValues(`invoiceItems.${index}.isUpdated`)
                ? 'text-yellow-500'
                : 'text-info'
                }`}
            >
              {getValues(`invoiceItems.${index}.isUpdated`)
                ? 'Hủy và đặt lại'
                : 'Sửa số người'}
            </Text>
          </TouchableOpacity>
        )}
      >
        <View className="flex-1 rounded-lg bg-white p-2 border border-gray-100">

          <Controller
            control={control}
            name={`invoiceItems.${index}.helperValue`}
            render={({ field: { onChange, value } }) => {
              return (
                <Input
                  label="Số người"
                  disabled={!getValues(`invoiceItems.${index}.isUpdated`)}
                  value={value?.toString()}
                  type="number"
                  keyboardType="numeric"
                  onChangeText={onChange}
                  showClear={false}
                />
              );
            }}
          />

          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-800">
              Tạm tính
            </Text>
            <Controller
              control={control}
              name={`invoiceItems.${index}.helperValue`}
              render={({ field: { onChange, value } }) => {
                const calPrice = Number(serviceItem.amount) * (value ?? 0);
                return (
                  <Text className="text-xl font-extrabold text-info">
                    {formatCurrency(calPrice)} đ
                  </Text>
                );
              }}
            />
          </View>
        </View>
      </CardComponent>
    );
  };

  const _serviceCalculatorFixedPerNumber = (serviceItem: InvoiceItemCreateRequest, index: number) => {
    return (
      <CardComponent
        style={{
          elevation: isAndroidSystem() ? 3 : 0,
        }}
        className={`${isIOSSystem() ? 'shadow-[0_8px_30px_rgb(0,0,0,0.12)]' : ''}`}
        key={serviceItem.contractServiceId}
        title={serviceItem.name}
        description={`${formatCurrency(serviceItem.amount)} đ/ ${SERVICE_CALCULATE_METHOD_WITH_INFO[serviceItem.calculationMethod ?? ServiceCalculateMethod.FIXED_PER_NUMBER].unit}`}
        renderActions={() => (
          <TouchableOpacity
            onPress={() => handleConfirmEditNew(index,
              () => {
                setValue(`invoiceItems.${index}.helperValue`, getValues(`invoiceItems.${index}.oldHelperValue`));
              }
            )}
            className={`flex-row items-center rounded-full px-3 py-1 
          ${getValues(`invoiceItems.${index}.isUpdated`)
                ? 'bg-yellow-50 border border-yellow-100'
                : 'bg-gray-50 border border-gray-100'
              }`}
          >
            <Ionicons
              name={
                getValues(`invoiceItems.${index}.isUpdated`)
                  ? 'refresh-outline'
                  : 'create-outline'
              }
              size={18}
              color={
                getValues(`invoiceItems.${index}.isUpdated`)
                  ? tokens.palette.amber[600]
                  : tokens.colors.info
              }
            />
            <Text
              className={`ml-1 text-sm font-semibold ${getValues(`invoiceItems.${index}.isUpdated`)
                ? 'text-yellow-500'
                : 'text-info'
                }`}
            >
              {getValues(`invoiceItems.${index}.isUpdated`)
                ? 'Hủy và đặt lại'
                : 'Sửa số lượng'}
            </Text>
          </TouchableOpacity>
        )}
      >
        <View className="flex-1 rounded-lg bg-white p-2 border border-gray-100">
          <Controller
            control={control}
            name={`invoiceItems.${index}.helperValue`}
            render={({ field: { onChange, value } }) => {
              return (
                <Input
                  label="Số lượng"
                  value={value?.toString()}
                  type="number"
                  keyboardType="numeric"
                  disabled={!getValues(`invoiceItems.${index}.isUpdated`)}
                  onChangeText={onChange}
                  showClear={false}
                />
              );
            }}
          />
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-base font-semibold text-gray-800">
            Tạm tính
          </Text>
          <Controller
            control={control}
            name={`invoiceItems.${index}.helperValue`}
            render={({ field: { onChange, value } }) => {
              const calPrice = Number(serviceItem.amount) * (value ?? 0);
              return (
                <Text className="text-xl font-extrabold text-info">
                  {formatCurrency(calPrice)} đ
                </Text>
              );
            }}
          />
        </View>
      </CardComponent>
    );
  };

  const _renderServiceItem = (serviceItem: InvoiceItemCreateRequest, index: number) => {
    switch (serviceItem.calculationMethod) {
      case ServiceCalculateMethod.PER_UNIT_SIMPLE:
        return _serviceCalculatorSimple(serviceItem, index);
      case ServiceCalculateMethod.FIXED_PER_ROOM:
        return _serviceCalculatorFixedPerRoom(serviceItem, index);
      case ServiceCalculateMethod.FIXED_PER_PERSON:
        return _serviceCalculatorFixedPerPerson(serviceItem, index);
      case ServiceCalculateMethod.FIXED_PER_NUMBER:
        return _serviceCalculatorFixedPerNumber(serviceItem, index);
      default:
        return <View></View>;
    }
  };

  return <View className='gap-y-3'>{invoiceItems?.filter(item => item.type === InvoiceItemType.SERVICE_FEE)?.map((serviceItem, index) => {
    return <View key={serviceItem.contractServiceId}>
      {
        // +1 vì item đầu tiên là tiền phòng
        _renderServiceItem(serviceItem, index + 1)}
    </View>
  })}</View>;
};

export default ServiceInvoiceItem;
