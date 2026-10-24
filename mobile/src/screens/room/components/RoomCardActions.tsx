/**
 * Room card action buttons — primary grid + animated secondary panel.
 *
 * ```
 * │ [ ▢ Thu tiền        ][ ▢ Tạo hoá đơn       ]  │ padding 16 · gap 12
 * │ ──────── Hành động thêm ⌄ ────────            │ toggle row (only if secondary)
 * │ [ ▢ Xem hợp đồng    ][ ▢ Gia hạn           ]  │ secondary panel (animated height/opacity)
 * │ [ ▢ Kết thúc hợp đồng                      ]  │
 * ```
 * Every action: Button md (44pt, pill), soft variant, 2-column grid of equal
 * width (a lone last item spans the row) · gap 8.
 * Tone by action type (aligned with CARD_ACTION_PRESETS); urgent severity overrides it.
 * Sorts by priority asc; expands/collapses with Animated + measured height.
 */
import Button, { ButtonVariant } from "@/components/Button";
import { CARD_ACTION_PRESETS } from "@/components/CardActionsPresets";
import PressableScale from "@/components/PressableScale";
import { uiColors, uiType, uiWeight } from "@/theme";
import { RoomAction, RoomActionType, RoomActionSeverity } from "@/types/room";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export interface RoomCardActionsProps {
  actions: RoomAction[];
  onActionPress: (action: RoomAction) => void;
  resetKey: string; // item.id — collapses when recycled
}

const ROOM_ACTION_ICONS: Record<RoomActionType, IoniconName> = {
  INVOICE_PAYMENT: "card-outline",
  CREATE_INVOICE: "receipt-outline",
  CONFIRM_CONTRACT: "checkmark-circle-outline",
  CONFIRM_PAYMENT: "cash-outline",
  RENEW_CONTRACT: CARD_ACTION_PRESETS.renew.icon,
  CREATE_CONTRACT: "document-text-outline",
  VIEW_CONTRACT: CARD_ACTION_PRESETS.view.icon,
  TERMINATE_CONTRACT: CARD_ACTION_PRESETS.terminate.icon,
};

/**
 * Action type → semantic tone (normal severity).
 * money in / deposit / renew → success · create / confirm → primary ·
 * read-only → neutral outline · destructive → danger.
 */
const ACTION_TYPE_VARIANT: Record<RoomActionType, ButtonVariant> = {
  INVOICE_PAYMENT: "successSoft",
  CONFIRM_PAYMENT: "successSoft",
  RENEW_CONTRACT: "successSoft",
  CREATE_INVOICE: "soft",
  CREATE_CONTRACT: "soft",
  CONFIRM_CONTRACT: "soft",
  VIEW_CONTRACT: "outline",
  TERMINATE_CONTRACT: "dangerSoft",
};

/** Urgent severities override the type tone. */
const SEVERITY_VARIANT: Partial<Record<RoomActionSeverity, ButtonVariant>> = {
  overdue: "dangerSoft",
  warning: "warningSoft",
};

const getActionVariant = (action: RoomAction): ButtonVariant =>
  SEVERITY_VARIANT[action.severity] ?? ACTION_TYPE_VARIANT[action.type] ?? "soft";

