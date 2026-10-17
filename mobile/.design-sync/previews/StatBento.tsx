import React from "react";
import { StatBento } from "home-tour-mobile";
import { Phone, noop, summary, summaryFull } from "../preview-kit/fixtures";

export const Default = () => (
  <Phone><StatBento summary={summary} isLoading={false} onPressOccupancy={noop} onPressTenants={noop} onPressContracts={noop} /></Phone>
);
export const FullOccupancy = () => (
  <Phone><StatBento summary={summaryFull} isLoading={false} onPressOccupancy={noop} onPressTenants={noop} onPressContracts={noop} /></Phone>
);
export const Loading = () => (
  <Phone><StatBento isLoading onPressOccupancy={noop} onPressTenants={noop} onPressContracts={noop} /></Phone>
);
