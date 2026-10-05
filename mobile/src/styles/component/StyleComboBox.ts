import { StyleSheet } from "react-native";
import { Tokens } from "@/theme";

export const createStyles = (tokens: Tokens) =>
  StyleSheet.create({
    container: {
      position: "relative",
    },
    label: {
      fontSize: tokens.typography.fontSize.md,
      fontWeight: "600",
      marginBottom: tokens.spacing.sm,
      color: tokens.colors.foreground,
    },
    selectInput: {
      borderWidth: 1,
      borderColor: tokens.colors.borderStrong,
      borderRadius: 8,
      padding: 12,
      backgroundColor: tokens.colors.surface,
      minHeight: 48,
    },
    selectText: {
      fontSize: 16,
      color: tokens.colors.foreground,
    },
    errorInput: {
      borderColor: tokens.colors.error,
    },
    errorText: {
      color: tokens.colors.error,
    },
    dropdownContainer: {
      backgroundColor: "#fff",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      marginTop: 4,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    item: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    itemText: {
      fontSize: 16,
      color: "#333",
    },

    itemTextSelected: {},
    searchInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#f0f0f0",
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
    },
    noResults: {
      padding: 16,
      textAlign: "center",
      color: "#666",
      fontSize: 14,
    },
  });
