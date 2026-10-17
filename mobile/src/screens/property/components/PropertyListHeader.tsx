/**
 * Header for PropertyListScreen — `ScreenHeader` preset with the property count
 * and the "+ Thêm" create action.
 */

import AddButton from "@/components/AddButton";
import ScreenHeader from "@/components/ScreenHeader";
import React from "react";
import { type SharedValue } from "react-native-reanimated";

export interface PropertyListHeaderProps {
  total?: number;
  isLoading: boolean;
  onPressCreate: () => void;
  onSearch: (value: string) => void;
  /** Global body scroll offset — drives the header's bottom separator shadow. */
  scrollY: SharedValue<number>;
}

/** Count caption shows "—" while loading; uses the server-side `total`. */
const PropertyListHeader = ({
  total,
  isLoading,
  onPressCreate,
  onSearch,
  scrollY,
}: PropertyListHeaderProps) => (
  <ScreenHeader
    title="Tài sản"
    subtitle={isLoading ? "—" : `${total ?? 0} tài sản`}
    scrollY={scrollY}
    search={{ placeholder: "Tìm theo tên hoặc địa chỉ…", onSearch }}
    action={
      <AddButton
        label="Thêm"
        icon="add"
        variant="solid"
        onPress={onPressCreate}
        accessibilityLabel="Thêm tài sản"
      />
    }
  />
);

export default PropertyListHeader;
