import React from "react";
import { RoomStatusCarousel } from "home-tour-mobile";
import { Phone, noop, rooms } from "../preview-kit/fixtures";

export const Default = () => (
  <Phone><RoomStatusCarousel rooms={rooms} isLoading={false} onPressRoom={noop} onPressAction={noop} /></Phone>
);
export const Loading = () => (
  <Phone><RoomStatusCarousel isLoading onPressRoom={noop} onPressAction={noop} /></Phone>
);
export const Empty = () => (
  <Phone><RoomStatusCarousel rooms={[]} isLoading={false} onPressRoom={noop} onPressAction={noop} /></Phone>
);
