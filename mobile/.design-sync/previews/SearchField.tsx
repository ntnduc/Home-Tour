import React from "react";
import { SearchField, propColors } from "home-tour-mobile";
import { Phone, noop } from "../preview-kit/fixtures";

export const Empty = () => (
  <Phone bg={propColors.canvas}><SearchField placeholder="Tìm theo tên hoặc địa chỉ" onSearch={noop} /></Phone>
);
export const WithValue = () => (
  <Phone bg={propColors.canvas}><SearchField defaultValue="Cầu Giấy" placeholder="Tìm theo tên hoặc địa chỉ" onSearch={noop} /></Phone>
);
