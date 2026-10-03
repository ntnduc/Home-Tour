// @ts-nocheck
import {
  getComboDistricts,
  getComboProvinces,
  getComboWards,
} from '@/api/location/location.api';
import Loading from '@/components/Loading';
import { ServiceCalculateMethod } from '@/constant/service.constant';
import { createStyles } from '@/styles/StyleCreateTenantScreen';
import { ComboOption } from '@/types/comboOption';
import { PropertyCreateRequest } from '@/types/property';
import { generateId } from '@/utils/appUtil';
import React, { useEffect, useState } from 'react';
import { FieldErrors, useFieldArray, useForm } from 'react-hook-form';

import { createProperty } from '@/api/property/property.api';
import { getServiceDefault } from '@/api/service/service.api';
import ActionButtonBottom from '@/components/ActionButtonBottom';
import { useTheme } from '@/theme/ThemeProvider';
import { ServiceCreateOrUpdateRequest } from '@/types/service';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../../navigation/types';
import PropertyAddressSection from './components/PropertyAddressSection';
import PropertyBasicInfoSection from './components/PropertyBasicInfoSection';
import PropertyPricingSection from './components/PropertyPricingSection';
import PropertyServiceSection from './components/PropertyServiceSection';

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
        <PropertyBasicInfoSection control={control} errors={errors} />

        <PropertyAddressSection
          control={control}
          errors={errors}
          cities={cities}
          districts={location}
          wards={wards}
          isLoadingDistricts={isLoadingDistricts}
          isLoadingWard={isLoadingWard}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          onProvinceChange={getDistricts}
          onDistrictChange={getWards}
          showMap
        />

        <PropertyPricingSection
          control={control}
          errors={errors}
          showTotalRoom
        />

        <PropertyServiceSection
          control={control}
          errors={errors}
          services={services}
          setValue={setValue}
          watch={watch}
          onAdd={handleAddService}
          onRemove={(index) => handleRemoveService(index)}
        />
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
