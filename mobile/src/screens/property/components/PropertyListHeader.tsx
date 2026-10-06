/**
 * Fixed header for PropertyListScreen.
 *
 * Layout:
 * ```
 * ┌──────────────────────────────────────────────┐
 * │ Tài sản              ┌──────────┐            │
 * │ 12 tài sản           │ + Thêm   │            │  AddButton (solid, primary)
 * │                      └──────────┘            │
 * └──────────────────────────────────────────────┘
 * ```
 *
 * Always visible above the FlatList; does not scroll.
 */

import { tokens } from "@/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AddButton from "@/components/AddButton";
import SearchField from "@/components/SearchField";
import { PROP_SPACE, propColors, propType } from "../propertyListStyles";

export interface PropertyListHeaderProps {
  total?: number;
  isLoading: boolean;
  onPressCreate: () => void;
  onSearch: (value: string) => void;
}

/**
 * PropertyListHeader — fixed section above FlatList.
 *
 * Row 1: Title + count caption + create button
 * Row 2: Search field
 *
 * Count caption shows "—" while `isLoading`; uses server-side `total`
 * (not a sum of loaded pages, which would be wrong for pagination).
 */
const PropertyListHeader = ({
  total,
  isLoading,
  onPressCreate,
  onSearch,
}: PropertyListHeaderProps) => (
  <View style={styles.container}>
    {/* Row 1: Title + count + Add button */}
    <View style={styles.titleRow}>
      <View style={styles.titleCol}>
        <Text style={propType.title}>Tài sản</Text>
        <Text style={propType.caption}>
          {isLoading ? "—" : `${total ?? 0} tài sản`}
        </Text>
      </View>
      <AddButton
        label="Thêm"
        icon="add"
        variant="solid"
        onPress={onPressCreate}
        accessibilityLabel="Thêm tài sản"
      />
    </View>

    {/* Row 2: Search field */}
    <SearchField placeholder="Tìm theo tên hoặc địa chỉ…" onSearch={onSearch} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PROP_SPACE.screen,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 14,
    backgroundColor: propColors.canvas,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleCol: {
    flex: 1,
  },
});

export default PropertyListHeader;
