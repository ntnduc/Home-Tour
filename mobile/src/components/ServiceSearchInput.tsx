import { getListService } from "@/api/service/service.api";
import AutocompleteInput from "./AutocompleteInput";
import ListRow from "./ListRow";
import { ServiceCalculateMethod } from "@/constant/service.constant";
import { ServiceCreateOrUpdateRequest } from "@/types/service";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { shadows, tokens, uiColors, uiRadius } from "@/theme";
import { ScrollView, StyleSheet, View } from "react-native";

/**
 * Service name field with search-as-you-type suggestions (top 5 matches).
 * Picking a suggestion fills the whole service (id, icon, method, price).
 */
const ServiceSearchInput = ({
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
      renderResultList={(list: any) => (
        <View style={styles.dropdown}>
          <ScrollView style={styles.dropdownScroll} keyboardShouldPersistTaps="handled">
            {(list?.data ?? []).map((option: any, index: number) => (
              <ListRow
                key={String(option.id)}
                divider={index > 0}
                icon={option?.icon ? option.icon : ICON_DEFAULT}
                title={option.name}
                onPress={() => onSelectedService(option)}
              />
            ))}
          </ScrollView>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    marginTop: 6,
    borderRadius: uiRadius.field,
    backgroundColor: uiColors.card,
    overflow: "hidden",
    ...shadows.medium,
  },
  dropdownScroll: {
    maxHeight: 250,
  },
});

export default ServiceSearchInput;
