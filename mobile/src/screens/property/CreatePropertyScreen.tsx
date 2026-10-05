// @ts-nocheck
import {
  getComboDistricts,
  getComboProvinces,
  getComboWards,
} from '@/api/location/location.api';
import { ComboBox } from '@/components/ComboBox';
import InputBase from '@/components/Input';
import Loading from '@/components/Loading';
import { ServiceCalculateMethod } from '@/constant/service.constant';
import { createStyles } from '@/styles/StyleCreateTenantScreen';
import { tokens } from "@/theme";
import { ComboOption } from '@/types/comboOption';
import { PropertyCreateRequest } from '@/types/property';
import { formatCurrency, generateId } from '@/utils/appUtil';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Controller,
  FieldErrors,
  useFieldArray,
  useForm,
} from 'react-hook-form';

import { createProperty } from '@/api/property/property.api';
import { getServiceDefault } from '@/api/service/service.api';
import ActionButtonBottom from '@/components/ActionButtonBottom';
import CardContent from '@/components/CardContent';
import { useTheme } from '@/theme/ThemeProvider';
import { ServiceCreateOrUpdateRequest } from '@/types/service';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../navigation/types';
import CardComponent from '../common/CardComponent';
import CalculatorMethodComponent from '../tenant/components/CalculatorMethodComponent';
import ServiceSelectedSearchComponent from '../tenant/components/ServiceSelectedSearchComponent';

type CreatePropertyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateProperty'>;
};

const CreatePropertyScreen = ({ navigation }: CreatePropertyScreenProps) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [location, setLocation] = useState<ComboOption<string, string>[]>([]);
  const [cities, setCities] = useState<ComboOption<string, string>[]>([]);
  const [wards, setWards] = useState<ComboOption<string, string>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWard, setIsLoadingWard] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<
    'provinceCode' | 'districtCode' | 'wardCode' | null
  >(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PropertyCreateRequest>({
    defaultValues: {
      name: '',
      defaultRoomRent: 5000000,
      paymentDate: 5,
      services: [],
    },
  });

  const {
    fields: services,
    append,
    remove,
    prepend,
  } = useFieldArray({
    control,
    name: 'services',
    keyName: 'fieldId',
  });

  //#region Fetch data
  useEffect(() => {
    featchData().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const featchData = async (): Promise<void> => {
    const responseProvince = await getComboProvinces();
    const responseServiceDefalt = await getServiceDefault();
    if (responseProvince.success && responseServiceDefalt.success) {
      setCities(responseProvince.data ?? []);
      const servicesDefault = responseServiceDefalt.data?.map((service) => ({
        serviceId: service.id,
        isNew: false,
        name: service.name,
        price: service.price,
        calculationMethod: service.calculationMethod,
        icon: service.icon,
        id: '',
      })) as ServiceCreateOrUpdateRequest[];

      setValue('services', servicesDefault);
    }
  };

  const getDistricts = async (provinceId: string) => {
    setIsLoadingDistricts(true);
    setIsLoadingWard(true);
    const response = await getComboDistricts(provinceId);
    if (response.success) {
      setLocation(response.data ?? []);
    } else {
      setLocation([]);
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
      icon: 'apps-outline',
    });
  };

  const handleRemoveService = (index: number) => {
    remove(index);
  };

  const beforeSubmit = (data: PropertyCreateRequest) => {
    data.defaultRoomRent = Number(data.defaultRoomRent) ?? 0;
    data.paymentDate = Number(data.paymentDate) ?? 0;
    data?.services?.forEach((service) => {
      service.price = Number(service.price) ?? 0;
      if (service.calculationMethod === ServiceCalculateMethod.FREE) {
        service.price = 0;
      }
    });
    return data;
  };

  const onSubmit = (data: PropertyCreateRequest) => {
    setIsLoading(true);
    beforeSubmit(data);

    createProperty(data)
      .then(() => {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Tạo tài sản thành công',
        });
        navigation.goBack();
      })
      .catch((errors) => {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Tạo tài sản thất bại',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  //#endregion

  const onError = (errors: FieldErrors<PropertyCreateRequest>) => {
    Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <KeyboardAwareScrollView
        style={styles.container}
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
              render={({ field: { onChange, value } }) => {
                return (
                  <ComboBox
                    value={value}
                    options={cities}
                    required={true}
                    onChange={(item) => {
                      onChange(item?.value ?? '');
                      getDistricts(item?.value ?? '');
                    }}
                    placeholder="Chọn thành phố/tỉnh"
                    error={errors.provinceCode?.message}
                    onFocus={() => setActiveDropdown('provinceCode')}
                    isActive={activeDropdown === 'provinceCode'}
                    label="Thành phố / Tỉnh"
                  />
                );
              }}
            />
          </View>

          <View className="mb-3">
            <Controller
              control={control}
              name="districtCode"
              rules={{ required: 'Vui lòng chọn quận/huyện' }}
              render={({ field: { onChange, value } }) => (
                <ComboBox
                  value={value as any}
                  required={true}
                  options={location}
                  onChange={(item) => {
                    onChange(item?.value ?? '');
                    getWards(item?.value ?? '');
                  }}
                  placeholder="Chọn quận/huyện"
                  error={errors.districtCode?.message}
                  isLoading={isLoadingDistricts}
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
                  placeholder="Chọn phường/xã"
                  error={errors.wardCode?.message}
                  isLoading={isLoadingWard}
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
            <Text style={styles.label}>Vị trí trên bản đồ</Text>
            <TouchableOpacity style={styles.mapButton}>
              <Ionicons name="map-outline" size={24} color={tokens.colors.primary} />
              <Text style={styles.mapButtonText}>Chọn vị trí trên bản đồ</Text>
            </TouchableOpacity>
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
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    onChange(numericValue);
                  }}
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
                  keyboardType="numeric"
                  error={errors.paymentDate?.message}
                />
              )}
            />
          </View>

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
                  keyboardType="numeric"
                  error={errors.totalRoom?.message}
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
                  services.map((service, index) => (
                    <View
                      key={service.fieldId || String(index)}
                      className="gap-2 bg-white p-3 rounded-lg border border-border-strong mb-2"
                      style={{ position: 'relative' }}
                    >
                      <TouchableOpacity
                        style={styles.removeServiceItemButton}
                        onPress={() => handleRemoveService(index)}
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
                                  service={service as any}
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
                            render={({ field: { onChange, value } }) => (
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
            label: 'Tạo tài sản',
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

export default CreatePropertyScreen;
