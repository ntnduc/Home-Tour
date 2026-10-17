import React from "react";
import { ProgressRing, Text, View, homeColors } from "home-tour-mobile";

const Ring = ({ progress }: { progress: number }) => (
  <ProgressRing progress={progress} size={96} strokeWidth={10} trackColor={homeColors.ringTrack} gradient={[homeColors.ringFrom, homeColors.ringTo]}>
    <Text style={{ color: homeColors.onHero, fontSize: 20, fontWeight: "700" }}>{progress}%</Text>
  </ProgressRing>
);

/** Used inside the dark hero card — shown on the hero background. */
export const OnHero = () => (
  <View style={{ flexDirection: "row", gap: 20, padding: 24, backgroundColor: homeColors.heroBg, borderRadius: 28 }}>
    <Ring progress={25} />
    <Ring progress={75} />
    <Ring progress={100} />
  </View>
);
