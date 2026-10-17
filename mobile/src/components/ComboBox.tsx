import SkeletonBlock from "@/components/SkeletonBlock";
import { shadows, tokens, uiColors, uiRadius } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { FieldError, FieldLabel, fieldColors, fieldStyles } from "./FormField";
import { InputIconProps } from "./Input";

interface ComboBoxProps<T> {
  value?: T | string | null | undefined | number;
  options: T[];
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  isLoading?: boolean;
  onFocus?: () => void;
  isActive?: boolean;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  isSearch?: boolean;
  onSearch?: (text: string) => void;
  nestedScrollEnabled?: boolean;
  scrollEnabled?: boolean;
  renderItem?: (item: T, selected?: boolean) => React.ReactElement | null;
  icon?:
    | React.ReactElement
    | keyof typeof Ionicons.glyphMap
    | ((
        value: T | string | null | undefined | number,
        options: T[],
        visible?: boolean
      ) => React.ReactElement | null)
    | keyof typeof Ionicons.glyphMap;
  iconProps?: InputIconProps;
  labelKey?: string;
  valueKey?: string;
}

export const ComboBox = <T,>({
  value,
  options,
  onChange,
  placeholder = "Chọn...",
  error,
  isLoading = false,
  isActive = false,
  onFocus,
  label,
  required = false,
  isSearch = true,
  disabled = false,
  onSearch,
  icon,
  iconProps,
  renderItem,
  labelKey,
  valueKey,
}: ComboBoxProps<T>) => {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (!isActive) {
      setOpen(false);
    }
  }, [isActive]);

  const handleSelect = (key: T) => {
    onChange(key);
    setOpen(false);
    setSearchText("");
  };

  const _renderLoading = useCallback(
    () => (
      <View style={[fieldStyles.box, fieldStyles.boxDisabled]}>
        <SkeletonBlock width="70%" height={16} radius={6} />
      </View>
    ),
    []
  );

  const _renderSearch = useCallback(
    (onSearch: (text: string) => void) => {
      return (
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={18}
            color={fieldColors.icon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            placeholderTextColor={fieldColors.placeholder}
            value={searchText}
            onChangeText={onSearch}
          />
        </View>
      );
    },
    [searchText, value, options]
  );

  const _renderLeftIcons = useCallback(
    (visible?: boolean): React.ReactElement | null => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return (
          <Ionicons
            name={icon as keyof typeof Ionicons.glyphMap}
            size={18}
            color={fieldColors.icon}
            style={styles.leftIcon}
            {...iconProps}
          />
        );
      }
      if (typeof icon === "function") {
        const _renderIconType = icon(value, options, visible);
        if (typeof _renderIconType === "string") {
          return (
            <Ionicons
              name={_renderIconType as keyof typeof Ionicons.glyphMap}
              size={18}
              color={fieldColors.icon}
              style={styles.leftIcon}
              {...iconProps}
            />
          );
        }

        return _renderIconType as React.ReactElement;
      }
      return React.cloneElement(
        icon as React.ReactElement,
        {
          size: 18,
          color: fieldColors.icon,
          style: styles.leftIcon,
          ...iconProps,
        } as any
      );
    },
    [icon, value, options, iconProps, disabled, isLoading]
  );

  const _renderRightIcons = useCallback(
    (visible?: boolean) => {
      if (disabled) return null;
      if (visible) {
        return (
          <Ionicons
            name="chevron-up"
            size={18}
            color={fieldColors.icon}
          />
        );
      }
      return (
        <Ionicons
          name="chevron-down"
          size={18}
          color={fieldColors.icon}
        />
      );
    },
    [open, disabled]
  );

  const _renderEmpty = useCallback(() => {
    return <Text style={styles.noResults}>Không tìm thấy kết quả</Text>;
  }, [value, options, disabled, isLoading]);

  return (
    <View style={styles.container}>
      {label && <FieldLabel label={label} required={required} />}

      {isLoading ? (
        _renderLoading()
      ) : (
        <>
          <Dropdown
            value={value as any}
            data={options}
            onChange={(callback) => {
              if (typeof callback === "function") {
                const newValue = callback(value, options);
                if (newValue !== undefined && newValue !== null) {
                  handleSelect(newValue);
                }
              } else {
                handleSelect(callback as T);
              }
            }}
            placeholder={placeholder}
            style={[
              fieldStyles.box,
              open && fieldStyles.boxFocused,
              !!error && fieldStyles.boxError,
              disabled && fieldStyles.boxDisabled,
            ]}
            autoScroll={true}
            containerStyle={styles.dropdownContainer}
            search={isSearch}
            selectedTextStyle={styles.itemTextSelected}
            itemTextStyle={styles.itemText}
            keyboardAvoiding={true}
            renderLeftIcon={_renderLeftIcons}
            renderInputSearch={_renderSearch}
            renderRightIcon={_renderRightIcons}
            renderItem={renderItem}
            onChangeText={(text) => {
              onSearch?.(text);
              setSearchText(text);
            }}
            flatListProps={{
              ListEmptyComponent: _renderEmpty,
            }}
            disable={isLoading || disabled}
            placeholderStyle={[fieldStyles.text, styles.placeholder]}
            onFocus={() => {
              setOpen(true);
              onFocus?.();
            }}
            onBlur={() => setOpen(false)}
            labelField={labelKey ?? "label"}
            valueField={valueKey ?? "key"}
          />

          <FieldError message={error} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  leftIcon: {
    marginRight: 10,
  },
  placeholder: {
    color: fieldColors.placeholder,
  },
  dropdownContainer: {
    backgroundColor: uiColors.card,
    borderRadius: uiRadius.field,
    borderWidth: 0,
    marginTop: 6,
    overflow: "hidden",
    ...shadows.medium,
  },
  itemText: {
    ...fieldStyles.text,
  },
  itemTextSelected: {
    ...fieldStyles.text,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: uiColors.hairline,
  },
  searchInput: {
    ...fieldStyles.text,
    flex: 1,
    paddingVertical: 12,
  },
  noResults: {
    padding: 16,
    textAlign: "center",
    color: uiColors.textMuted,
    fontSize: tokens.typography.fontSize.sm,
  },
});