/** Split into rows of two for the equal-width grid. */
const toRows = (items: RoomAction[]): RoomAction[][] => {
  const rows: RoomAction[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
};

const RoomCardActions = ({
  actions,
  onActionPress,
  resetKey,
}: RoomCardActionsProps) => {
  const [isSecondaryExpanded, setIsSecondaryExpanded] = useState(false);
  const [secondaryPanelHeight, setSecondaryPanelHeight] = useState(0);
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  const sortedActions = useMemo(
    () =>
      [...actions].sort(
        (actionA, actionB) => (actionA.priority ?? 0) - (actionB.priority ?? 0),
      ),
    [actions],
  );

  const primaryActions = useMemo(
    () => sortedActions.filter((action) => action.primary),
    [sortedActions],
  );

  const secondaryActions = useMemo(
    () => sortedActions.filter((action) => !action.primary),
    [sortedActions],
  );

  // Reset expanded state when the card is recycled or actions change
  useEffect(() => {
    setIsSecondaryExpanded(false);
    chevronAnim.setValue(0);
    expandAnim.setValue(0);
  }, [chevronAnim, expandAnim, resetKey]);

  // Collapse if secondary actions become empty
  useEffect(() => {
    if (secondaryActions.length === 0 && isSecondaryExpanded) {
      setIsSecondaryExpanded(false);
      chevronAnim.setValue(0);
      expandAnim.setValue(0);
    }
  }, [chevronAnim, expandAnim, isSecondaryExpanded, secondaryActions.length]);

  const toggleSecondaryActions = () => {
    const nextValue = !isSecondaryExpanded;

    setIsSecondaryExpanded(nextValue);
    Animated.parallel([
      Animated.timing(expandAnim, {
        toValue: nextValue ? 1 : 0,
        duration: 260,
        useNativeDriver: false,
      }),
      Animated.timing(chevronAnim, {
        toValue: nextValue ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const secondaryPanelAnimatedHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, secondaryPanelHeight],
  });

  const secondaryPanelTranslateY = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 0],
  });

  const renderActionGrid = (items: RoomAction[]) => (
    <View style={styles.grid}>
      {toRows(items).map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.gridRow}>
          {row.map((action, index) => (
            <Button
              key={`${action.type}-${action.priority}-${index}`}
              label={action.label}
              icon={ROOM_ACTION_ICONS[action.type]}
              variant={getActionVariant(action)}
              size="md"
              block
              textStyle={styles.buttonLabel}
              onPress={() => onActionPress(action)}
            />
          ))}
        </View>
      ))}
    </View>
  );

  if (actions.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Primary actions grid */}
      {primaryActions.length > 0 && renderActionGrid(primaryActions)}

      {/* Secondary toggle + animated panel */}
      {secondaryActions.length > 0 && (
        <View>
          {/* Toggle row */}
          <View style={styles.toggleRow}>
            <View style={styles.divider} />
            <PressableScale
              onPress={toggleSecondaryActions}
              scaleTo={0.96}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityState={{ expanded: isSecondaryExpanded }}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleLabel}>Hành động thêm</Text>
              <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                <Ionicons name="chevron-down" size={16} color={uiColors.textMuted} />
              </Animated.View>
            </PressableScale>
            <View style={styles.divider} />
          </View>

          {/* Animated secondary panel */}
          <Animated.View
            style={[
              styles.secondaryClip,
              { height: secondaryPanelAnimatedHeight, opacity: expandAnim },
            ]}
            pointerEvents={isSecondaryExpanded ? "auto" : "none"}
          >
            <Animated.View
              style={[
                styles.secondaryMeasure,
                { transform: [{ translateY: secondaryPanelTranslateY }] },
              ]}
              onLayout={(event) => {
                const measuredHeight = event.nativeEvent.layout.height;
                if (measuredHeight > 0 && measuredHeight !== secondaryPanelHeight) {
                  setSecondaryPanelHeight(measuredHeight);
                }
              }}
            >
              {renderActionGrid(secondaryActions)}
            </Animated.View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  grid: {
    gap: 8,
  },
  gridRow: {
    flexDirection: "row",
    gap: 8,
  },
  buttonLabel: {
    // Match the 18pt md icon so icon + label share one optical centre.
    lineHeight: 18,
    includeFontPadding: false,
    textAlignVertical: "center",
    flexShrink: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: uiColors.hairline,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  toggleLabel: {
    ...uiType.caption,
    fontWeight: uiWeight.semibold,
  },
  secondaryClip: {
    overflow: "hidden",
  },
  secondaryMeasure: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    paddingTop: 12,
  },
});

export default RoomCardActions;
