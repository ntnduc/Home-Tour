import CardContent from '@/components/CardContent';
import InputBase from '@/components/Input';
import { PropertyUpdateRequest } from '@/types/property';
import { formatCurrency } from '@/utils/appUtil';
import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { View } from 'react-native';

type Props = {
  control: Control<PropertyUpdateRequest>;
  errors: FieldErrors<PropertyUpdateRequest>;
  showTotalRoom?: boolean;
};

const PropertyPricingSection = ({
  control,
  errors,
  showTotalRoom = false,
}: Props) => {
  return (
    <CardContent title="Thiết lập giá & phòng">
      <View className="mb-3">
        <Controller
          control={control}
          name="defaultRoomRent"
          rules={{ required: 'Vui lòng nhập giá thuê mặc định' }}
          render={({ field: { onChange, value } }) => (
            <InputBase
              label="Giá thuê mặc định"
              required={true}
              placeholder="Nhập giá thuê mặc định"
              value={value ? formatCurrency(value.toString()) : ''}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '');
                onChange(numericValue);
              }}
              icon="cash"
              keyboardType="numeric"
              error={errors.defaultRoomRent?.message}
            />
          )}
        />
      </View>

      <View className="mb-3">
        <Controller
          control={control}
          name="paymentDate"
          rules={{ required: 'Vui lòng nhập ngày thanh toán' }}
          render={({ field: { onChange, value } }) => (
            <InputBase
              label="Ngày thanh toán"
              required={true}
              placeholder="Nhập ngày thanh toán"
              value={value?.toString()}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '');
                const num = parseInt(numericValue);
                if (!num) {
                  onChange(null);
                  return;
                }
                if (num >= 1 && num <= 31) {
                  onChange(num);
                }
              }}
              icon="calendar"
              keyboardType="numeric"
              error={errors.paymentDate?.message}
            />
          )}
        />
      </View>

      {showTotalRoom && (
        <View className="mb-3">
          <Controller
            control={control}
            name="totalRoom"
            rules={{ required: 'Vui lòng nhập số phòng' }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                label="Số phòng"
                required={true}
                placeholder="Nhập số phòng"
                value={value?.toString()}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  const num = parseInt(numericValue);
                  if (!num) {
                    onChange(null);
                    return;
                  }
                  onChange(num);
                }}
                icon="grid"
                keyboardType="numeric"
                error={errors.totalRoom?.message}
              />
            )}
          />
        </View>
      )}

      <View className="mb-3">
        <Controller
          control={control}
          name="numberFloor"
          render={({ field: { onChange, value } }) => (
            <InputBase
              label="Số tầng"
              placeholder="Nhập số tầng"
              value={value ? value.toString() : ''}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '');
                const num = parseInt(numericValue);
                if (!num) {
                  onChange(null);
                  return;
                }
                onChange(num);
              }}
              icon="layers"
              keyboardType="numeric"
              error={errors.numberFloor?.message}
            />
          )}
        />
      </View>
    </CardContent>
  );
};

export default PropertyPricingSection;
