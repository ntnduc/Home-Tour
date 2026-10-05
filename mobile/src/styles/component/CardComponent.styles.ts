import { tokens } from "@/theme";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: tokens.spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: tokens.colors.foreground,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    gap: 4,
  },
  actionItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.palette.gray[300],
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: tokens.colors.surfaceMuted,
    borderColor: tokens.palette.gray[300],
  },
  renewButton: {
    backgroundColor: tokens.colors.successSurface,
    borderColor: tokens.palette.green[200],
  },
  terminateButton: {
    backgroundColor: tokens.colors.errorSurface,
    borderColor: tokens.palette.red[200],
  },
  editButton: {
    backgroundColor: tokens.colors.warningSurface,
    borderColor: tokens.palette.amber[200],
  },
  deleteButton: {
    backgroundColor: tokens.colors.errorSurface,
    borderColor: tokens.palette.red[200],
  },
  body: {
    // body có thể tuỳ chỉnh thêm nếu cần
  },
  footer: {
    marginTop: tokens.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: 4,
    borderRadius: tokens.radius.lg,
    marginBottom: tokens.spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    color: tokens.colors.muted,
    marginTop: 2,
    fontStyle: "italic",
  },
});

export default styles;
