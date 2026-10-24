import { confirmContractPayment } from "@/api/contract/contract.api";
import { Alert } from "react-native";

/**
 * Ask for confirmation, then mark the contract's first invoice as paid
 * (backend also activates the contract). `onDone` runs after success so the
 * caller can refetch its room data.
 */
export const promptConfirmContractPayment = (
  contractId: string | undefined,
  onDone?: () => void,
) => {
  if (!contractId) return;
  Alert.alert(
    "Xác nhận thanh toán",
    "Xác nhận đã nhận đủ khoản thanh toán đầu tiên? Hợp đồng sẽ được kích hoạt.",
    [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xác nhận",
        onPress: async () => {
          try {
            await confirmContractPayment(contractId);
            onDone?.();
          } catch (error: any) {
            Alert.alert(
              "Lỗi",
              error?.response?.data?.message ??
                "Không thể xác nhận thanh toán. Vui lòng thử lại.",
            );
          }
        },
      },
    ],
  );
};
