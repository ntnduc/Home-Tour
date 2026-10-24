import { privateApi } from "@/services/api";
import { ApiResponse } from "@/types/api";
import { BasePagingRequest } from "@/types/base.request";
import { BasePagingResponse } from "@/types/base.response";
import {
  ContractCreateRequest,
  ContractDetailResponse,
  ContractListResponse,
  ContractUpdateRequest,
} from "@/types/contract";

export const getListContract = async (
  queryKey: BasePagingRequest
): Promise<ApiResponse<BasePagingResponse<ContractListResponse>>> => {
  const { limit, offset, filters, sortBy, sortOrder, globalKey } = queryKey;

  const response = await privateApi.get<
    ApiResponse<BasePagingResponse<ContractListResponse>>
  >("/contract", {
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

export const getContract = async (id: string) => {
  const response = await privateApi.get<ApiResponse<ContractDetailResponse>>(
    `/contract/${id}`
  );

  return response.data;
};

export const createContract = async (data: ContractCreateRequest) => {
  const response = await privateApi.post<ApiResponse<ContractDetailResponse>>(
    "/contract",
    data
  );
  return response.data;
};

export const updateContract = async (data: ContractUpdateRequest) => {
  const response = await privateApi.put<ApiResponse<ContractDetailResponse>>(
    "/contract",
    data
  );
  return response.data;
};

export const deleteContract = async (id: string) => {
  const response = await privateApi.delete<ApiResponse<boolean>>(
    `/contract/${id}`
  );
  return response.data;
};

export const getContractWithServices = async (id: string) => {
  const response = await privateApi.get<ApiResponse<ContractDetailResponse>>(
    `/contract/${id}/services`
  );
  return response.data;
};

// Các function bổ sung cho contract
export const deactivateContract = async (id: string, reason: string) => {
  const response = await privateApi.post<ApiResponse<ContractDetailResponse>>(
    `/contract/${id}/deactivate`,
    { reason: reason }
  );
  return response.data;
};

export const confirmContractPayment = async (id: string) => {
  const response = await privateApi.post<ApiResponse<ContractDetailResponse>>(
    `/contract/${id}/confirm-payment`,
    {}
  );
  return response.data;
};

export const renewContract = async (id: string, newEndDate: string) => {
  const response = await privateApi.post<ApiResponse<ContractDetailResponse>>(
    `/contract/${id}/renew`,
    { newEndDate }
  );
  return response.data;
};

export const getContractsByProperty = async (
  propertyId: string,
  queryKey: BasePagingRequest
): Promise<ApiResponse<BasePagingResponse<ContractListResponse>>> => {
  const { limit, offset, filters, sortBy, sortOrder, globalKey } = queryKey;

  const response = await privateApi.get<
    ApiResponse<BasePagingResponse<ContractListResponse>>
  >(`/contract/property/${propertyId}`, {
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

export const getContractsByRoom = async (
  roomId: string,
  queryKey: BasePagingRequest
): Promise<ApiResponse<BasePagingResponse<ContractListResponse>>> => {
  const { limit, offset, filters, sortBy, sortOrder, globalKey } = queryKey;

  const response = await privateApi.get<
    ApiResponse<BasePagingResponse<ContractListResponse>>
  >(`/contract/room/${roomId}`, {
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
