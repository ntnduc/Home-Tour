import { tokens } from "@/theme";
import {
  SERVICE_CALCULATE_METHOD_WITH_INFO,
  ServiceCalculateMethod,
} from '@/constant/service.constant';
import { InvoiceItemCreateRequest } from '@/types/invoice.item';
import { formatCurrency } from '@/utils/appUtil';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

type ServiceViewInvoiceItemProps = {
  data: InvoiceItemCreateRequest;
  isLast?: boolean;
};

const ServiceDetailInvoiceItemComponent = ({ data, isLast = false }: ServiceViewInvoiceItemProps) => {
  const item = data;
  const method = item.calculationMethod as ServiceCalculateMethod;
  const methodInfo = SERVICE_CALCULATE_METHOD_WITH_INFO[method];

  const quantity = useMemo(() => {
    switch (method) {
      case ServiceCalculateMethod.PER_UNIT_SIMPLE:
        return Math.max(0, (Number(item.helperValue) ?? 0) - (Number(item.newHelperValue) ?? Number(item.oldHelperValue) ?? 0));
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
      return `/${methodInfo?.unit || 'đơn vị'}`;
    }
    if (method === ServiceCalculateMethod.FIXED_PER_PERSON) {
      return `/${methodInfo?.unit || 'người'}`;
    }
    return '/tháng';
  }, [method, methodInfo?.unit]);

  return (
    <View
      className={`flex-row items-start py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}
    >
      <View className="flex-row flex-1">
        <Ionicons name="checkmark-circle" size={18} color={tokens.colors.success} />
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {item.name || 'Dịch vụ'}
          </Text>

          <View>
            <Text className="text-sm font-semibold text-info italic">
              {formatCurrency((item.amount || 0).toString())} đ{unitLabel}
            </Text>

            {method === ServiceCalculateMethod.PER_UNIT_SIMPLE && (
              <Text className="text-xs text-gray-600 mt-1 leading-4">
                {item.newHelperValue ?? item.oldHelperValue ?? 0} → {item.helperValue ?? 0}
              </Text>
            )}

            {method === ServiceCalculateMethod.FIXED_PER_ROOM && (
              <Text className="text-xs text-gray-600 mt-1 leading-4">Tính theo phòng</Text>
            )}
          </View>
        </View>
      </View>

      <View className="w-20 items-center">
        <Text className="text-xs text-gray-500">Số lượng</Text>
        <Text className="text-lg font-bold text-gray-900 mt-0.5">{quantity}</Text>
      </View>

      <View className="w-28 items-end">
        <Text className="text-xs text-gray-500">Thành tiền</Text>
        <Text className="text-base font-extrabold text-gray-900 mt-0.5">
          {formatCurrency(item.totalAmount?.toString() || '0')}đ
        </Text>
      </View>
    </View>
  );
};

export default ServiceDetailInvoiceItemComponent;
