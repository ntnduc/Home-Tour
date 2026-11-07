/**
 * MEMBER ACCORDION — one collapsible card per property member.
 *
 * ```
 * ┌────────────────────────────────────────────┐ Card soft · radius 24 · padding 16
 * │ ▣  Nguyễn Văn A            [Quản lý]    ⌄  │ squircle · name · role/status badge · chevron
 * │    0901 234 567                            │
 * ├────────────────────────────────────────────┤ (expanded only · hairline)
 * │ ▣ Quản lý phòng                      2/4   │ group header (icon · label · enabled count)
 * │   Xem phòng                          ( ●)  │ Switch rows
 * │   Chỉnh sửa phòng                    (● )  │
 * │ ▣ Quản lý hợp đồng …                       │
 * └────────────────────────────────────────────┘
 * ```
 *
 * - ACTIVE member  → permission switches grouped by functional area
 * - Owner          → "Chủ sở hữu" badge, full-access notice, no switches
 * - PENDING invite → "Chờ chấp nhận" badge, locked notice + cancel action, no switches
 */

import Button from "@/components/Button";
import Card from "@/components/Card";
import IconSquircle from "@/components/IconSquircle";
import NoticeBanner from "@/components/NoticeBanner";
import PressableScale from "@/components/PressableScale";
import StatusBadge from "@/components/StatusBadge";
import { Switch } from "@/components/Switch";
import { uiColors, uiRadius, uiSpace, uiType, uiWeight } from "@/theme";
import { PermissionGroup, PropertyMember } from "@/types/propertyMember";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { LayoutAnimation, StyleSheet, Text, View } from "react-native";
import {
  GROUP_META,
  groupLabel,
  permissionLabel,
  roleLabel,
} from "../propertyMemberLabels";

type Props = {
  member: PropertyMember;
  groups: PermissionGroup[];
  isSaving: (userId: string, permission: string) => boolean;
  onToggle: (userId: string, permission: string, granted: boolean) => void;
  onCancelInvitation: (invitationId: string) => void;
  isCancelling: boolean;
};

const MemberAccordion = ({
  member,
  groups,
  isSaving,
  onToggle,
  onCancelInvitation,
  isCancelling,
}: Props) => {
  // Collapsed by default
  const [expanded, setExpanded] = useState(false);
  const isPending = member.status === "PENDING";

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((value) => !value);
  };

  const badge = member.isOwner ? (
    <StatusBadge label="Chủ sở hữu" tone="info" size="sm" />
  ) : isPending ? (
    <StatusBadge label="Chờ chấp nhận" tone="warning" size="sm" />
  ) : (
    <StatusBadge label={roleLabel(member.roleName)} tone="neutral" size="sm" />
  );

  return (
    <Card padding="md" style={styles.card}>
      <PressableScale
        onPress={toggleExpanded}
        scaleTo={0.98}
        accessibilityLabel={`${member.fullName}, ${expanded ? "thu gọn" : "mở rộng"}`}
        style={styles.header}
      >
        <IconSquircle
          icon={member.isOwner ? "ribbon-outline" : "person-outline"}
          tone={member.isOwner ? "primary" : isPending ? "warning" : "neutral"}
          size="md"
        />
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {member.fullName}
          </Text>
          <Text style={uiType.caption} numberOfLines={1}>
            {member.phone}
          </Text>
          <View style={styles.badgeRow}>{badge}</View>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={uiColors.textMuted}
        />
      </PressableScale>

      {expanded && (
        <View style={styles.body}>
          <View style={styles.hairline} />
          {member.isOwner ? (
            <NoticeBanner
              tone="info"
              message="Chủ sở hữu có toàn quyền với tài sản này và không thể bị gỡ hay thay đổi quyền."
            />
          ) : isPending ? (
            <>
              <NoticeBanner
                tone="warning"
                message="Lời mời đang chờ người dùng chấp nhận. Bạn chỉ chỉnh được quyền sau khi họ chấp nhận."
              />
              {member.invitationId && (
                <Button
                  label="Hủy lời mời"
                  icon="close-circle"
                  variant="dangerSoft"
                  isLoading={isCancelling}
                  onPress={() => onCancelInvitation(member.invitationId!)}
                />
              )}
            </>
          ) : (
            groups.map((group) => {
              const enabled = group.permissions.filter((p) =>
                member.permissions.includes(p),
              ).length;
              return (
                <View key={group.group} style={styles.group}>
                  <View style={styles.groupHeader}>
                    <Ionicons
                      name={GROUP_META[group.group]?.icon ?? "key-outline"}
                      size={16}
                      color={uiColors.textMuted}
                    />
                    <Text style={styles.groupTitle} numberOfLines={1}>
                      {groupLabel(group.group)}
                    </Text>
                    <Text style={uiType.caption}>
                      {enabled}/{group.permissions.length}
                    </Text>
                  </View>
                  {group.permissions.map((permission) => (
                    <Switch
                      key={permission}
                      label={permissionLabel(permission)}
                      alignLabel="horizontal"
                      value={member.permissions.includes(permission)}
                      disabled={isSaving(member.userId, permission)}
                      onValueChange={(value) =>
                        onToggle(member.userId, permission, value)
                      }
                      accessibilityLabel={`${permissionLabel(permission)} cho ${member.fullName}`}
                    />
                  ))}
                </View>
              );
            })
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { gap: 0 },
  header: { flexDirection: "row", alignItems: "center", gap: uiSpace.gap },
  headerText: { flex: 1, gap: 2 },
  name: { ...uiType.section, fontSize: 16, lineHeight: 24 },
  badgeRow: { flexDirection: "row", marginTop: 4 },
  body: { gap: uiSpace.gap, paddingTop: uiSpace.gap },
  hairline: { height: 1, backgroundColor: uiColors.hairline },
  group: {
    gap: 4,
    padding: uiSpace.card,
    borderRadius: uiRadius.tile,
    backgroundColor: uiColors.canvas,
  },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  groupTitle: {
    ...uiType.body,
    flex: 1,
    fontWeight: uiWeight.semibold,
    color: uiColors.ink,
  },
});

export default MemberAccordion;
