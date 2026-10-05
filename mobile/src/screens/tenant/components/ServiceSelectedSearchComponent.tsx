import { getListService } from "@/api/service/service.api";
import AutocompleteInput from "@/components/AutocompleteInput";
import { ServiceCalculateMethod } from "@/constant/service.constant";
import { createStyles } from "@/styles/component/StyleComboBox";
import { useTheme } from "@/theme/ThemeProvider";
import { ServiceCreateOrUpdateRequest } from "@/types/service";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { tokens } from "@/theme";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const ServiceSelectedSearchComponent = ({
  value,
  service,
  error,
  onChange,
}: {
  value?: string;
  service?: ServiceCreateOrUpdateRequest;
  error?: string;
  onChange: (services: ServiceCreateOrUpdateRequest | string) => void;
}) => {
  const ICON_DEFAULT = "apps-outline";

  const theme = useTheme();
  const styles = createStyles(theme);

  const [search, setSearch] = useState("");
  const [serviceSelected, setServiceSelected] = useState<
    ServiceCreateOrUpdateRequest | null | undefined
  >(service);
  const [hideResults, setHideResults] = useState(true);

  const onSelectedService = (service: any) => {
    setServiceSelected(service);
    setHideResults(true);
    onChange({
      name: service?.name ?? service,
      ...service,
      serviceId: service?.id ?? null,
      id: null,
      price:
        service.calculationMethod === ServiceCalculateMethod.FREE
          ? 0
          : undefined,
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["services", search],
    queryFn: () =>
      getListService({
        limit: 5,
        offset: 0,
        globalKey: search,
      }),
    staleTime: 1000 * 60 * 2,
  });

  const handleChangeText = (text: string) => {
    setSearch(text);
    if (service) {
      setServiceSelected({ ...service, name: text });
      onChange({ ...service, name: text });
    } else {
      onChange(text);
    }

    if (data?.data?.items && data?.data?.items?.length > 0) {
      setHideResults(false);
    } else {
      setHideResults(true);
    }
  };

  useEffect(() => {
    if (data?.data?.items?.length === 0) {
      setHideResults(false);
    }
  }, [data]);

  return (
    <AutocompleteInput
      hideResults={hideResults}
      onChangeText={handleChangeText}
      value={value}
      placeholder="Nhập tên dịch vụ"
      error={error}
      data={data?.data?.items ?? []}
      returnKeyType="done"
      onSubmitEditing={() => {
        setHideResults(true);
      }}
      icon={service && service?.icon ? (service.icon as any) : ICON_DEFAULT}
      iconProps={{
        color: tokens.colors.primary,
      }}
      renderResultList={(list: any) => {
        const flatData = list?.data;
        return (
          <View style={styles.dropdownContainer}>
            <ScrollView style={{ maxHeight: 250 }}>
              {flatData.map((option: any) => (
                <TouchableOpacity
                  className="flex flex-row items-center"
                  key={String(option.id)}
                  style={[styles.item]}
                  onPress={() => onSelectedService(option)}
                >
                  <Ionicons
                    className="mr-3"
                    name={option?.icon ? option?.icon : ICON_DEFAULT}
                    size={20}
                    color={tokens.colors.primary}
                  />
                  <Text style={[styles.itemText]}>{option.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
      }}
    />
  );
};

export default ServiceSelectedSearchComponent;
