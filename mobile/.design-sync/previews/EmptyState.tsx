import React from "react";
import { EmptyState } from "home-tour-mobile";
import { Phone, noop } from "../preview-kit/fixtures";

export const WithAction = () => (
  <Phone>
    <EmptyState
      icon="business-outline"
      title="Chưa có tài sản nào"
      description="Thêm tài sản đầu tiên để bắt đầu quản lý phòng, hợp đồng và hóa đơn."
      actionLabel="Thêm tài sản"
      onPressAction={noop}
    />
  </Phone>
);
export const SearchNoResult = () => (
  <Phone>
    <EmptyState icon="search-outline" title="Không tìm thấy tài sản" description="Thử tìm với tên hoặc địa chỉ khác." />
  </Phone>
);
