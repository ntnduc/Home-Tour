import React from "react";
import {
  PropertyListHeader, PropertyCardComponent, View, useSharedValue, propColors, PROP_SPACE,
} from "home-tour-mobile";
import { Phone, noop, properties } from "../preview-kit/fixtures";

export const Default = () => {
  const scrollY = useSharedValue(0);
  return (
    <Phone pad={0} bg={propColors.canvas}>
      <PropertyListHeader total={3} isLoading={false} onPressCreate={noop} onSearch={noop} scrollY={scrollY} />
    </Phone>
  );
};

export const Loading = () => {
  const scrollY = useSharedValue(0);
  return (
    <Phone pad={0} bg={propColors.canvas}>
      <PropertyListHeader isLoading onPressCreate={noop} onSearch={noop} scrollY={scrollY} />
    </Phone>
  );
};

/** Reference screen: PropertyListScreen (header + card list, spacing as in the app). */
export const PropertyListScreen = () => {
  const scrollY = useSharedValue(0);
  return (
    <Phone pad={0} bg={propColors.canvas}>
      <PropertyListHeader total={properties.length} isLoading={false} onPressCreate={noop} onSearch={noop} scrollY={scrollY} />
      <View style={{ paddingHorizontal: PROP_SPACE.screen, paddingTop: 4, paddingBottom: 40, gap: PROP_SPACE.gap }}>
        {properties.map((p) => (
          <PropertyCardComponent key={p.id} property={p} onPress={noop} onEdit={noop} onViewRooms={noop} onAddRoom={noop} />
        ))}
      </View>
    </Phone>
  );
};
