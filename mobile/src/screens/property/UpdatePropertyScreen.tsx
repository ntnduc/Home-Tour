import {
  getComboDistricts,
  getComboProvinces,
  getComboWards,
} from '@/api/location/location.api';
import { getProperty, updateProperty } from '@/api/property/property.api';
import ActionButtonBottom from '@/components/ActionButtonBottom';
import CardContent from '@/components/CardContent';
import { ComboBox } from '@/components/ComboBox';
import InputBase from '@/components/Input';
import Loading from '@/components/Loading';
import { ServiceCalculateMethod } from '@/constant/service.constant';
import { createStyles } from '@/styles/StyleCreateTenantScreen';
import { tokens } from "@/theme";
import { useTheme } from '@/theme/ThemeProvider';
import { ComboOption } from '@/types/comboOption';
import {
  mapPropertyDetailToUpdateRequest,
  PropertyUpdateRequest,
} from '@/types/property';
import { ServiceCreateOrUpdateRequest } from '@/types/service';
import { formatCurrency, generateId } from '@/utils/appUtil';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Controller,
  FieldErrors,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../navigation/types';
import CardComponent from '../common/CardComponent';
import CalculatorMethodComponent from '../tenant/components/CalculatorMethodComponent';
import ServiceSelectedSearchComponent from '../tenant/components/ServiceSelectedSearchComponent';

type UpdatePropertyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UpdateProperty'>;
  route: RouteProp<RootStackParamList, 'UpdateProperty'>;
};

