import { RootStackParamList, TabParamList } from "@/navigation/types";
import { HomepageAlert, HomepageRoomFeedItem } from "@/types/homepage";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

/** Trang chủ là một tab nằm trong root stack → điều hướng được cả tab lẫn stack. */
export type HomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Dashboard">,
  NativeStackNavigationProp<RootStackParamList>
>;

export const openAlert = (navigation: HomeNavigation, alert: HomepageAlert) => {
  if (alert.target.invoiceId) {
    navigation.navigate("InvoiceDetail", { invoiceId: alert.target.invoiceId });
    return;
  }
  if (alert.target.contractId) {
    navigation.navigate("ContractDetail", {
      contractId: alert.target.contractId,
    });
    return;
  }
  navigation.navigate("RoomDetail", { roomId: alert.roomId });
};

/**
 * Điều hướng theo hành động gợi ý của phòng.
 * Giữ cùng quy tắc với `RoomCardItemComponents` để hành vi nhất quán giữa 2 màn.
 */
export const openRoomAction = (
  navigation: HomeNavigation,
  room: HomepageRoomFeedItem,
) => {
  const action = room.topAction;
  const payload = action?.payload ?? {};
  const roomId = payload.roomId ?? room.roomId;

  switch (action?.type) {
    case "INVOICE_PAYMENT":
      if (!payload.invoiceId) break;
      if (payload.invoiceStatus === "DRAFT") {
        navigation.navigate("ConfirmDraftInvoice", {
          invoiceId: payload.invoiceId,
        });
        return;
      }
      navigation.navigate("InvoiceDetail", { invoiceId: payload.invoiceId });
      return;
    case "CREATE_INVOICE":
      if (!payload.contractId) break;
      navigation.navigate("CreateInvoice", {
        contractId: payload.contractId,
        roomId,
      });
      return;
    case "CONFIRM_CONTRACT":
    case "CONFIRM_DEPOSIT":
    case "VIEW_CONTRACT":
      if (!payload.contractId) break;
      navigation.navigate("ContractDetail", { contractId: payload.contractId });
      return;
    case "RENEW_CONTRACT":
    case "CREATE_CONTRACT":
      navigation.navigate("CreateContract", { roomId });
      return;
    case "TERMINATE_CONTRACT":
      if (!payload.contractId) break;
      navigation.navigate("TerminateContract", {
        contractId: payload.contractId,
      });
      return;
  }
  navigation.navigate("RoomDetail", { roomId: room.roomId });
};
