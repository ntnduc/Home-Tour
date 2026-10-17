import {
  getComboDistricts,
  getComboProvinces,
  getComboWards,
} from "@/api/location/location.api";
import { getProperty, updateProperty } from "@/api/property/property.api";
import { ComboOption } from "@/types/comboOption";
import {
  mapPropertyDetailToUpdateRequest,
  PropertyUpdateRequest,
} from "@/types/property";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

type LocationOption = ComboOption<string, string>;

/**
 * Data layer for UpdatePropertyScreen: loads the property + its location combos
 * in parallel, reloads districts/wards on cascade changes and submits the update.
 *
 * `onExit` is called when the property cannot be loaded or after a successful update.
 */
export const useUpdatePropertyData = (propertyId: string, onExit: () => void) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [initialData, setInitialData] = useState<PropertyUpdateRequest>();
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const responseForm = await getProperty(propertyId);
      if (!responseForm?.data || !responseForm?.success) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không tìm thấy thông tin!",
        });
        onExit();
        return;
      }
      const formData = mapPropertyDetailToUpdateRequest(responseForm.data);
      setInitialData(formData);

      try {
        const [responseProvince, responseDistricts, responseWards] =
          await Promise.all([
            getComboProvinces(),
            getComboDistricts(formData.provinceCode),
            getComboWards(formData.districtCode),
          ]);
        setCities(responseProvince.data || []);
        setDistricts(responseDistricts.data || []);
        setWards(responseWards.data || []);
      } catch {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không lấy được vị trí!",
        });
        onExit();
      }
    };
    fetchData()
      .catch(() => {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không tìm thấy thông tin!",
        });
        onExit();
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const loadDistricts = async (provinceCode: string) => {
    setIsLoadingDistricts(true);
    setIsLoadingWards(true);
    const response = await getComboDistricts(provinceCode);
    setDistricts(response.success ? (response.data ?? []) : []);
    setWards([]);
    setIsLoadingDistricts(false);
    setIsLoadingWards(false);
  };

  const loadWards = async (districtCode: string) => {
    setIsLoadingWards(true);
    const response = await getComboWards(districtCode);
    if (response.success) {
      setWards(response.data ?? []);
    }
    setIsLoadingWards(false);
  };

  const submit = async (data: PropertyUpdateRequest) => {
    setIsSubmitting(true);
    try {
      const res = await updateProperty(propertyId, data);
      if (res.success) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Cập nhật tài sản thành công!",
        });
        onExit();
      } else {
        Toast.show({ type: "error", text1: "Lỗi", text2: res.message });
      }
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: message ?? "Cập nhật tài sản thất bại!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};
