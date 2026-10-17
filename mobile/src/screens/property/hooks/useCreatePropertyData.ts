import {
  getComboDistricts,
  getComboProvinces,
  getComboWards,
} from "@/api/location/location.api";
import { createProperty } from "@/api/property/property.api";
import { getServiceDefault } from "@/api/service/service.api";
import { ServiceCalculateMethod } from "@/constant/service.constant";
import { ComboOption } from "@/types/comboOption";
import { PropertyCreateRequest } from "@/types/property";
import { ServiceCreateOrUpdateRequest } from "@/types/service";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

type LocationOption = ComboOption<string, string>;

/** Coerce numeric form fields (inputs may hold strings/null) before sending. */
const normalizeRequest = (data: PropertyCreateRequest): PropertyCreateRequest => ({
  ...data,
  defaultRoomRent: Number(data.defaultRoomRent) || 0,
  paymentDate: Number(data.paymentDate) || 0,
  services: (data.services ?? []).map((service) => ({
    ...service,
    price:
      service.calculationMethod === ServiceCalculateMethod.FREE
        ? 0
        : Number(service.price) || 0,
  })),
});

/**
 * Data layer for CreatePropertyScreen: loads provinces + default services in
 * parallel, reloads districts/wards on cascade changes and submits the create.
 *
 * `onDefaultServices` seeds the form's service list; `onSuccess` runs after a successful create.
 */
export const useCreatePropertyData = (
  onDefaultServices: (services: ServiceCreateOrUpdateRequest[]) => void,
  onSuccess: () => void,
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [responseProvince, responseServiceDefault] = await Promise.all([
        getComboProvinces(),
        getServiceDefault(),
      ]);
      if (responseProvince.success && responseServiceDefault.success) {
        setCities(responseProvince.data ?? []);
        onDefaultServices(
          (responseServiceDefault.data ?? []).map((service) => ({
            serviceId: service.id,
            isNew: false,
            name: service.name,
            price: service.price,
            calculationMethod: service.calculationMethod,
            icon: service.icon,
            id: "",
          })),
        );
      }
    };
    fetchData()
      .catch(() => {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Không tải được dữ liệu khởi tạo!",
        });
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const submit = async (data: PropertyCreateRequest) => {
    setIsSubmitting(true);
    try {
      await createProperty(normalizeRequest(data));
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Tạo tài sản thành công",
      });
      onSuccess();
    } catch {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Tạo tài sản thất bại",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};
