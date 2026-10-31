import DisplayField from "@/components/DisplayField";
import { fieldStyles } from "@/components/FormField";
import IconButton from "@/components/IconButton";
import StatusBadge from "@/components/StatusBadge";
import { uiColors, uiRadius, uiSpace, uiType } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

// Components
import AppSheetScrollView, {
  SHEET_FOOTER_CLEARANCE,
} from "@/components/AppSheet/AppSheetScrollView";
import Input from "@/components/Input";

// Types & Constants
import ActionButtonBottom from "@/components/ActionButtonBottom";
import AppSheet, { AppSheetRef } from "@/components/AppSheet/AppSheet";
import { ComboBox } from "@/components/ComboBox";
import { Switch } from "@/components/Switch";
import {
  SERVICE_CALCULATE_METHOD_WITH_INFO,
  ServiceCalculateMethod,
} from "@/constant/service.constant";
import { ContractServiceDetailResponse } from "@/types/contract-service";
import { formatCurrency } from "@/utils/appUtil";
import {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Controller, useForm } from "react-hook-form";

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
  const bottomSheetRef = useRef<AppSheetRef>(null);
  const [index, setIndex] = useState<number>(0);

  const {
    control,
    handleSubmit,
    watch,
    setValue: setValueForm,
    reset,
    formState: { errors, defaultValues },
  } = useForm<ContractServiceDetailResponse>({
    defaultValues: {
      name: "",
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
    },
    expand: (service: ContractServiceDetailResponse, index: number) => {
      reset();
      setIndex(index);
      service?.name && setValueForm("name", service.name);
      setValueForm(
        "calculationMethod",
        service.calculationMethod ?? ServiceCalculateMethod.PER_UNIT_SIMPLE,
      );
      if (service.calculationMethod === ServiceCalculateMethod.FREE) {
        setValueForm("price", 0);
      } else {
        setValueForm("price", service.price);
      }
      setValueForm("isEnabled", service.isEnabled);
      setValueForm("helperValue", service.helperValue);

      bottomSheetRef.current?.open();
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

  const calculationMethod = watch("calculationMethod");
  const price = watch("price");
  const isEnabled = watch("isEnabled");
  const helperValue = watch("helperValue");

  const _renderItems = useCallback(
    (item: CalculationMethodOption, selected?: boolean) => {
      return (
        <View
          style={{
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            height: 50,
            paddingHorizontal: 10,
          }}
        >
          <View style={sheetStyles.itemRow}>
            <Ionicons
              name={item.icon as any}
              size={17}
              color={uiColors.textMuted}
            />
            <Text style={fieldStyles.text}>{item.label}</Text>
          </View>
          <IconButton
            icon="information-circle-outline"
            tone="info"
            size="sm"
            onPress={() => {
              Alert.alert(
                "Thông tin",
                SERVICE_CALCULATE_METHOD_WITH_INFO[item.key].info,
              );
            }}
            accessibilityLabel={`Giải thích: ${item.label}`}
          />
        </View>
      );
    },
    [],
  );

  const _renderHelpInfo = useCallback(() => {
    switch (calculationMethod) {
      case ServiceCalculateMethod.PER_UNIT_SIMPLE:
        return (
          <View>
            <Controller
              control={control}
              name="helperValue"
              rules={{
                required: {
                  value: true,
                  message: "Nhập số hiện tại",
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
          <View>
            <Controller
              control={control}
              name="helperValue"
              rules={{
                required: {
                  value: true,
                  message: "Nhập số lượng",
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
              label: "Xác nhận",
              onPress: handleSubmit(
                (value) => {
                  onSuccess?.(value, index);
                  bottomSheetRef.current?.close();
                },
                (erroes) => {
                  // TODO: Do nothing
                },
              ),
              variant: "success",
            },
          ]}
        />
      </BottomSheetFooter>
    ),
    [index],
  );

  return (
    <AppSheet
      ref={bottomSheetRef}
      snapPoints={["75%"]}
      header={{ title: "Cập nhật dịch vụ", height: 60 }}
      renderFooter={_renderFooter}
    >
      <AppSheetScrollView contentContainerStyle={sheetStyles.body}>
        <View>
          <Controller
            control={control}
            name="name"
            rules={{
              required: {
                value: true,
                message: "Vui lòng nhập tên dịch vụ",
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                inputComponent={BottomSheetTextInput}
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

        <View>
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
                  setValueForm("helperValue", null);
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
                          style={sheetStyles.leftIcon}
                          color={uiColors.textMuted}
                        />
                      );
                    }
                  }
                  if (value?.icon) {
                    return (
                      <Ionicons
                        name={value.icon as any}
                        size={18}
                        style={sheetStyles.leftIcon}
                        color={uiColors.textMuted}
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

        <View>
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
                return "Giá dịch vụ phải lớn hơn 0";
              },
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                inputComponent={BottomSheetTextInput}
                label="Giá dịch vụ"
                type="number"
                disabled={calculationMethod === ServiceCalculateMethod.FREE}
                required={true}
                error={errors.price?.message}
                placeholder="Nhập giá dịch vụ"
                value={value ? formatCurrency(value.toString()) : ""}
                onChangeText={onChange}
                keyboardType="numeric"
                icon="cash-outline"
              />
            )}
          />
        </View>

        <View>
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

        <View style={sheetStyles.summary}>
          <Text style={uiType.eyebrow}>Tóm tắt cấu hình</Text>
          <DisplayField
            label="Phương thức"
            value={SERVICE_CALCULATE_METHOD_WITH_INFO[calculationMethod].label}
            strong
          />
          {helperValue && (
            <DisplayField
              label="Số lượng / Giá trị"
              value={helperValue?.toString()}
              strong
            />
          )}
          {defaultValues?.calculationMethod !== ServiceCalculateMethod.FREE && (
            <DisplayField
              label="Giá dịch vụ"
              value={`${formatCurrency(price?.toString() || "0")}đ`}
              strong
            />
          )}
          <DisplayField
            compact
            label="Sử dụng"
            value={
              <StatusBadge
                size="sm"
                tone={isEnabled ? "success" : "error"}
                label={isEnabled ? "Đang sử dụng" : "Không sử dụng"}
              />
            }
          />
        </View>
      </AppSheetScrollView>
    </AppSheet>
  );
});

ContractServiceComponent.displayName = "ContractServiceComponent";

const sheetStyles = StyleSheet.create({
  body: {
    padding: uiSpace.screen,
    paddingBottom: SHEET_FOOTER_CLEARANCE,
    gap: uiSpace.gap,
  },
  itemRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  leftIcon: {
    marginRight: 10,
  },
  summary: {
    gap: 4,
    padding: 16,
    borderRadius: uiRadius.tile,
    backgroundColor: uiColors.canvas,
  },
});

export default ContractServiceComponent;
