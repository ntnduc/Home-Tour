import { privateApi } from "@/services/api";
import { ApiResponse } from "@/types/api";
import { BasePagingRequest } from "@/types/base.request";
import { BasePagingResponse } from "@/types/base.response";
import {
  InvoiceCreateRequest,
  InvoiceDetailResponse,
  InvoiceListResponse,
  InvoicePaymentRequest,
} from "@/types/invoice";
import { PaymentCreateRequest } from "@/types/payment";

// Use mock data - change to false when API is ready
const USE_MOCK_DATA = true;

// Import mock functions

// Invoice APIs
export const getListInvoice = async (
  queryKey: BasePagingRequest,
): Promise<ApiResponse<BasePagingResponse<InvoiceListResponse>>> => {
  const { limit, offset, filters, sortBy, sortOrder, globalKey } = queryKey;

  const response = await privateApi.get<
    ApiResponse<BasePagingResponse<InvoiceListResponse>>
  >("/invoice", {
    params: {
      limit,
      offset,
      filters,
      globalKey,
      sortBy,
      sortOrder,
    },
  });
  return response.data;
};

export const getInvoice = async (
  id: string,
): Promise<ApiResponse<InvoiceDetailResponse>> => {
  const response = await privateApi.get<ApiResponse<InvoiceDetailResponse>>(
    `/invoice/${id}`,
  );
  return response.data;
};

export const createInvoice = async (
  data: InvoiceCreateRequest,
): Promise<ApiResponse<InvoiceDetailResponse>> => {
  const response = await privateApi.post<ApiResponse<InvoiceDetailResponse>>(
    "/invoice",
    data,
  );
  return response.data;
};

export const updateInvoice = async (
  id: string,
  data: Partial<InvoiceCreateRequest>,
): Promise<ApiResponse<InvoiceDetailResponse>> => {
  const response = await privateApi.put<ApiResponse<InvoiceDetailResponse>>(
    `/invoice/${id}`,
    data,
  );
  return response.data;
};

export const deleteInvoice = async (
  id: string,
): Promise<ApiResponse<boolean>> => {
  const response = await privateApi.delete<ApiResponse<boolean>>(
    `/invoice/${id}`,
  );
  return response.data;
};

export const getInvoicesByContract = async (
  contractId: string,
  queryKey?: BasePagingRequest,
): Promise<ApiResponse<BasePagingResponse<InvoiceListResponse>>> => {
  const params = queryKey
    ? {
        limit: queryKey.limit,
        offset: queryKey.offset,
        filters: queryKey.filters,
        globalKey: queryKey.globalKey,
        sortBy: queryKey.sortBy,
        sortOrder: queryKey.sortOrder,
      }
    : {};

  const response = await privateApi.get<
    ApiResponse<BasePagingResponse<InvoiceListResponse>>
  >(`/invoice/contract/${contractId}`, {
    params,
  });
  return response.data;
};

export const getInvoicesByRoom = async (
  roomId: string,
  queryKey?: BasePagingRequest,
): Promise<ApiResponse<BasePagingResponse<InvoiceListResponse>>> => {
  const params = queryKey
    ? {
        limit: queryKey.limit,
        offset: queryKey.offset,
        filters: queryKey.filters,
        globalKey: queryKey.globalKey,
        sortBy: queryKey.sortBy,
        sortOrder: queryKey.sortOrder,
      }
    : {};

  const response = await privateApi.get<
    ApiResponse<BasePagingResponse<InvoiceListResponse>>
  >(`/invoice/room/${roomId}`, {
    params,
  });
  return response.data;
};

export const confirmInvoice = async (
  id: string,
): Promise<ApiResponse<InvoiceDetailResponse>> => {
  const response = await privateApi.patch<ApiResponse<InvoiceDetailResponse>>(
    `/invoice/confirm/${id}`,
  );
  return response.data;
};

export const paymentInvoice = async (
  data: InvoicePaymentRequest,
): Promise<ApiResponse<InvoiceDetailResponse>> => {
  const response = await privateApi.patch<ApiResponse<InvoiceDetailResponse>>(
    "/invoice/payment",
    data,
  );
  return response.data;
};

// Payment APIs
export const createPayment = async (
  data: PaymentCreateRequest,
): Promise<ApiResponse<PaymentResponse>> => {
  // const response = await privateApi.post<ApiResponse<PaymentResponse>>(
  //   "/payment",
  //   data,
  // );
  return {} as any;
};

export const getPaymentsByInvoice = async (
  invoiceId: string,
): Promise<ApiResponse<PaymentResponse[]>> => {
  const response = await privateApi.get<ApiResponse<PaymentResponse[]>>(
    `/payment/invoice/${invoiceId}`,
  );
  return response.data;
};

export const updatePayment = async (
  id: string,
  data: Partial<PaymentCreateRequest>,
): Promise<ApiResponse<PaymentResponse>> => {
  const response = await privateApi.put<ApiResponse<PaymentResponse>>(
    `/payment/${id}`,
    data,
  );
  return response.data;
};

export const deletePayment = async (
  id: string,
): Promise<ApiResponse<boolean>> => {
  const response = await privateApi.delete<ApiResponse<boolean>>(
    `/payment/${id}`,
  );
  return response.data;
};

// Utility Reading APIs
// export const createUtilityReading = async (
//   data: UtilityReadingCreateRequest
// ): Promise<ApiResponse<UtilityReadingResponse>> => {
//   if (USE_MOCK_DATA) {
//     return invoiceMock.createUtilityReadingMock(data);
//   }

//   const response = await privateApi.post<ApiResponse<UtilityReadingResponse>>(
//     "/utility-reading",
//     data
//   );
//   return response.data;
// };

// export const getUtilityReadingsByRoom = async (
//   roomId: string,
//   serviceId?: string
// ): Promise<ApiResponse<UtilityReadingResponse[]>> => {
//   if (USE_MOCK_DATA) {
//     return invoiceMock.getUtilityReadingsByRoomMock(roomId, serviceId);
//   }

//   const response = await privateApi.get<ApiResponse<UtilityReadingResponse[]>>(
//     `/utility-reading/room/${roomId}`,
//     {
//       params: serviceId ? { serviceId } : {},
//     }
//   );
//   return response.data;
// };

// export const getLatestUtilityReading = async (
//   roomId: string,
//   serviceId: string
// ): Promise<ApiResponse<UtilityReadingResponse>> => {

//   const response = await privateApi.get<ApiResponse<UtilityReadingResponse>>(
//     `/utility-reading/room/${roomId}/service/${serviceId}/latest`
//   );
//   return response.data;
// };
