import { StyleSheet } from "react-native";
import { Tokens } from "@/theme";

export const createStyles = (tokens: Tokens) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    input: {
      lineHeight: tokens.typography.lineHeight.sm,
      fontSize: tokens.typography.fontSize.md,
      paddingVertical: tokens.spacing.xs,
      minHeight: 32,
    },
    inputError: {
      borderColor: tokens.colors.error,
    },
    errorText: {
      color: tokens.colors.error,
    },
    label: {
      fontSize: tokens.typography.fontSize.md,
      fontWeight: "600",
      marginBottom: tokens.spacing.sm,
      color: tokens.colors.foreground,
    },
    requiredText: {
      color: tokens.colors.error,
    },
  });
