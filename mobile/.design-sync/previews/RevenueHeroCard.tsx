import React from "react";
import { RevenueHeroCard } from "home-tour-mobile";
import { Phone, noop, summary, summaryFull } from "../preview-kit/fixtures";

export const Default = () => (
  <Phone><RevenueHeroCard summary={summary} isLoading={false} isFetching={false} onPress={noop} /></Phone>
);
export const FullyCollected = () => (
  <Phone><RevenueHeroCard summary={summaryFull} isLoading={false} isFetching={false} onPress={noop} /></Phone>
);
export const Loading = () => (
  <Phone><RevenueHeroCard isLoading isFetching={false} onPress={noop} /></Phone>
);
