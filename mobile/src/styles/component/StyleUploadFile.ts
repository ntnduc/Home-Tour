import { StyleSheet } from "react-native";
import { Tokens } from "@/theme";

export const createStyles = (tokens: Tokens) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    label: {
      fontSize: tokens.typography.fontSize.md,
      fontWeight: "600",
      marginBottom: tokens.spacing.sm,
      color: tokens.colors.foreground,
    },
    requiredText: {
      color: "#ff3b30",
    },
    uploadContainer: {
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderRadius: 8,
      backgroundColor: "#ffffff",
      minHeight: 120,
    },
    uploadContainerError: {
      borderColor: "#ff3b30",
      backgroundColor: "#fef2f2",
    },
    uploadContainerDisabled: {
      backgroundColor: "#f3f4f6",
      opacity: 0.6,
    },
    uploadButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: "#f9fafb",
      borderWidth: 1,
      borderColor: "#e5e7eb",
      borderStyle: "dashed",
    },
    uploadButtonText: {
      fontSize: 16,
      color: "#6b7280",
      marginLeft: 8,
    },
    previewContainer: {
      padding: 12,
    },
    imagePreview: {
      width: "100%",
      height: 200,
      borderRadius: 8,
      backgroundColor: "#f3f4f6",
    },
    fileItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      backgroundColor: "#f9fafb",
      borderRadius: 8,
      marginBottom: 8,
    },
    fileIcon: {
      marginRight: 12,
    },
    fileInfo: {
      flex: 1,
    },
    fileName: {
      fontSize: 14,
      fontWeight: "500",
      color: "#111827",
      marginBottom: 4,
    },
    fileSize: {
      fontSize: 12,
      color: "#6b7280",
    },
    removeButton: {
      padding: 4,
    },
    errorText: {
      color: tokens.colors.error,
      fontSize: 14,
      marginTop: 4,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
    },
    emptyStateText: {
      fontSize: 14,
      color: "#9ca3af",
      marginTop: 8,
    },
  });
