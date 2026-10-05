import { privateApi } from "@/services/api";
import { ApiResponse } from "@/types/api";
import {
  HomepageAlertList,
  HomepageQuery,
  HomepageRoomFeedItem,
  HomepageSummary,
} from "@/types/homepage";

/**
 * API trang chủ — 3 endpoint độc lập, được gọi SONG SONG bởi `useHomepageData`
 * để mỗi section hiển thị ngay khi dữ liệu của nó về.
 */
export const getHomepageSummary = async (
  params: HomepageQuery = {},
): Promise<ApiResponse<HomepageSummary>> => {
  const response = await privateApi.get<ApiResponse<HomepageSummary>>(
    "/homepage/summary",
    { params: { propertyId: params.propertyId } },
  );
  return response.data;
};

export const getHomepageRoomFeed = async (
  params: HomepageQuery = {},
): Promise<ApiResponse<HomepageRoomFeedItem[]>> => {
  const response = await privateApi.get<ApiResponse<HomepageRoomFeedItem[]>>(
    "/homepage/room-feed",
    { params },
  );
  return response.data;
};

export const getHomepageAlerts = async (
  params: HomepageQuery = {},
): Promise<ApiResponse<HomepageAlertList>> => {
  const response = await privateApi.get<ApiResponse<HomepageAlertList>>(
    "/homepage/alerts",
    { params },
  );
  return response.data;
};
