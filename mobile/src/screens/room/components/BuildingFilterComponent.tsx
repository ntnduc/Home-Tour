import { ComboOptionWithExtra } from "@/types/comboOption";
import { PropertyDetail } from "@/types/property";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";
import { tokens } from "@/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  buildings: ComboOptionWithExtra<string | null, string, PropertyDetail>[];
  selectedBuilding?: string | null;
  onSelectedBuiling?: (
    buildingId: string | null,
    building?: PropertyDetail
  ) => void;
};

const BuildingFilterComponent = ({
  buildings,
  selectedBuilding,
  onSelectedBuiling,
}: Props) => {
  const renderBuildingItem = ({
    item,
    index,
  }: {
    item: ComboOptionWithExtra<string, string, PropertyDetail>;
    index: number;
  }) => {
    if (!item.value)
      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.buildingItem,
            selectedBuilding === item.value && styles.selectedBuildingItem,
          ]}
          onPress={() => {
            onSelectedBuiling && onSelectedBuiling(null);
          }}
        >
          <View style={styles.buildingInfo}>
            <Text
              style={[
                styles.buildingName,
                selectedBuilding === item.value && styles.selectedBuildingName,
              ]}
            >
              {item.label}
            </Text>
          </View>
          {selectedBuilding === item.value && (
            <Ionicons name="checkmark-circle" size={20} color={tokens.colors.primary} />
          )}
        </TouchableOpacity>
      );

    const extraData = item.extra;
    if (!extraData)
      return (
        <View>
          <Text>Không có dữ liệu!</Text>
        </View>
      );

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.buildingItem,
          selectedBuilding === item.value && styles.selectedBuildingItem,
        ]}
        onPress={() => {
          onSelectedBuiling && onSelectedBuiling(item.value, extraData);
        }}
      >
        <View style={styles.buildingInfo}>
          <Text
            style={[
              styles.buildingName,
              selectedBuilding === item.value && styles.selectedBuildingName,
            ]}
          >
            {extraData?.name}
          </Text>
          <Text
            style={[
              styles.buildingAddress,
              selectedBuilding === item.value && styles.selectedBuildingAddress,
            ]}
          >
            {extraData?.address}
          </Text>
        </View>
        {selectedBuilding === item.value && (
          <Ionicons name="checkmark-circle" size={20} color={tokens.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const data = [
    {
      value: null,
      label: "Tất cả tòa nhà",
      extra: null,
    },
    ...buildings,
  ];

  return (
    <BottomSheetScrollView>
      {data.map((item: any, index) => renderBuildingItem({ item, index }))}
    </BottomSheetScrollView>
  );
};

const styles = StyleSheet.create({
  selector: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: tokens.palette.gray[300],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectorText: {
    marginLeft: 6,
    flex: 1,
  },
  selectorLabel: {
    fontSize: 10,
    color: tokens.colors.muted,
    marginBottom: 1,
  },
  selectorValue: {
    fontSize: 13,
    fontWeight: "600",
    color: tokens.colors.foreground,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: tokens.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: tokens.colors.foreground,
  },
  closeButton: {
    padding: 4,
  },

  buildingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  selectedBuildingItem: {
    backgroundColor: tokens.colors.primaryMuted,
  },
  buildingInfo: {
    flex: 1,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: "600",
    color: tokens.colors.foreground,
    marginBottom: 4,
  },
  selectedBuildingName: {
    color: tokens.colors.primary,
  },
  buildingAddress: {
    fontSize: 14,
    color: tokens.colors.muted,
    marginBottom: 2,
  },
  selectedBuildingAddress: {
    color: tokens.colors.primary,
  },
  roomCount: {
    fontSize: 12,
    color: tokens.colors.subtle,
  },
  selectedRoomCount: {
    color: tokens.colors.primary,
  },
});

export default BuildingFilterComponent;
