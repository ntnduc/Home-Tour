import CardContent from '@/components/CardContent';
import { ComboBox } from '@/components/ComboBox';
import InputBase from '@/components/Input';
import { createStyles } from '@/styles/StyleCreateTenantScreen';
import { useTheme } from '@/theme/ThemeProvider';
import { ComboOption } from '@/types/comboOption';
import { PropertyUpdateRequest } from '@/types/property';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';

type ActiveDropdown = 'provinceCode' | 'districtCode' | 'wardCode' | null;

type Props = {
  control: Control<PropertyUpdateRequest>;
  errors: FieldErrors<PropertyUpdateRequest>;
  cities: ComboOption<string, string>[];
  districts: ComboOption<string, string>[];
  wards: ComboOption<string, string>[];
  isLoadingDistricts?: boolean;
  isLoadingWard?: boolean;
  activeDropdown: ActiveDropdown;
  setActiveDropdown: (value: ActiveDropdown) => void;
  onProvinceChange: (provinceId: string) => void;
  onDistrictChange: (districtId: string) => void;
  showMap?: boolean;
};

const PropertyAddressSection = ({
  control,
  errors,
  cities,
  districts,
  wards,
  isLoadingDistricts,
  isLoadingWard,
  activeDropdown,
  setActiveDropdown,
  onProvinceChange,
  onDistrictChange,
  showMap = false,
}: Props) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <CardContent title="Địa chỉ">
      <View className="mb-3">
        <Controller
          control={control}
          name="provinceCode"
          rules={{ required: 'Vui lòng chọn thành phố/tỉnh' }}
          render={({ field: { onChange, value } }) => (
            <ComboBox
              value={value}
              options={cities}
              required={true}
              onChange={(item) => {
                onChange(item?.value ?? '');
                onProvinceChange(item?.value ?? '');
              }}
              isLoading={isLoadingDistricts}
              placeholder="Chọn thành phố/tỉnh"
              error={errors.provinceCode?.message}
              onFocus={() => setActiveDropdown('provinceCode')}
              isActive={activeDropdown === 'provinceCode'}
              label="Thành phố / Tỉnh"
            />
          )}
        />
      </View>

      <View className="mb-3">
        <Controller
          control={control}
          name="districtCode"
          rules={{ required: 'Vui lòng chọn quận/huyện' }}
          render={({ field: { onChange, value } }) => (
            <ComboBox
              value={value}
              options={districts}
              required={true}
              onChange={(item) => {
                onChange(item?.value ?? '');
                onDistrictChange(item?.value ?? '');
              }}
              isLoading={isLoadingDistricts}
              placeholder="Chọn quận/huyện"
              error={errors.districtCode?.message}
              onFocus={() => setActiveDropdown('districtCode')}
              isActive={activeDropdown === 'districtCode'}
              label="Quận / Huyện"
            />
          )}
        />
      </View>

      <View className="mb-3">
        <Controller
          control={control}
          name="wardCode"
          rules={{ required: 'Vui lòng chọn phường/xã' }}
          render={({ field: { onChange, value } }) => (
            <ComboBox
              value={value}
              options={wards}
              required={true}
              onChange={(item) => {
                onChange(item?.value ?? '');
              }}
              isLoading={isLoadingWard}
              placeholder="Chọn phường/xã"
              error={errors.wardCode?.message}
              onFocus={() => setActiveDropdown('wardCode')}
              isActive={activeDropdown === 'wardCode'}
              label="Phường / Xã"
            />
          )}
        />
      </View>

      <View className="mb-3">
        <Controller
          control={control}
          name="address"
          rules={{ required: 'Vui lòng nhập địa chỉ chi tiết' }}
          render={({ field: { onChange, value } }) => (
            <InputBase
              placeholder="Nhập địa chỉ chi tiết"
              value={value}
              onChangeText={onChange}
              required={true}
              type="area"
              numberOfLines={3}
              label="Địa chỉ chi tiết"
              error={errors.address?.message}
            />
          )}
        />
      </View>

      {showMap && (
        <View>
          <Text style={styles.label}>Vị trí trên bản đồ</Text>
          <TouchableOpacity style={styles.mapButton}>
            <Ionicons name="map-outline" size={24} color="#007AFF" />
            <Text style={styles.mapButtonText}>Chọn vị trí trên bản đồ</Text>
          </TouchableOpacity>
        </View>
      )}
    </CardContent>
  );
};

export default PropertyAddressSection;
