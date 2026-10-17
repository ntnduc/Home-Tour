import Chip from "@/components/Chip";
import { HomepagePropertyOption } from "@/types/homepage";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { HOME_SPACE } from "../homeStyles";

type Props = {
  properties: HomepagePropertyOption[];
  selectedId?: string;
  onSelect: (id?: string) => void;
};

/**
 * Hàng chip lọc tài sản cuộn ngang ("Tất cả" + từng tài sản).
 * Chip đang chọn dùng nền mực đậm (độ tương phản cao), chip còn lại nền trắng viền mảnh.
 * Ẩn khi user chỉ có ≤ 1 tài sản (lọc không có ý nghĩa).
 */
const PropertyFilterChips = ({ properties, selectedId, onSelect }: Props) => {
  if (properties.length <= 1) return null;

  const options: { id?: string; name: string }[] = [
    { id: undefined, name: "Tất cả" },
    ...properties,
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      {options.map((option) => {
        const active = option.id === selectedId;
        return (
          <Chip
            key={option.id ?? "all"}
            label={option.name}
            variant="outline"
            selected={active}
            onPress={() => onSelect(option.id)}
            style={styles.chip}
          />
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Kéo tràn mép màn hình để chip cuộn sát viền, nhưng vẫn thẳng hàng lề nội dung.
  scroll: { marginHorizontal: -HOME_SPACE.screen },
  content: { paddingHorizontal: HOME_SPACE.screen, gap: 8 },
  chip: { maxWidth: 200 },
});

export default PropertyFilterChips;