const UpdatePropertyScreen = ({
  navigation,
  route,
}: UpdatePropertyScreenProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWard, setIsLoadingWard] = useState(false);
  const [initialData, setInitialData] = useState<PropertyUpdateRequest>();
  const [cities, setCities] = useState<ComboOption<string, string>[]>([]);
  const [districts, setDistricts] = useState<ComboOption<string, string>[]>([]);
  const [wards, setWards] = useState<ComboOption<string, string>[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<
    'provinceCode' | 'districtCode' | 'wardCode' | null
  >(null);

  useEffect(() => {
    const featchData = async () => {
      const responseForm = await getProperty(route.params.propertyId);
      if (!responseForm?.data || !responseForm?.success) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy thông tin!',
        });
        navigation.goBack && navigation.goBack();
        return;
      }
      const formData = mapPropertyDetailToUpdateRequest(responseForm.data);

      setInitialData(formData);

      const fetch = [
        getComboProvinces(),
        getComboDistricts(formData.provinceCode),
        getComboWards(formData.districtCode),
      ];

      axios
        .all(fetch)
        .then(([responseProvince, responseDistricts, responseWards]) => {
          setCities(responseProvince.data || []);
          setDistricts(responseDistricts.data || []);
          setWards(responseWards.data || []);
        })
        .catch(() => {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: 'Không lấy được vị trí!',
          });
          navigation.goBack && navigation.goBack();
        });
    };
    featchData().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<PropertyUpdateRequest>({
    values: initialData,
  });

  const {
    fields: services,
    prepend,
    remove,
  } = useFieldArray({
    control,
    name: 'services',
    keyName: 'fieldId',
  });

  const getDistricts = async (provinceId: string) => {
    setIsLoadingDistricts(true);
    setIsLoadingWard(true);
    const response = await getComboDistricts(provinceId);
    if (response.success) {
      setDistricts(response.data ?? []);
    } else {
      setDistricts([]);
    }
    setWards([]);
    setIsLoadingDistricts(false);
    setIsLoadingWard(false);
  };

  const getWards = async (districtId: string) => {
    setIsLoadingWard(true);
    const response = await getComboWards(districtId);
    if (response.success) {
      setWards(response.data ?? []);
    }
    setIsLoadingWard(false);
  };

  const handleAddService = () => {
    prepend({
      serviceId: '',
      fieldId: generateId(),
      isNew: true,
      name: '',
      price: 0,
      calculationMethod: ServiceCalculateMethod.FIXED_PER_ROOM,
    });
  };

  const handleRemoveService = (
    index: number,
    service: ServiceCreateOrUpdateRequest,
  ) => {
    const removeServiceIds = getValues('removeServiceIds') || [];
    if (!service.isNew && service.id) {
      setValue('removeServiceIds', [...removeServiceIds, service.id]);
    }
    remove(index);
  };

  const onSubmit = (data: PropertyUpdateRequest) => {
    setIsLoading(true);
    updateProperty(route.params.propertyId, data)
      .then((res) => {
        if (res.success) {
          Toast.show({
            type: 'success',
            text1: 'Thành công',
            text2: 'Cập nhật tài sản thành công!',
          });
          navigation.goBack && navigation.goBack();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: res.message,
          });
        }
      })
      .catch((err) => {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: err.response.data.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onError = (errors: FieldErrors) => {
    Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <KeyboardAwareScrollView
        style={styles.container}
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
        <CardContent>
          <View className="mb-3">
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Vui lòng nhập tên gợi nhớ' }}
              render={({ field: { onChange, value } }) => (
                <InputBase
                  placeholder="Nhập tên gợi nhớ (không bắt buộc)"
                  value={value}
                  onChangeText={onChange}
                  label="Tên gợi nhớ"
                  error={errors.name?.message}
                />
              )}
            />
          </View>
          <View className="mb-3">
            <Controller
              control={control}
              name="provinceCode"
              rules={{ required: 'Vui lòng chọn thành phố/tỉnh' }}
              render={({ field: { onChange, value } }) => (
                <ComboBox
                  value={value}
                  options={cities}
                  onChange={(value) => {
                    onChange(value?.value ?? '');
                    getDistricts(value?.value ?? '');
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
                  onChange={(value) => {
                    onChange(value?.value ?? '');
                    getWards(value?.value ?? '');
                  }}
                  isLoading={isLoadingWard}
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
                  onChange={(value) => {
                    onChange(value?.value ?? '');
                  }}
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
                  onChangeText={onChange}
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
                  onChangeText={onChange}
                  keyboardType="numeric"
                  error={errors.paymentDate?.message}
                />
              )}
            />
          </View>
          <View className="mb-3">
            <Controller
              control={control}
              name="numberFloor"
              render={({ field: { onChange, value } }) => (
                <InputBase
                  label="Số tầng"
                  placeholder="Nhập số tầng"
                  value={value?.toString()}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  error={errors.numberFloor?.message}
                />
              )}
            />
          </View>
          <CardComponent>
            <View className="gap-2">
              <View className="flex-row items-center justify-between mb-2">
                <Text style={styles.label}>Dịch vụ thu phí</Text>
                <TouchableOpacity
                  style={styles.addServiceButton}
                  onPress={handleAddService}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.addServiceButtonText}>Thêm dịch vụ</Text>
                </TouchableOpacity>
              </View>
              <View className="gap-3 rounded-lg">
                {services &&
                  services?.map((service, index) => (
                    <View
                      key={service.fieldId || String(index)}
                      className="gap-2 bg-white p-3 rounded-lg border border-border-strong mb-2"
                      style={{ position: 'relative' }}
                    >
                      <TouchableOpacity
                        style={styles.removeServiceItemButton}
                        onPress={() => handleRemoveService(index, service)}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                      <View className="flex-row gap-2 items-center">
                        <View className="gap-2 flex-1">
                          <Controller
                            control={control}
                            name={`services.${index}.name`}
                            render={({ field: { onChange, value } }) => {
                              return (
                                <ServiceSelectedSearchComponent
                                  value={value}
                                  service={service}
                                  onChange={(newService) => {
                                    setValue(
                                      `services.${index}`,
                                      newService as any,
                                    );
                                  }}
                                  error={
                                    errors.services?.[index]?.name?.message
                                  }
                                />
                              );
                            }}
                          />
                          <Controller
                            control={control}
                            name={`services.${index}.price`}
                            rules={{ required: 'Vui lòng nhập giá dịch vụ' }}
                            render={({ field: { value } }) => {
                              const currentService = watch(`services.${index}`);
                              const currentMethod =
                                currentService?.calculationMethod;
                              return (
                                <InputBase
                                  placeholder="Giá"
                                  disabled={
                                    currentMethod ===
                                    ServiceCalculateMethod.FREE
                                  }
                                  icon="cash-outline"
                                  iconProps={{
                                    color: tokens.colors.primary,
                                  }}
                                  value={
                                    currentMethod ===
                                    ServiceCalculateMethod.FREE
                                      ? '0'
                                      : value
                                        ? formatCurrency(value.toString())
                                        : ''
                                  }
                                  onChangeText={(text) => {
                                    const numericValue = text.replace(
                                      /[^0-9]/g,
                                      '',
                                    );
                                    setValue(
                                      `services.${index}.price`,
                                      Number(numericValue),
                                    );
                                  }}
                                  keyboardType="numeric"
                                  error={
                                    errors.services?.[index]?.price?.message
                                  }
                                />
                              );
                            }}
                          />
                          <Controller
                            control={control}
                            name={`services.${index}.calculationMethod`}
                            render={({ field: { value, onChange } }) => (
                              <CalculatorMethodComponent
                                value={value}
                                onChange={(newMethod) => {
                                  onChange(newMethod);
                                  if (
                                    newMethod === ServiceCalculateMethod.FREE
                                  ) {
                                    setValue(`services.${index}.price`, 0);
                                  }
                                }}
                              />
                            )}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          </CardComponent>
        </CardContent>
      </KeyboardAwareScrollView>
      <ActionButtonBottom
        actions={[
          {
            label: 'Cập Nhật',
            onPress: handleSubmit(onSubmit, onError),
            variant: 'primary',
            isLoading: isLoading,
            icon: 'checkmark-circle',
          },
        ]}
      />
    </>
  );
};

export default UpdatePropertyScreen;
