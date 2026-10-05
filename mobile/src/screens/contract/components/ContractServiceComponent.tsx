import { Ionicons } from '@expo/vector-icons';
import { tokens } from "@/theme";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Components
import Input from '@/components/Input';

// Types & Constants
import ActionButtonBottom from '@/components/ActionButtonBottom';
import { stylesHeader } from '@/components/AppSheet/AppSheet';
import AppSheetBackdropComponent from '@/components/AppSheet/AppSheetBackdropComponent';
import AppSheetHandleComponent from '@/components/AppSheet/AppSheetHandleComponent';
import AppSheetHeader from '@/components/AppSheet/AppSheetHeader';
import { ComboBox } from '@/components/ComboBox';
import { Switch } from '@/components/Switch';
import {
  SERVICE_CALCULATE_METHOD_WITH_INFO,
  ServiceCalculateMethod,
} from '@/constant/service.constant';
import { createStyles } from '@/styles/component/StyleComboBox';
import { useTheme } from '@/theme/ThemeProvider';
import { ContractServiceDetailResponse } from '@/types/contract-service';
import { formatCurrency } from '@/utils/appUtil';
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Controller, useForm } from 'react-hook-form';

interface ContractServiceComponentProps {
  onSuccess?: (service: ContractServiceDetailResponse, index: number) => void;
}

export interface ContractServiceComponentRef {
  snapToIndex: (index: number) => void;
  snapToPosition: (position: string | number) => void;
  close: () => void;
  expand: (service: ContractServiceDetailResponse, index: number) => void;
  collapse: () => void;
}

interface CalculationMethodOption {
  key: ServiceCalculateMethod;
  value: ServiceCalculateMethod;
  label: string;
  icon: string;
  info: string;
  unit: string;
}

const ContractServiceComponent = forwardRef<
  ContractServiceComponentRef,
  ContractServiceComponentProps
