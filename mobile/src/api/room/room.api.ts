import { privateApi } from "@/services/api";
import { ApiResponse } from "@/types/api";
import { BasePagingRequest } from "@/types/base.request";
import { ComboOptionWithExtra } from "@/types/comboOption";
import { BasePagingResponse } from "@/types/base.response";
import {
  RoomDetailResponse,
  RoomListResponse,
  RoomOptionExtra,
  RoomServiceDetailResponse,
  RoomUpdateRequest,
} from "@/types/room";

export const getListRoom = async (
  queryKey: BasePagingRequest
): Promise<ApiResponse<BasePagingResponse<RoomListResponse>>> => {
  const { limit, offset, filters, sortBy, sortOrder, globalKey } = queryKey;

  const response = await privateApi.get<
    ApiResponse<BasePagingResponse<RoomListResponse>>
  >("/rooms", {
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

export const getRoom = async (id: string) => {
  const response = await privateApi.get<ApiResponse<RoomDetailResponse>>(
    `/rooms/${id}`
  );

  return response.data;
};

export const updateRoom = async (data: RoomUpdateRequest) => {
  const response = await privateApi.put<ApiResponse<RoomDetailResponse>>(
    "/rooms",
    data
  );
  return response.data;
};

export const getRoomWitcService = async (id: string) => {
  const response = await privateApi.get<ApiResponse<RoomServiceDetailResponse>>(
    `/rooms/${id}/services`
  );
  return response.data;
};

/** Rooms that can still receive a new contract. */
export const getContractableRoomOptions = async (
  propertyId?: string
): Promise<ApiResponse<ComboOptionWithExtra<string, string, RoomOptionExtra>[]>> => {
  const response = await privateApi.get<
    ApiResponse<ComboOptionWithExtra<string, string, RoomOptionExtra>[]>
  >("/rooms/combo-contractable", { params: { propertyId } });
  return response.data;
};
