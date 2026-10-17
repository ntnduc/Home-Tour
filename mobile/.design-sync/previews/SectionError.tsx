import React from "react";
import { SectionError } from "home-tour-mobile";
import { Phone, noop } from "../preview-kit/fixtures";

export const Default = () => <Phone><SectionError onRetry={noop} /></Phone>;
export const CustomMessage = () => (
  <Phone><SectionError message="Không tải được danh sách tài sản" onRetry={noop} /></Phone>
);
