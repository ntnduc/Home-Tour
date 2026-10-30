import { payContractFirstInvoice } from "@/api/contract/contract.api";
import {
  cancelInvoice,
  getInvoice,
  getPaymentsByInvoice,
  paymentInvoice,
} from "@/api/invoice/invoice.api";
import { InvoicePaymentRequest } from "@/types/invoice";
import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useState } from "react";

const STALE_TIME = 30_000;

/** Backend message first (it is already Vietnamese), then the thrown message. */
export const getInvoiceErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message;
    if (message) return message;
  }
  return error instanceof Error && error.message ? error.message : fallback;
};

/**
 * Invoice detail data: invoice + payment history fetched in parallel
 * (independent sections), plus the pay / cancel mutations.
 */
export const useInvoiceDetailData = (
  invoiceId: string,
  confirmContractId?: string,
) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [invoiceQuery, paymentsQuery] = useQueries({
    queries: [
      {
        queryKey: ["invoice", "detail", invoiceId],
        queryFn: async () => {
          const response = await getInvoice(invoiceId);
          if (!response.data) {
            throw new Error(response.message || "Không tìm thấy hóa đơn");
          }
          return response.data;
        },
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME,
      },
      {
        queryKey: ["invoice", "payments", invoiceId],
        queryFn: async () => {
          const response = await getPaymentsByInvoice(invoiceId);
          if (!response.data) {
            throw new Error(response.message || "Không tải được lịch sử");
          }
          return response.data;
        },
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME,
      },
    ],
  });

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([invoiceQuery.refetch(), paymentsQuery.refetch()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [invoiceQuery, paymentsQuery]);

  // Invoice state also feeds the room / dashboard / list screens
  const invalidateRelated = () => {
    queryClient.invalidateQueries({ queryKey: ["invoice"] });
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
    queryClient.invalidateQueries({ queryKey: ["homepage"] });
  };

  const payMutation = useMutation({
    mutationFn: async (data: InvoicePaymentRequest) => {
      // First invoice of a contract: the contract must move on with the payment
      const response = confirmContractId
        ? await payContractFirstInvoice(confirmContractId, data)
        : await paymentInvoice(data);
      if (!response.success) {
        throw new Error(response.message || "Không thể ghi nhận thanh toán");
      }
      return response;
    },
    onSuccess: invalidateRelated,
  });

  const cancelMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await cancelInvoice(invoiceId, reason);
      if (!response.success) {
        throw new Error(response.message || "Không thể hủy hóa đơn");
      }
      return response;
    },
    onSuccess: invalidateRelated,
  });

  return {
    invoice: invoiceQuery.data,
    payments: paymentsQuery.data ?? [],
    isLoading: invoiceQuery.isLoading,
    isRefreshing,
    isInvoiceError: invoiceQuery.isError && !invoiceQuery.data,
    isPaymentsError: paymentsQuery.isError && !paymentsQuery.data,
    refetchInvoice: invoiceQuery.refetch,
    refetchPayments: paymentsQuery.refetch,
    refreshAll,
    pay: payMutation.mutateAsync,
    isPaying: payMutation.isPending,
    cancel: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
  };
};
