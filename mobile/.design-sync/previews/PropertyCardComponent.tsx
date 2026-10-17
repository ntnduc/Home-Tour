import React from "react";
import { PropertyCardComponent, propColors } from "home-tour-mobile";
import { Phone, noop, properties } from "../preview-kit/fixtures";

const Card = ({ i }: { i: number }) => (
  <Phone bg={propColors.canvas}>
    <PropertyCardComponent property={properties[i]} onPress={noop} onEdit={noop} onViewRooms={noop} onAddRoom={noop} />
  </Phone>
);

export const Partial = () => <Card i={0} />;
export const Full = () => <Card i={1} />;
export const Empty = () => <Card i={2} />;
