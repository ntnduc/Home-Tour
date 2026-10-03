import CardContent from '@/components/CardContent';
import InputBase from '@/components/Input';
import { PropertyUpdateRequest } from '@/types/property';
import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { View } from 'react-native';

type Props = {
  control: Control<PropertyUpdateRequest>;
  errors: FieldErrors<PropertyUpdateRequest>;
};

const PropertyBasicInfoSection = ({ control, errors }: Props) => {
  return (
    <CardContent title="Thông tin cơ bản">
      <View className="mb-3">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <InputBase
              placeholder="Nhập tên gợi nhớ (không bắt buộc)"
              value={value}
              onChangeText={onChange}
              icon="home"
              label="Tên gợi nhớ"
              error={errors.name?.message}
            />
          )}
        />
      </View>
    </CardContent>
  );
};

export default PropertyBasicInfoSection;
