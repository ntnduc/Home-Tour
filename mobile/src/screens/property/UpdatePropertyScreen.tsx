/**
 * UPDATE PROPERTY SCREEN — Modern Minimalist redesign.
 *
 * Layout (stack header + keyboard-aware form on muted canvas):
 * ```
 * FormScreen (canvas · gutter 20 · gap 12 · keyboard-safe)
 * ┌──────────────────────────────────────────────┐
 * │ Summary card: ▣ name · 📍 address · chips     │  live preview (soft · radius 24)
 * ├──────────────────────────────────────────────┤
 * │ ▣ Thông tin chung       — tên gợi nhớ         │
 * │ ▣ Địa chỉ               — tỉnh/quận/phường/…  │
 * │ ▣ Thiết lập cho thuê    — giá · ngày · tầng   │
 * │ ▣ Dịch vụ thu phí [+]   — service tiles       │  tile bg canvas · radius 20
 * └──────────────────────────────────────────────┘
 * ActionButtonBottom "Cập nhật" (sticky, safe-area aware)
 * ```
 *
 * States:
 * - **Loading (first)**: PropertyFormSkeleton (summary + section shapes)
 * - **Not found / location error**: Toast + go back (handled in the hook)
 * - **Submitting**: form stays visible, submit button shows spinner + disabled
 * - **No services**: friendly inline empty line inside the services section
 */

import ActionButtonBottom from "@/components/ActionButtonBottom";
import AddButton from "@/components/AddButton";
import CalculationMethodPicker from "@/components/CalculationMethodPicker";
import { ComboBox } from "@/components/ComboBox";
import FormScreen from "@/components/FormScreen";
import FormSection from "@/components/FormSection";
import InputBase from "@/components/Input";
import ScreenHeader from "@/components/ScreenHeader";
import ServiceSearchInput from "@/components/ServiceSearchInput";
import { ServiceCalculateMethod } from "@/constant/service.constant";
import { RootStackParamList } from "@/navigation/types";
import { tokens } from "@/theme";
import { PropertyUpdateRequest } from "@/types/property";
import { ServiceCreateOrUpdateRequest } from "@/types/service";
import { formatCurrency, generateId } from "@/utils/appUtil";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyEditSummary from "./components/PropertyEditSummary";
import PropertyFormSkeleton from "./components/PropertyFormSkeleton";
import PropertyServiceItem from "./components/PropertyServiceItem";
import { useUpdatePropertyData } from "./hooks/useUpdatePropertyData";
import { PROP_SPACE, propColors, propType } from "./propertyListStyles";

type UpdatePropertyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "UpdateProperty">;
  route: RouteProp<RootStackParamList, "UpdateProperty">;
};

type LocationField = "provinceCode" | "districtCode" | "wardCode";

