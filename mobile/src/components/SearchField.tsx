import { tokens, shadows } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { useDebouncedCallback } from "use-debounce";
import PressableScale from "./PressableScale";

export interface SearchFieldProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  defaultValue?: string;
  debounceMs?: number;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Search input field — integrated into list headers.
 *
 * Layout:
 * ```
 * ┌──────────────────────────────────────────────┐  height 44 · radius pill
 * │ ⌕  [TextInput: search query]            ⊗ │  icon 18 · clear visible when non-empty
 * └──────────────────────────────────────────────┘  shadow soft · border subtle
 * ```
 *
 * Behavior:
 * - Local state for the input value
 * - Debounced callback (default 300 ms) → `onSearch(trimmedValue)`
 * - Clear button fires `onSearch("")` immediately (no debounce)
 * - `returnKeyType="search"` · `autoCorrect={false}`
 *
 * @default `placeholder = "Tìm kiếm…"`, `debounceMs = 300`
 */
const SearchField = ({
  onSearch,
  placeholder = "Tìm kiếm…",
  defaultValue = "",
  debounceMs = 300,
  autoFocus = false,
  style,
}: SearchFieldProps) => {
  const [value, setValue] = useState(defaultValue);

  const debouncedSearch = useDebouncedCallback((text: string) => {
    onSearch(text.trim());
  }, debounceMs);

  const handleChangeText = (text: string) => {
    setValue(text);
    debouncedSearch(text);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <View style={[styles.container, shadows.soft, style]}>
      <Ionicons name="search" size={18} color={tokens.colors.subtle} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={tokens.colors.subtle}
        value={value}
        onChangeText={handleChangeText}
        returnKeyType="search"
        autoCorrect={false}
        autoFocus={autoFocus}
      />
      {value !== "" && (
        <PressableScale
          onPress={handleClear}
          scaleTo={0.9}
          accessibilityLabel="Xóa tìm kiếm"
          hitSlop={8}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={tokens.colors.subtle}
          />
        </PressableScale>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  input: {
    flex: 1,
    fontSize: tokens.typography.fontSize.sm,
    lineHeight: tokens.typography.lineHeight.sm,
    color: tokens.colors.foreground,
  },
});

export default SearchField;