>(({ onSuccess }, ref) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const styleHeader = stylesHeader;
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [index, setIndex] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue: setValueForm,
    reset,
    formState: { errors, defaultValues },
  } = useForm<ContractServiceDetailResponse>({
    defaultValues: {
      name: '',
      calculationMethod: ServiceCalculateMethod.PER_UNIT_SIMPLE,
      price: 0,
      isEnabled: true,
      helperValue: null,
    },
  });

  useImperativeHandle(ref, () => ({
    snapToIndex: (index: number) => {
      bottomSheetRef.current?.snapToIndex(index);
    },
    snapToPosition: (position: string | number) => {
      bottomSheetRef.current?.snapToPosition(position);
    },
    close: () => {
      bottomSheetRef.current?.close();
      setIsOpen(false);
    },
    expand: (service: ContractServiceDetailResponse, index: number) => {
      setIsOpen(true);
      reset();
      setIndex(index);
      service?.name && setValueForm('name', service.name);
      setValueForm(
        'calculationMethod',
        service.calculationMethod ?? ServiceCalculateMethod.PER_UNIT_SIMPLE,
      );
      if (service.calculationMethod === ServiceCalculateMethod.FREE) {
        setValueForm('price', 0);
      } else {
        setValueForm('price', service.price);
      }
      setValueForm('isEnabled', service.isEnabled);
      setValueForm('helperValue', service.helperValue);

      setTimeout(() => {
        bottomSheetRef.current?.expand();
      }, 100);
    },
    collapse: () => {
      bottomSheetRef.current?.collapse();
    },
  }));

  const calculationMethodOptions = Object.entries(
    SERVICE_CALCULATE_METHOD_WITH_INFO,
  ).map(([key, value]) => ({
    key: key as ServiceCalculateMethod,
    value: value,
    label: value.label,
    icon: value.icon,
    info: value.info,
    unit: value.unit,
  }));

  const calculationMethod = watch('calculationMethod');
  const price = watch('price');
  const isEnabled = watch('isEnabled');
  const helperValue = watch('helperValue');

  const _renderItems = useCallback(
    (item: CalculationMethodOption, selected?: boolean) => {
      return (
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            height: 50,
            paddingHorizontal: 10,
          }}
        >
          <View className="flex-row items-center flex-1">
            <Ionicons
              className="mr-4"
              name={item.icon as any}
              size={17}
              color={tokens.colors.muted}
            />
            <Text style={styles.itemText}>{item.label}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Thông tin',
                SERVICE_CALCULATE_METHOD_WITH_INFO[item.key].info,
              );
            }}
          >
            <Ionicons
              className="mr-1"
              name={'information-circle-outline'}
              size={20}
              color={tokens.colors.info}
            />
          </TouchableOpacity>
        </View>
      );
    },
    [],
  );

  const _renderHelpInfo = useCallback(() => {
    switch (calculationMethod) {
      case ServiceCalculateMethod.PER_UNIT_SIMPLE:
        return (
          <View className="mb-3">
            <Controller
              control={control}
              name="helperValue"
              rules={{
                required: {
                  value: true,
                  message: 'Nhập số hiện tại',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Số hiện tại"
                  min={0}
                  type="number"
                  required={true}
                  showClear={false}
                  error={errors.helperValue?.message}
                  placeholder="Nhập giá trị cũ"
                  value={value?.toString()}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  icon="document-lock"
                />
              )}
            />
          </View>
        );
      case ServiceCalculateMethod.FIXED_PER_NUMBER:
        return (
          <View className="mb-3">
            <Controller
              control={control}
              name="helperValue"
              rules={{
                required: {
                  value: true,
                  message: 'Nhập số lượng',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Số lượng"
                  min={0}
                  type="number"
                  required={true}
                  showClear={false}
                  error={errors.helperValue?.message}
                  placeholder="Nhập số lượng"
                  value={value?.toString()}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  icon="document-lock"
                />
              )}
            />
          </View>
        );
      case ServiceCalculateMethod.FREE: {
        return <View></View>;
      }
      default:
        return null;
    }
  }, [calculationMethod]);

  const _renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props}>
        <ActionButtonBottom
          actions={[
            {
              label: 'Xác nhận',
              onPress: handleSubmit(
                (value) => {
                  onSuccess?.(value, index);
                  bottomSheetRef.current?.close();
                },
                (erroes) => {
                  // TODO: Do nothing
                },
              ),
              variant: 'success',
            },
          ]}
        />
      </BottomSheetFooter>
    ),
    [index],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <AppSheetBackdropComponent
        {...props}
        onBackdropPress={() => {
          bottomSheetRef.current?.close();
        }}
      />
    ),
    [],
  );

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={isOpen ? 'auto' : 'none'}
    >
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['90%']}
        index={-1}
        onClose={() => {
          // bottomSheetRef.current?.close();
          setIsOpen(false);
        }}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        enableOverDrag={false}
        handleComponent={AppSheetHandleComponent}
        enableHandlePanningGesture={true}
        detached={true}
        footerComponent={_renderFooter}
      >
        <View style={[styleHeader.fixedHeaderContainer, { height: 60 }]}>
          <AppSheetHeader
            title="Cập nhật dịch vụ"
            onClose={() => {
              bottomSheetRef.current?.close();
            }}
          />
        </View>
        <BottomSheetScrollView
          className="p-4 mt-[60px] mb-[90px]"
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
        >
          <View className="mb-3">
            <Controller
              control={control}
              name="name"
              rules={{
                required: {
                  value: true,
                  message: 'Vui lòng nhập tên dịch vụ',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Tên dịch vụ"
                  required={true}
                  error={errors.name?.message}
                  placeholder="Nhập tên dịch vụ"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <View className="mb-3">
            <Controller
              control={control}
              name="calculationMethod"
              render={({ field: { onChange, value } }) => (
                <ComboBox
                  value={value as any}
                  options={calculationMethodOptions}
                  required={true}
                  onChange={(item) => {
                    onChange(item?.key);
                    setValueForm('helperValue', null);
                  }}
                  renderItem={(item, selected) => _renderItems(item, selected)}
                  isSearch={false}
                  placeholder="Chọn phương thức tính toán"
                  error={errors.calculationMethod?.message}
                  label="Phương thức tính toán"
                  icon={(value, options, visible) => {
                    if (value && !value?.icon) {
                      const findIconInOptions = options.find(
                        (option) => option.key === value,
                      );
                      if (findIconInOptions) {
                        return (
                          <Ionicons
                            name={findIconInOptions.icon as any}
                            size={18}
                            className="mr-3 ml-[-1px]"
                            color={tokens.colors.muted}
                          />
                        );
                      }
                    }
                    if (value?.icon) {
                      return (
                        <Ionicons
                          name={value.icon as any}
                          size={18}
                          className="mr-3 ml-[-1px]"
                          color={tokens.colors.muted}
                        />
                      );
                    }
                    return null;
                  }}
                />
              )}
            />
          </View>

          {_renderHelpInfo()}

          <View className="mb-3">
            <Controller
              control={control}
              name="price"
              rules={{
                validate: (
                  value: number,
                  formValues: ContractServiceDetailResponse,
                ) => {
                  if (
                    formValues.calculationMethod === ServiceCalculateMethod.FREE
                  ) {
                    return true;
                  }
                  if (value > 0) return true;
                  return 'Giá dịch vụ phải lớn hơn 0';
                },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Giá dịch vụ"
                  type="number"
                  disabled={calculationMethod === ServiceCalculateMethod.FREE}
                  required={true}
                  error={errors.price?.message}
                  placeholder="Nhập giá dịch vụ"
                  value={value ? formatCurrency(value.toString()) : ''}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  icon="cash-outline"
                />
              )}
            />
          </View>

          <View className="mb-3">
            <Controller
              control={control}
              name="isEnabled"
              render={({ field: { onChange, value } }) => {
                return (
                  <Switch
                    value={value}
                    alignLabel="horizontal"
                    onValueChange={onChange}
                    label="Sử dụng"
                  />
                );
              }}
            />
          </View>

          <View className="bg-info-surface rounded-2xl p-6 border border-info mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Tóm tắt cấu hình
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between items-center py-2 border-b border-info">
                <Text className="text-base text-gray-600 font-medium">
                  Phương thức:
                </Text>
                <Text className="text-base text-gray-800 font-semibold text-right flex-1">
                  {SERVICE_CALCULATE_METHOD_WITH_INFO[calculationMethod].label}
                </Text>
              </View>

              {helperValue && (
                <View className="flex-row justify-between items-center py-2 border-b border-info">
                  <Text className="text-base text-gray-600 font-medium">
                    Số lượng / Giá trị:
                  </Text>
                  <Text className="text-base text-gray-800 font-semibold text-right flex-1">
                    {helperValue?.toString()}
                  </Text>
                </View>
              )}

              {defaultValues?.calculationMethod !==
                ServiceCalculateMethod.FREE && (
                <View className="flex-row justify-between items-center py-2 border-b border-info">
                  <Text className="text-base text-gray-600 font-medium">
                    Giá dịch vụ:
                  </Text>
                  <Text className="text-base text-gray-800 font-semibold text-right flex-1">
                    {formatCurrency(price?.toString() || '0')} VNĐ
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-base text-gray-600 font-medium">
                  Sử dụng:
                </Text>
                <Text
                  className={`text-base ${
                    isEnabled ? 'text-green-600' : 'text-red-600'
                  } font-semibold text-right flex-1`}
                >
                  {isEnabled ? 'Đang sử dụng' : 'Không sử dụng'}
                </Text>
              </View>
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
});

ContractServiceComponent.displayName = 'ContractServiceComponent';

export default ContractServiceComponent;