const UpdatePropertyScreen = ({
  navigation,
  route,
}: UpdatePropertyScreenProps) => {
  const [activeDropdown, setActiveDropdown] = useState<LocationField | null>(
    null,
  );

  const {
    isLoading,
    isSubmitting,
    initialData,
    cities,
    districts,
    wards,
    isLoadingDistricts,
    isLoadingWards,
    loadDistricts,
    loadWards,
    submit,
  } = useUpdatePropertyData(route.params.propertyId, () => navigation.goBack());

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
    name: "services",
    keyName: "fieldId",
  });

  const handleAddService = () => {
    prepend({
      serviceId: "",
      fieldId: generateId(),
      isNew: true,
      name: "",
      price: 0,
      calculationMethod: ServiceCalculateMethod.FIXED_PER_ROOM,
    });
  };

  const handleRemoveService = (
    index: number,
    service: ServiceCreateOrUpdateRequest,
  ) => {
    const removeServiceIds = getValues("removeServiceIds") || [];
    if (!service.isNew && service.id) {
      setValue("removeServiceIds", [...removeServiceIds, service.id]);
    }
    remove(index);
  };

  const onError = () => {
    Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
  };

  const header = (
    <ScreenHeader
      title="Cập nhật tài sản"
      // subtitle="Chỉnh sửa thông tin"
      onBack={() => navigation.goBack()}
      insetTop
    />
  );

  if (isLoading)
    return (
      <SafeAreaView edges={[]} style={styles.screen}>
        {header}
        <PropertyFormSkeleton />
      </SafeAreaView>
    );

  const [name, address, numberFloor] = watch([
    "name",
    "address",
    "numberFloor",
  ]);

  const footer = (
    <ActionButtonBottom
      actions={[
        {
          label: "Cập nhật",
          onPress: handleSubmit(submit, onError),
          variant: "primary",
          isLoading: isSubmitting,
          disabled: isSubmitting,
          icon: "checkmark-circle",
        },
      ]}
    />
  );

  return (
    <SafeAreaView edges={[]} style={styles.screen}>
      {header}
      <FormScreen footer={footer}>
        <PropertyEditSummary
          name={name}
          address={address}
          numberFloor={numberFloor ? Number(numberFloor) : undefined}
          serviceCount={services.length}
        />

        <FormSection
          title="Thông tin chung"
          icon="information-circle-outline"
          caption="Tên giúp bạn nhận ra tài sản nhanh hơn"
        >
          <Controller
            control={control}
            name="name"
            rules={{ required: "Vui lòng nhập tên gợi nhớ" }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                placeholder="Nhập tên gợi nhớ"
                value={value}
                onChangeText={onChange}
                label="Tên gợi nhớ"
                required={true}
                error={errors.name?.message}
              />
            )}
          />
        </FormSection>

        <FormSection
          title="Địa chỉ"
          icon="location-outline"
          caption="Vị trí hiển thị trên hợp đồng và hóa đơn"
        >
          <Controller
            control={control}
            name="provinceCode"
            rules={{ required: "Vui lòng chọn thành phố/tỉnh" }}
            render={({ field: { onChange, value } }) => (
              <ComboBox
                value={value}
                options={cities}
                onChange={(option) => {
                  onChange(option?.value ?? "");
                  loadDistricts(option?.value ?? "");
                }}
                isLoading={isLoadingDistricts}
                placeholder="Chọn thành phố/tỉnh"
                error={errors.provinceCode?.message}
                onFocus={() => setActiveDropdown("provinceCode")}
                isActive={activeDropdown === "provinceCode"}
                label="Thành phố / Tỉnh"
              />
            )}
          />
          <Controller
            control={control}
            name="districtCode"
            rules={{ required: "Vui lòng chọn quận/huyện" }}
            render={({ field: { onChange, value } }) => (
              <ComboBox
                value={value}
                options={districts}
                onChange={(option) => {
                  onChange(option?.value ?? "");
                  loadWards(option?.value ?? "");
                }}
                isLoading={isLoadingWards}
                placeholder="Chọn quận/huyện"
                error={errors.districtCode?.message}
                onFocus={() => setActiveDropdown("districtCode")}
                isActive={activeDropdown === "districtCode"}
                label="Quận / Huyện"
              />
            )}
          />
          <Controller
            control={control}
            name="wardCode"
            rules={{ required: "Vui lòng chọn phường/xã" }}
            render={({ field: { onChange, value } }) => (
              <ComboBox
                value={value}
                options={wards}
                onChange={(option) => onChange(option?.value ?? "")}
                placeholder="Chọn phường/xã"
                error={errors.wardCode?.message}
                onFocus={() => setActiveDropdown("wardCode")}
                isActive={activeDropdown === "wardCode"}
                label="Phường / Xã"
              />
            )}
          />
          <Controller
            control={control}
            name="address"
            rules={{ required: "Vui lòng nhập địa chỉ chi tiết" }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                placeholder="Số nhà, tên đường…"
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
        </FormSection>

        <FormSection
          title="Thiết lập cho thuê"
          icon="cash-outline"
          caption="Giá trị mặc định áp dụng khi tạo phòng mới"
        >
          <Controller
            control={control}
            name="defaultRoomRent"
            rules={{ required: "Vui lòng nhập giá thuê mặc định" }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                label="Giá thuê mặc định"
                required={true}
                placeholder="Nhập giá thuê mặc định"
                value={value ? formatCurrency(value.toString()) : ""}
                onChangeText={onChange}
                keyboardType="numeric"
                error={errors.defaultRoomRent?.message}
              />
            )}
          />
          <View style={styles.fieldRow}>
            <View style={styles.fieldCol}>
              <Controller
                control={control}
                name="paymentDate"
                rules={{ required: "Vui lòng nhập ngày thanh toán" }}
                render={({ field: { onChange, value } }) => (
                  <InputBase
                    label="Ngày thanh toán"
                    required={true}
                    placeholder="VD: 5"
                    value={value?.toString()}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    error={errors.paymentDate?.message}
                  />
                )}
              />
            </View>
            <View style={styles.fieldCol}>
              <Controller
                control={control}
                name="numberFloor"
                render={({ field: { onChange, value } }) => (
                  <InputBase
                    label="Số tầng"
                    placeholder="VD: 3"
                    value={value?.toString()}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    error={errors.numberFloor?.message}
                  />
                )}
              />
            </View>
          </View>
        </FormSection>

        <FormSection
          title="Dịch vụ thu phí"
          icon="flash-outline"
          caption={
            services.length > 0
              ? `${services.length} dịch vụ`
              : "Điện, nước, internet, rác…"
          }
          action={
            <AddButton
              label="Thêm"
              variant="soft"
              onPress={handleAddService}
              accessibilityLabel="Thêm dịch vụ"
            />
          }
        >
          {services.length === 0 ? (
            <View style={styles.emptyRow}>
              <Ionicons
                name="receipt-outline"
                size={18}
                color={propColors.textSubtle}
              />
              <Text style={[propType.caption, styles.emptyText]}>
                Chưa có dịch vụ nào. Nhấn “Thêm” để thiết lập phí.
              </Text>
            </View>
          ) : (
            services.map((service, index) => (
              <PropertyServiceItem
                key={service.fieldId || String(index)}
                index={index}
                onRemove={() => handleRemoveService(index, service)}
              >
                <Controller
                  control={control}
                  name={`services.${index}.name`}
                  render={({ field: { value } }) => (
                    <ServiceSearchInput
                      value={value}
                      service={service}
                      onChange={(newService) => {
                        if (typeof newService === "string") {
                          setValue(`services.${index}.name`, newService);
                        } else {
                          setValue(`services.${index}`, newService);
                        }
                      }}
                      error={errors.services?.[index]?.name?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`services.${index}.price`}
                  rules={{ required: "Vui lòng nhập giá dịch vụ" }}
                  render={({ field: { value } }) => {
                    const isFree =
                      watch(`services.${index}.calculationMethod`) ===
                      ServiceCalculateMethod.FREE;
                    return (
                      <InputBase
                        placeholder="Giá"
                        disabled={isFree}
                        icon="cash-outline"
                        iconProps={{ color: tokens.colors.primary }}
                        value={
                          isFree
                            ? "0"
                            : value
                              ? formatCurrency(value.toString())
                              : ""
                        }
                        onChangeText={(text) => {
                          const numericValue = text.replace(/[^0-9]/g, "");
                          setValue(
                            `services.${index}.price`,
                            Number(numericValue),
                          );
                        }}
                        keyboardType="numeric"
                        error={errors.services?.[index]?.price?.message}
                      />
                    );
                  }}
                />
                <Controller
                  control={control}
                  name={`services.${index}.calculationMethod`}
                  render={({ field: { value, onChange } }) => (
                    <CalculationMethodPicker
                      value={value}
                      onChange={(newMethod) => {
                        onChange(newMethod);
                        if (newMethod === ServiceCalculateMethod.FREE) {
                          setValue(`services.${index}.price`, 0);
                        }
                      }}
                    />
                  )}
                />
              </PropertyServiceItem>
            ))
          )}
        </FormSection>
      </FormScreen>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: propColors.canvas,
  },
  fieldRow: {
    flexDirection: "row",
    gap: PROP_SPACE.gap,
  },
  fieldCol: {
    flex: 1,
  },
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: propColors.canvas,
  },
  emptyText: {
    flex: 1,
  },
});

export default UpdatePropertyScreen;
