import { Ionicons } from "@expo/vector-icons";
import React, { ReactElement } from "react";
import type {
  FlatListProps,
  ListRenderItemInfo,
  StyleProp,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { uiColors } from "@/theme";
import Input, { InputIconProps } from "./Input";

export type AutocompleteInputProps<Item> = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  hideResults?: boolean;
  inputContainerStyle?: StyleProp<ViewStyle>;
  listContainerStyle?: StyleProp<ViewStyle>;
  onShowResults?: (showResults: boolean) => void;
  renderResultList?: React.FC<FlatListProps<Item>>;
  renderTextInput?: React.FC<TextInputProps>;
  flatListProps?: Partial<Omit<FlatListProps<Item>, "data">>;
  data: readonly Item[];
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconProps?: InputIconProps;
  label?: string;
};

function defaultKeyExtractor(_: unknown, index: number): string {
  return `key-${index}`;
}

function defaultRenderItems<Item>({
  item,
}: ListRenderItemInfo<Item>): React.ReactElement {
  return <Text>{String(item)}</Text>;
}

export const AutocompleteInput = React.forwardRef(
  function AutocompleteInputComponent<Item, Ref>(
    props: AutocompleteInputProps<Item>,
    ref: React.ForwardedRef<Ref>
  ): React.ReactElement {
    const {
      data,
      containerStyle,
      hideResults,
      inputContainerStyle,
      listContainerStyle,
      onShowResults,
      onStartShouldSetResponderCapture = () => false,
      renderResultList: ResultList = FlatList,
      renderTextInput: customRenderTextInput = (props) => {
        return <Input {...props} keyboardType="default" />;
      },
      flatListProps,
      style,
      label,
      ...textInputProps
    } = props;

    function renderResultList(): React.ReactElement {
      const listProps: FlatListProps<Item> = {
        data,
        renderItem: defaultRenderItems,
        keyExtractor: defaultKeyExtractor,
        nestedScrollEnabled: true,
        ...flatListProps,
        style: [styles.list, flatListProps?.style],
      };

      return <ResultList {...listProps} />;
    }

    function renderTextInput(): React.ReactNode {
      const renderProps = {
        ...textInputProps,
        style: [styles.input, style],
        ...(ref && { ref }),
      };

      return customRenderTextInput(renderProps) as React.ReactNode;
    }

    const showResults = data.length > 0;
    onShowResults?.(showResults);

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.inputContainer, inputContainerStyle]}>
          {renderTextInput()}
        </View>
        {!hideResults && (
          <View
            style={listContainerStyle}
            onStartShouldSetResponderCapture={onStartShouldSetResponderCapture}
          >
            {showResults && renderResultList()}
          </View>
        )}
      </View>
    );
  }
) as <Item, Ref>(
  props: AutocompleteInputProps<Item> & { ref?: React.ForwardedRef<Ref> }
) => ReactElement;

const androidStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {},
  inputContainer: {
    marginBottom: 0,
  },
  list: {
    backgroundColor: uiColors.card,
    borderTopWidth: 0,
    margin: 10,
    marginTop: 0,
  },
});

const iosStyles = StyleSheet.create({
  container: {
    zIndex: 1,
  },
  inputContainer: {},
  input: {},
  list: {
    backgroundColor: uiColors.card,
    borderTopWidth: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
});

const styles = StyleSheet.create({
  ...Platform.select({
    android: androidStyles as unknown as typeof iosStyles,
    ios: iosStyles,
    default: iosStyles,
  }),
});

export default AutocompleteInput;
