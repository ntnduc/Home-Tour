/**
 * CREATE PROPERTY SCREEN — Modern Minimalist redesign (mirrors UpdatePropertyScreen).
 *
 * Layout (stack header + keyboard-aware form on muted canvas):
 * ```
 * FormScreen (canvas · gutter 20 · gap 12 · keyboard-safe)
 * ┌──────────────────────────────────────────────┐
 * │ Summary card: ▣ name · 📍 address · chips     │  live preview (soft · radius 24)
 * ├──────────────────────────────────────────────┤
 * │ ▣ Thông tin chung       — tên gợi nhớ         │
 * │ ▣ Địa chỉ               — tỉnh/quận/phường/…  │
 * │ ▣ Thiết lập cho thuê    — giá · ngày · phòng · tầng
 * │ ▣ Dịch vụ thu phí [+]   — service tiles       │  pre-filled with default services
 * └──────────────────────────────────────────────┘
 * ActionButtonBottom "Tạo tài sản" (sticky, safe-area aware)
 * ```
 *
 * States:
 * - **Loading (first)**: PropertyFormSkeleton
 * - **Init error**: Toast; form stays usable (empty combos / services)
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
import { PropertyCreateRequest } from "@/types/property";
import { formatCurrency, generateId } from "@/utils/appUtil";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PropertyEditSummary from "./components/PropertyEditSummary";
import PropertyFormSkeleton from "./components/PropertyFormSkeleton";
import PropertyServiceItem from "./components/PropertyServiceItem";
import { useCreatePropertyData } from "./hooks/useCreatePropertyData";
import { PROP_SPACE, propColors, propType } from "./propertyListStyles";

type CreatePropertyScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "CreateProperty">;
};

type LocationField = "provinceCode" | "districtCode" | "wardCode";

/** Keep digits only; empty → null so `required` rules still trigger. */
const toPositiveInt = (text: string): number | null => {
  const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
  return num ? num : null;
};

const CreatePropertyScreen = ({ navigation }: CreatePropertyScreenProps) => {
  const [activeDropdown, setActiveDropdown] = useState<LocationField | null>(
    null,
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyCreateRequest>({
    defaultValues: {
      name: "",
      defaultRoomRent: 5000000,
      paymentDate: 5,
      services: [],
    },
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

  const {
    isLoading,
    isSubmitting,
    cities,
    districts,
    wards,
    isLoadingDistricts,
    isLoadingWards,
    loadDistricts,
    loadWards,
    submit,
  } = useCreatePropertyData(
    (defaultServices) => setValue("services", defaultServices),
    () => navigation.goBack(),
  );

  const handleAddService = () => {
    prepend({
      serviceId: "",
      fieldId: generateId(),
      isNew: true,
      name: "",
      price: 0,
      calculationMethod: ServiceCalculateMethod.FIXED_PER_ROOM,
      icon: "apps-outline",
    });
  };

  const onError = () => {
    Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
  };

  const header = (
    <ScreenHeader
      title="Tạo tài sản"
      // subtitle="Thêm tài sản mới"
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

  const [name, address, numberFloor, totalRoom] = watch([
    "name",
    "address",
    "numberFloor",
    "totalRoom",
  ]);

  const footer = (
    <ActionButtonBottom
      actions={[
        {
          label: "Tạo tài sản",
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
          totalRoom={totalRoom ? Number(totalRoom) : 0}
          serviceCount={services.length}
          placeholderName="Tài sản mới"
        />

        <FormSection
          title="Thông tin chung"
          icon="information-circle-outline"
          caption="Tên giúp bạn nhận ra tài sản nhanh hơn"
        >
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
                required={true}
                onChange={(option) => {
                  onChange(option?.value ?? "");
                  loadDistricts(option?.value ?? "");
                }}
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
                required={true}
                onChange={(option) => {
                  onChange(option?.value ?? "");
                  loadWards(option?.value ?? "");
                }}
                isLoading={isLoadingDistricts}
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
                required={true}
                onChange={(option) => onChange(option?.value ?? "")}
                isLoading={isLoadingWards}
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
                onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ""))}
                keyboardType="numeric"
                error={errors.defaultRoomRent?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="paymentDate"
            rules={{ required: "Vui lòng nhập ngày thanh toán" }}
            render={({ field: { onChange, value } }) => (
              <InputBase
                label="Ngày thanh toán (1–31)"
                required={true}
                placeholder="VD: 5"
                value={value ? value.toString() : ""}
                onChangeText={(text) => {
                  const num = toPositiveInt(text);
                  if (num === null || num <= 31) onChange(num);
                }}
                keyboardType="numeric"
                error={errors.paymentDate?.message}
              />
            )}
          />
          <View style={styles.fieldRow}>
            <View style={styles.fieldCol}>
              <Controller
                control={control}
                name="totalRoom"
                rules={{ required: "Vui lòng nhập số phòng" }}
                render={({ field: { onChange, value } }) => (
                  <InputBase
                    label="Số phòng"
                    required={true}
                    placeholder="VD: 10"
                    value={value ? value.toString() : ""}
                    onChangeText={(text) => onChange(toPositiveInt(text))}
                    keyboardType="numeric"
                    error={errors.totalRoom?.message}
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
                    value={value ? value.toString() : ""}
                    onChangeText={(text) => onChange(toPositiveInt(text))}
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
                onRemove={() => remove(index)}
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

export default CreatePropertyScreen;
