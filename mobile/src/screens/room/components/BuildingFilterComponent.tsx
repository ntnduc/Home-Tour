import ListRow from "@/components/ListRow";
import { ComboOptionWithExtra } from "@/types/comboOption";
import { PropertyDetail } from "@/types/property";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React from "react";

type Props = {
  buildings: ComboOptionWithExtra<string, string, PropertyDetail>[];
  selectedBuilding?: string | null;
  onSelectedBuiling?: (buildingId: string | null, building?: PropertyDetail) => void;
};

/** Bottom-sheet picker: "Tất cả tòa nhà" + one `ListRow` per property (check on selected). */
const BuildingFilterComponent = ({ buildings, selectedBuilding, onSelectedBuiling }: Props) => (
  <BottomSheetScrollView>
    <ListRow
      title="Tất cả tòa nhà"
      icon="apps-outline"
      trailing="check"
      selected={!selectedBuilding}
      onPress={() => onSelectedBuiling?.(null)}
    />
    {buildings
      .filter((item) => item.value && item.extra)
      .map((item) => {
        const building = item.extra ?? undefined;
        return (
          <ListRow
            key={item.value}
            divider
            title={building?.name ?? item.label ?? ""}
            subtitle={building?.address}
            icon="business-outline"
            trailing="check"
            selected={selectedBuilding === item.value}
            onPress={() => onSelectedBuiling?.(item.value, building)}
          />
        );
      })}
  </BottomSheetScrollView>
);

export default BuildingFilterComponent;
