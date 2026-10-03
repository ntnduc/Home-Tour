import { colors } from "@/theme/colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  cardWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.background.default,
    borderRadius: 14,
    padding: 16,
    shadowColor: colors.neutral.black,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  roomName: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  buildingName: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    color: colors.primary.main,
    fontWeight: "bold",
    marginBottom: 4,
  },
  updateBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.primary.light,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  roomInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 2,
    gap: 12,
  },
  roomInfoText: {
    fontSize: 13,
    color: colors.text.secondary,
    marginRight: 8,
  },
  roomDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
    fontStyle: "italic",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  pendingBadgeContainer: {
    position: "absolute",
    top: -8,
    right: -6,
    zIndex: 20,
    elevation: 20,
  },
  pendingBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: colors.background.default,
    backgroundColor: colors.status.error,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  contentColumn: {
    flex: 1,
  },
  cardNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 6,
  },
  cardNoticeText: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  contractInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  contractRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  contractLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  contractText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.primary,
  },
  paymentInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  paymentDateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  normalText: {
    color: colors.text.secondary,
  },
  warningText: {
    color: colors.status.warning,
  },
  overdueText: {
    color: colors.status.error,
  },
  daysText: {
    fontSize: 11,
    fontStyle: "italic",
  },
  invoiceAmount: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary.main,
  },
  primaryActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  roomActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    overflow: "hidden",
  },
  primaryRoomActionButton: {},
  secondaryRoomActionButton: {},
  roomActionButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  moreActionsWrapper: {
    marginTop: 12,
  },
  moreActionsDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  moreActionsDivider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  moreActionsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  moreActionsToggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  secondaryActionsAnimatedWrapper: {
    overflow: "hidden",
  },
  secondaryActionsMeasure: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  secondaryActionsPanel: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.primary.light,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  secondaryActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});

export default styles;
