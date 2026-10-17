import React from "react";
import { AlertFeed } from "home-tour-mobile";
import { Phone, noop, alerts } from "../preview-kit/fixtures";

export const Default = () => (
  <Phone><AlertFeed alerts={alerts} isLoading={false} isFetching={false} onPressAlert={noop} /></Phone>
);
export const Loading = () => (
  <Phone><AlertFeed isLoading isFetching={false} onPressAlert={noop} /></Phone>
);
export const Empty = () => (
  <Phone><AlertFeed alerts={[]} isLoading={false} isFetching={false} onPressAlert={noop} /></Phone>
);
