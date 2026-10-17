import React from "react";
import { PropertyFilterChips } from "home-tour-mobile";
import { Phone, noop, summary } from "../preview-kit/fixtures";

export const AllSelected = () => (
  <Phone><PropertyFilterChips properties={summary.properties} onSelect={noop} /></Phone>
);
export const OneSelected = () => (
  <Phone><PropertyFilterChips properties={summary.properties} selectedId="p2" onSelect={noop} /></Phone>
);
