# Blueprint — Room list upgrade (compact header + room card redesign)

| Field | Value |
| --- | --- |
| Status | `APPROVED` |
| Request | Upgrade `RoomListScreen`: compact header, redesigned room cards (layout, type, spacing, hierarchy), Dashboard-style badges, design-system action buttons; preserve functionality, navigation and business logic. |
| Scope | Frontend only (no backend / API / type changes) |
| Screen route | `RoomList` in `RootStackParamList` (`{ propertyId?: string }`) |
| Design system | `.claude/rules/mobile-ui-design.md` · references: `screens/dashboard/components/RoomStatusCarousel.tsx` (badges), `screens/property/PropertyListScreen.tsx` + `components/PropertyCardComponent.tsx` (list + card) |

## 1. Goal & UX narrative
A landlord scans many rooms quickly and acts on the one that needs money/contract work. Reading order per card:
**status + urgency (badges) → which room (name, building) → rent → who lives there + contract health → what to do now (actions)**.
The header shrinks (~240pt → ~150pt) by moving the building selector from a full-width 48pt field into a compact pill in the
title row and tightening header padding, so roughly one more card is visible on first paint.

## 2. Layout blueprint

### 2.1 Screen
```
SafeAreaView edges={[]} · canvas uiColors.canvas
┌──────────────────────────────────────────────┐
│ ScreenHeader compact                          │ paddingTop 4 · paddingBottom 12 · gap 10
│ Phòng                    [▣ Tất cả tòa nhà ⌄] │ title 24/30 · BuildingSelector variant="pill" in `action`
│ ┌──────── Tìm kiếm phòng hoặc tòa nhà… ────┐  │ SearchField (unchanged)
│ └──────────────────────────────────────────┘  │
│ (Tất cả)(⏱ Chờ)(⚠ Quá hạn)(✓ Đã thanh toán) → │ chips bleed −20 / +20 (unchanged)
├──────────────────────────────────────────────┤ shadow grows with scrollY (unchanged)
│ wrapper View flex 1 (opacity 0.6 bg fetch)    │
│  Animated.FlatList  padding 20 · top 16 · bot 40
│   PaymentSummary (ListHeader, mb 12)          │ unchanged (see §10)
│   RoomCard                                    │
│   ── gap 12 ──                                │
│   RoomCard …                                  │
│   footer: RoomCardSkeleton (next page)        │
└──────────────────────────────────────────────┘
```

### 2.2 Room card (`RoomCardItemComponent`)
```
┌──────────────────────────────────────────────┐ Card padding="none" · soft · r24 (overdue: border 1 errorSurface)
│ body View · padding 16 · gap 12               │
│ ┌ NoticeBanner tone=error (overdue only) ───┐ │ unchanged copy logic
│ └───────────────────────────────────────────┘ │
│ [● Đang thuê] [⚡ 3]                (✎) (🗑)  │ TOP ROW: StatusBadge sm + CountBadge(icon) · IconButton sm ×2
│ P.101                                         │ name 18/24 bold ink −0.3, 1 line
│ ▣ Nhà A                                       │ business-outline 12 subtle + caption, 1 line   (name+building gap 2)
│ 3.500.000đ /tháng                             │ rent 20/26 bold ink −0.3 + caption " /tháng"
│ Phòng góc, ban công…                          │ description caption, max 2 lines (if any)
│ ┌ RoomContractTile (only if ACTIVE contract)┐ │ bg uiColors.canvas · r16 · padding 12 · gap 10
│ │ (👤) Nguyễn A              [● Đang hiệu lực]│ │ IconSquircle sm person-outline · 14/20 semibold ink
│ │      HĐ #HD-001                           │ │ caption
│ │ ─────────────── hairline ───────────────  │ │
│ │ HẠN THANH TOÁN          TỔNG HOÁ ĐƠN       │ │ eyebrow ×2 (2 equal columns flex 1, gap 12)
│ │ 12/10/2026              1.200.000đ         │ │ 14/20 bold · due color rule · amount primary
│ └───────────────────────────────────────────┘ │
├──────────────── hairline (only if actions) ───┤
│ RoomCardActions · padding 16 · gap 10          │
│ [ ▢ Thu tiền        ][ ▢ Tạo hoá đơn       ]  │ primary actions: Button md block, variant by severity
│ ──────── Hành động thêm ⌄ ────────            │ toggle (only if secondary actions)
│ [▢ Xem HĐ] [▢ Gia hạn] [▢ Kết thúc HĐ]        │ secondary: Button sm, wrap, animated panel
└──────────────────────────────────────────────┘
```

| # | Section | Card size | Shadow | Radius | Data source | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | Compact header | full-bleed | animated (existing) | — | local state + `getComboProperty` | title + building pill + search + payment chips |
| S2 | Payment summary | full | (component's own) | (own) | static zeros (existing) | untouched |
| S3 | Room card list | full | soft (via `Card`) | 24 | `getListRoom` infinite query (existing) | card anatomy §2.2 |
| S3a | Contract tile (inside card) | full inner | none | 16 | `item.contracts` ACTIVE | nested tile, no shadow |
| S3b | Card actions (inside card) | full inner | none (Button soft variants) | pill | `item.actions` | existing navigation switch kept |

## 3. Component tree
```
screens/room/RoomListScreen.tsx                         EDIT  orchestration: compact header, states, skeletons, refresh
├── components/ScreenHeader.tsx                         EDIT  + `compact?: boolean` (opt-in; default visuals unchanged)
├── components/BuildingSelector.tsx                     EDIT  + `variant?: "field" | "pill"` (default "field" = current)
├── components/Chip.tsx                                 REUSE
├── components/PaymentSummary.tsx                       REUSE (unchanged)
├── components/EmptyState.tsx                           REUSE
├── components/SectionError.tsx                         REUSE
├── components/GlobalAppSheet.tsx                       REUSE (useGlobalAppSheet)
├── screens/room/components/BuildingFilterComponent.tsx REUSE (unchanged)
├── screens/room/components/RoomCardSkeleton.tsx        NEW   card-shaped skeleton
└── screens/room/components/RoomCardItemComponents.tsx  EDIT  rewrite layout; keep file name + default export
    ├── components/Card.tsx                             REUSE (replaces screens/common/CardComponent in this file only)
    ├── components/NoticeBanner.tsx                     REUSE
    ├── components/StatusBadge.tsx                      REUSE (+ constant/room.constant ROOM_STATUS_BADGE)
    ├── components/CountBadge.tsx                       EDIT  + `icon?: IoniconName` (Dashboard task-pill look)
    ├── components/IconButton.tsx                       REUSE (+ components/CardActionsPresets edit/delete icon/tone)
    ├── components/IconSquircle.tsx                     REUSE (inside contract tile)
    ├── screens/room/components/RoomContractTile.tsx    NEW   props: RoomContractTileProps
    └── screens/room/components/RoomCardActions.tsx     NEW   props: RoomCardActionsProps
```
No MOVEs. `screens/common/CardComponent.tsx` and `components/DisplayField.tsx` are not edited (still used elsewhere). No new
shared styles file — every style lives at the bottom of its own component (user requirement).

### 3.1 Shared component edits (additive, backwards compatible)

**`ScreenHeader` — new prop**
```ts
export interface ScreenHeaderProps {
  // …existing props unchanged
  /** Tighter vertical rhythm for dense list screens (default false). */
  compact?: boolean;
}
```
| Style | default (unchanged) | `compact` |
| --- | --- | --- |
| `content.paddingTop` | 8 | 4 |
| `content.paddingBottom` | 16 | 12 |
| `content.gap` | 14 | 10 |
| title `lineHeight` | 36 (uiType.title) | 30 (fontSize stays 24) |
| `titleRow.alignItems` | flex-start | center |

Implementation: separate `contentCompact`, `titleCompact`, `titleRowCompact` entries in the same `StyleSheet.create`, applied conditionally.

**`CountBadge` — new prop**
```ts
export interface CountBadgeProps {
  // …existing props unchanged
  /** Optional leading icon (11px, onInverse). Intended for size "md". */
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}
```
When `icon` is set: `flexDirection: "row"`, `gap: 2`, Ionicons size 11 color `tokens.colors.onInverse`, then the count text. Visual
equals the Dashboard `taskCount` pill (tone `"alert"` = `tokens.colors.secondary`). Still renders nothing when `count <= 0`.

**`BuildingSelector` — new prop**
```ts
export type BuildingSelectorVariant = "field" | "pill";
export interface BuildingSelectorProps {
  // …existing props unchanged
  variant?: BuildingSelectorVariant; // default "field" (current 48pt field box)
}
```
`pill` spec:
```
╭─────────────────────────╮ height 36 · paddingHorizontal 12 · gap 6 · radius uiRadius.pill
│ ▣ Tất cả tòa nhà   ⌄   │ icon business-outline 14 · label 13/18 semibold, 1 line, maxWidth 140 · chevron-down 14
╰─────────────────────────╯ hitSlop 4 (→ 44pt target) · PressableScale scaleTo 0.94
```
| State | bg | icon / label / chevron color |
| --- | --- | --- |
| none selected (label "Tất cả tòa nhà") | `uiColors.canvas` | `uiColors.textMuted` / `uiColors.ink` / `uiColors.textMuted` |
| building selected (label = building name) | `tokens.colors.primaryMuted` | `tokens.colors.primary` (all three) |

Accessibility: `accessibilityRole="button"`, `accessibilityLabel="Chọn tòa nhà"` (same as field variant). Same `onOpen` contract,
same selected-building lookup.

## 4. Data contracts
No API, type or backend changes.

### 4.1 Types (existing + new prop types)
- `RoomListResponse` (`src/types/room.ts`): `id, name, status: RoomStatus, rentAmount, description?, property?.name, contracts, landlordClient, actions: RoomAction[], pendingTaskCount, hasOverdueAlert, overdueAlertMessage?`.
- `ContractListResponse` (`src/types/contract.ts`): `id, code, status, endDate?, depositAmountPaid`.
- `ROOM_STATUS_BADGE: Record<RoomStatus, StatusBadgeSpec>` (`src/constant/room.constant.ts`), `CONTRACT_STATUS_BADGE` (`src/types/contract.ts`), `CARD_ACTION_PRESETS` (`src/components/CardActionsPresets.tsx`), `formatCurrency` (`src/utils/appUtil.ts`), `formatDate` (`src/utils/dateUtil.ts`).

```ts
// screens/room/components/RoomContractTile.tsx
export interface RoomContractTileProps {
  contract: ContractListResponse; // the ACTIVE contract
  tenantName: string;             // item.landlordClient || "N/A"
}

// screens/room/components/RoomCardActions.tsx
export interface RoomCardActionsProps {
  actions: RoomAction[];                      // unsorted; component sorts by priority asc (existing rule)
  onActionPress: (action: RoomAction) => void;
  resetKey: string;                           // item.id — collapses the secondary panel when the row is recycled
}

// screens/room/components/RoomCardItemComponents.tsx
type RoomCardItemProps = {
  item: RoomListResponse;
  navigation: NativeStackNavigationProp<RootStackParamList>; // replaces `any`
};

// screens/room/components/RoomCardSkeleton.tsx — no props
```

### 4.2 Endpoints
| Method | Path | Query | Response `data` | Backend status |
| --- | --- | --- | --- | --- |
| GET | via `getListRoom` (`src/api/room/room.api.ts`) | `limit 5, offset, globalKey, filters.propertyId` | `BasePagingResponse<RoomListResponse>` | EXISTS (unchanged) |
| GET | via `getComboProperty` (`src/api/property/property.api.ts`) | — | `ComboOptionWithExtra<string,string,PropertyDetail>[]` | EXISTS (unchanged) |

### 4.3 Data/state in the screen (kept inline — see §10)
Keep the existing `useInfiniteQuery` (same `queryKey: ['rooms', 1, 5, search, selectedBuilding]`, same `queryFn`, same
`getNextPageParam`) and the existing `getComboProperty` effect. Only additions:
```ts
// additionally destructured from useInfiniteQuery:
isFetching: boolean; isFetchingNextPage: boolean; isError: boolean;
// new local state / refs in RoomListScreen:
const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // bound to RefreshControl
const isFirstFocus = useRef<boolean>(true);                        // useFocusEffect skips refetch on first focus
type HandleRefresh = () => Promise<void>; // set true → await refetch() → finally set false
```

## 5. States & micro-interactions
| Section | Loading (first) | Fetching (bg) | Error | Empty | Touch (`scaleTo`) → action |
| --- | --- | --- | --- | --- | --- |
| S1 header | — (header always renders, also in loading/error branches) | — | combo error: pill shows "Tất cả tòa nhà" (existing console.error kept) | — | pill 0.94 → open sheet `BuildingFilterComponent` (snapPoints `['40%']`, title "Chọn tòa nhà") · chip (Chip internal) → `setFilterPayment` |
| S3 list | 3 × `RoomCardSkeleton` in container `paddingHorizontal 20, paddingTop 16, gap 12` | list wrapper `opacity 0.6` when `isFetching && !isRefreshing && !isFetchingNextPage` | `isError && flatData.length === 0` → `SectionError message="Không tải được danh sách phòng" onRetry={refetch}` centered vertically, paddingHorizontal 20 | `search` non-empty → `EmptyState icon="search-outline" title="Không tìm thấy phòng" description="Thử tìm với tên phòng hoặc tòa nhà khác."` · else → `EmptyState icon="bed-outline" title="Chưa có phòng nào" description="Thêm phòng cho tòa nhà để bắt đầu quản lý hợp đồng và hoá đơn."` + only if `selectedBuilding` → `actionLabel="Thêm phòng"`, `onPressAction` → `CreateRoom { propertyId: selectedBuilding }` | — |
| S3 footer | `isFetchingNextPage` → 1 × `RoomCardSkeleton` (marginTop 12) | — | — | — | — |
| S3 pull-to-refresh | — | `RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh}` tint/colors `tokens.colors.primary` | — | — | — |
| Card top row | — | — | — | CountBadge self-hides at 0 | edit `IconButton` sm → `UpdateRoom` · delete `IconButton` sm → no-op (existing behavior, §10) |
| Card actions | — | — | — | divider + actions block hidden when `actions.length === 0` | `Button` (internal 0.96) → existing `handleActionPress` switch · toggle `PressableScale` 0.96, hitSlop 8 → expand/collapse |

### 5.1 RoomCardSkeleton shape
```
┌──────────────────────────────────────────┐ Card padding="none" · inner padding 16 · gap 12
│ [▬▬▬▬ 84×22 r999] [▬ 32×22 r999]          │ badge row (row, gap 6)
│ ▬▬▬▬▬▬▬▬▬▬ 45% × 22 r8                    │ name
│ ▬▬▬▬▬▬ 30% × 14 r6                        │ building
│ ▬▬▬▬▬▬▬▬ 40% × 24 r8                      │ rent
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ 100% × 88 r16         │ contract tile
├──────────────────────────────────────────┤ hairline 1 uiColors.hairline
│ [▬▬▬▬▬▬ flex1 ×44 r999] [▬▬▬▬ flex1 ×44]  │ padding 16 · row gap 8 (wrap each block in a flex:1 View)
└──────────────────────────────────────────┘
```
All blocks are `SkeletonBlock` (built-in 750ms pulse).

### 5.2 Card typography & color rules (exact)
| Element | Style |
| --- | --- |
| Room name | `uiType.section` + lineHeight 24 (18/24 bold −0.3 `uiColors.ink`), numberOfLines 1 |
| Name block | name + building row wrapped in a View with `gap 2` |
| Building row | icon `business-outline` 12 `uiColors.textSubtle`, gap 4, text `uiType.caption` flex 1, numberOfLines 1; hidden if no `item.property?.name` |
| Rent value | `${formatCurrency(item.rentAmount ?? 0)}đ` — fontSize 20, lineHeight 26, `uiWeight.bold`, letterSpacing −0.3, `uiColors.ink` |
| Rent suffix | `/tháng` with `uiType.caption`; row `flexDirection: "row"`, `alignItems: "baseline"`, gap 2 |
| Description | `uiType.caption`, numberOfLines 2 |
| Tile tenant row | `IconSquircle icon="person-outline" size="sm"` · column (flex 1, gap 2): name 14/20 `uiWeight.semibold` `uiColors.ink` numberOfLines 1 + `HĐ #${contract.code}` `uiType.caption` · trailing `StatusBadge size="sm"` from `CONTRACT_STATUS_BADGE[contract.status]`; row gap 10, alignItems center |
| Tile divider | height 1, `uiColors.hairline` |
| Tile eyebrows | `uiType.eyebrow` — "Hạn thanh toán" / "Tổng hoá đơn"; column gap 4 |
| Tile values | 14/20 `uiWeight.bold`; due = `formatDate(contract.endDate)` colored by existing `getDueDateColor` (past → `tokens.colors.error`, ≤ 3 days → `tokens.palette.amber[600]`, else `uiColors.ink`); amount `${formatCurrency(contract.depositAmountPaid ?? 0)}đ` in `tokens.colors.primary` |
| Tile columns | due column only if `contract.endDate`; amount column only if `contract.id` (existing conditions); each column flex 1; if neither, hide divider + stats row |
| Top row | `flexDirection row, alignItems center, gap 8`; left cluster `flex 1, row, gap 6, alignItems center`: `StatusBadge size="sm"` from `ROOM_STATUS_BADGE[item.status] ?? ROOM_STATUS_BADGE.UNAVAILABLE` + `CountBadge count={item.pendingTaskCount ?? 0} tone="alert" icon={hasOverdueAlert ? "flame" : "flash"}` |
| Top row icons | right cluster `row, gap 8`: `IconButton size="sm"` with icon/tone from `CARD_ACTION_PRESETS.edit` / `.delete`, `accessibilityLabel` "Sửa phòng" / "Xoá phòng" |
| Overdue card | `Card style` → `borderWidth 1`, `borderColor tokens.colors.errorSurface` (existing) |

### 5.3 Action rules (`RoomCardActions`)
- Constants moved verbatim from the card into this file: `ROOM_ACTION_ICONS`, `ACTION_VARIANT` (overdue→`dangerSoft`, warning→`warningSoft`, normal→`soft`).
- Sort by `priority` asc; split `primary` / non-primary (existing memos).
- Primary row: `flexDirection row, gap 8`; each `Button size="md" block` (44pt; was `sm` 36). One primary action fills the row.
- Toggle row (only if secondary actions): hairline (height 1, `uiColors.hairline`, flex 1) · `PressableScale` (text "Hành động thêm" = `uiType.caption` + `uiWeight.semibold`, chevron-down 16 `uiColors.textMuted` rotating 0→180°) · hairline. `accessibilityRole="button"`, `accessibilityState={{ expanded }}`.
- Secondary panel: `Button size="sm"` (not block), `flexDirection row, flexWrap wrap, gap 8`, paddingTop 10. Keep the existing measured-height expand animation (RN `Animated`: height 260ms non-native, chevron 220ms native, translateY −6→0, opacity = expand value, `pointerEvents` none while collapsed) exactly; reset collapsed when `resetKey` changes or secondary list becomes empty (existing effects).
- Container: `padding 16, gap 10`. Returns `null` when `actions` is empty (card then also omits the divider).

## 6. Navigation map
| Element | Route | Params |
| --- | --- | --- |
| Card edit icon | `UpdateRoom` | `{ roomId: item.id, room: item }` (adds `room` to satisfy the typed param list; receiver reads only `roomId`) |
| Action `INVOICE_PAYMENT` (`invoiceStatus === "DRAFT"`) | `ConfirmDraftInvoice` | `{ invoiceId }` |
| Action `INVOICE_PAYMENT` | `InvoiceDetail` | `{ invoiceId }` |
| Action `CREATE_INVOICE` | `CreateInvoice` | `{ contractId, roomId }` |
| Actions `CONFIRM_CONTRACT` / `CONFIRM_DEPOSIT` / `VIEW_CONTRACT` | `ContractDetail` | `{ contractId }` |
| Actions `RENEW_CONTRACT` / `CREATE_CONTRACT` | `CreateContract` | `{ roomId }` |
| Action `TERMINATE_CONTRACT` | `TerminateContract` | `{ contractId }` |
| Empty state "Thêm phòng" (building selected) | `CreateRoom` | `{ propertyId: selectedBuilding }` |

All guards (`if (!payload.x) return`) stay exactly as today; `handleActionPress` stays in `RoomCardItemComponents.tsx`.

## 7. Implementation steps
1. **Shared component upgrades** (~70 lines) — `mobile/src/components/ScreenHeader.tsx` (`compact`), `mobile/src/components/CountBadge.tsx`
   (`icon`), `mobile/src/components/BuildingSelector.tsx` (`variant="pill"`). Defaults must render identically to today. Update each JSDoc ASCII.
2. **Skeleton + contract tile** (~140 lines) — NEW `mobile/src/screens/room/components/RoomCardSkeleton.tsx` (§5.1),
   NEW `mobile/src/screens/room/components/RoomContractTile.tsx` (§2.2, §5.2; move `getDueDateColor` here). JSDoc with ASCII each.
3. **Card actions** (~150 lines) — NEW `mobile/src/screens/room/components/RoomCardActions.tsx` (§5.3): move `ROOM_ACTION_ICONS`,
   `ACTION_VARIANT`, sort/split memos, expand/collapse state + `Animated` logic and their styles out of the card. JSDoc with ASCII.
4. **Card rewrite** (~150 lines) — EDIT `mobile/src/screens/room/components/RoomCardItemComponents.tsx`: `Card padding="none"` +
   body (NoticeBanner, top row, name block, rent, description, `RoomContractTile`) + hairline + `RoomCardActions`; type
   `navigation`; keep the `handleActionPress` switch logic identical; drop the absolute-positioned `CountBadge` overlay and the
   `CardComponent` / `DisplayField` / `PressableScale` / RN `Animated` imports. Update header JSDoc ASCII to §2.2.
5. **Screen** (~110 lines) — EDIT `mobile/src/screens/room/RoomListScreen.tsx`: `ScreenHeader compact` with
   `action={<BuildingSelector variant="pill" … />}` (same `onOpen` sheet code) and only the chips ScrollView as children; loading →
   3 × `RoomCardSkeleton`; error → `SectionError`; dim wrapper; `isRefreshing` + `handleRefresh`; first-focus skip; search-aware
   empty states; footer skeleton; `listContent` paddingTop 16; remove `CardSkeletonList` import; pass `navigation` unchanged to the card.
   Update screen JSDoc ASCII to §2.1.

## 8. Acceptance criteria (Reviewer checks every ID)
- **AC-1** Header shows title "Phòng" with the building pill on the same row, then search, then payment chips; no full-width building field remains. Compact header content paddings are 4 top / 12 bottom / gap 10.
- **AC-2** `ScreenHeader`, `CountBadge`, `BuildingSelector` render exactly as before when the new props are omitted (Tenant/Contract/Property screens untouched and visually unchanged).
- **AC-3** Tapping the pill opens the existing "Chọn tòa nhà" sheet; selecting a building closes the sheet, filters the list, and the pill switches to the primary-tinted state with the building name (1 line, truncated).
- **AC-4** Each card's top row shows a room `StatusBadge` (sm, from `ROOM_STATUS_BADGE`) and, when `pendingTaskCount > 0`, a secondary-colored count pill with `flame` (overdue) or `flash` icon — matching the Dashboard carousel; no badge floats outside the card corner.
- **AC-5** Card hierarchy top→bottom matches §2.2 with the exact type values in §5.2 (name 18/24 bold, rent 20/26 bold ink + caption "/tháng", formatted via `formatCurrency`).
- **AC-6** Contract tile renders only when an ACTIVE contract exists, on `uiColors.canvas` with radius 16, showing tenant, `HĐ #code`, contract `StatusBadge`, due date (colored per rule) and total amount (primary).
- **AC-7** Primary actions are 44pt `Button size="md" block` with severity variants; secondary actions sit behind "Hành động thêm" with the same expand animation as before; no actions ⇒ no divider/actions block.
- **AC-8** Every action navigates to the same route/params as before (§6); edit icon opens `UpdateRoom` for that room; delete icon remains a no-op.
- **AC-9** First load shows 3 card-shaped skeletons under the header; loading next page shows 1 skeleton at the list end; background refetch dims the list to 0.6; pull-to-refresh spinner is bound to `isRefreshing`.
- **AC-10** Error with no data shows `SectionError` "Không tải được danh sách phòng" with working retry; empty list shows the search-aware Vietnamese `EmptyState` ("Thêm phòng" → `CreateRoom` only when a building is selected).
- **AC-11** Infinite scroll, search, building filter, payment-chip state, `PaymentSummary`, query key and focus refetch (except the skipped first focus) behave as before.
- **AC-12** No `any` in touched files (card `navigation` typed), no hex colors, no `className`, every style in a bottom `StyleSheet.create` of its own component file, icons only `Ionicons`.

## 9. Validation
- `cd mobile && npx tsc --noEmit` (no new errors in touched files)
- `cd mobile && npm run check:colors`
- `cd mobile && npx expo export --platform ios --output-dir /tmp/room-list-export` (then delete it) — user asked not to run tests; these are static checks only.

## 10. Assumptions & open questions
- **Data hook not extracted** (deviation from "one hook per screen"): user asked to preserve business logic and avoid unnecessary abstractions; the existing `useInfiniteQuery` + `getComboProperty` stay inline in the screen, adding only `isFetching/isFetchingNextPage/isError/isRefreshing`. A `useRoomListData` extraction can be a follow-up.
- **RN `Animated` kept** for the secondary-actions panel (rule prefers reanimated): existing, working, measured-height behavior; rewriting is out of scope.
- **`getNextPageParam` kept as-is** although it compares `total` with `pages.length` (looks like a latent bug vs. Property's items-loaded check). Because `total` semantics are unclear, no "N phòng" subtitle is added to the header.
- **`PaymentSummary` kept with hard-coded zeros** and payment chips stay UI-only (not wired to the API), exactly as today. Open question: hide the summary until real data exists?
- **Delete icon stays a no-op** (current behavior). Open question: wire a delete flow or remove the icon.
- **No card-body tap → `RoomDetail`** added, to preserve current navigation and avoid nesting touchables around edit/delete. Open question: add it (Dashboard navigates to `RoomDetail`).
- **`UpdateRoom` params** gain `room: item` only to satisfy the typed `RootStackParamList` (`{ roomId; room: Room }`); `UpdateRoomScreen` reads `roomId` only.
- **"Tổng hoá đơn" shows `depositAmountPaid`** as today (label/value mismatch preserved; not a UI concern).
- **Primary buttons upsized sm (36) → md (44)** for the ≥ 44pt touch-target rule; secondary panel buttons stay `sm` as before.
- **Compact header title lineHeight 30** deliberately deviates from title 24/36 to save vertical space; font size stays 24.
- **Top-row `IconButton size="sm"`** kept (same as current `CardComponent` actions) even if below 44pt; `IconButton` has no `hitSlop` prop and editing it is out of scope.
- `BuildingSelector` is only used by this screen; the `field` variant stays default rather than deleting code.
- Dashboard `RoomStatusCarousel` is not migrated to the new `CountBadge icon` prop (unrelated screen).
- Blueprint is written in the session worktree (`.claude/worktrees/enumerated-giggling-sedgewick`), which was required by the harness; source files were read from the main checkout on branch state "clean".

---

## Implementation notes
- Files changed: `mobile/src/screens/room/components/RoomCardItemComponents.tsx`, `mobile/src/screens/room/components/RoomContractTile.tsx`, `mobile/src/screens/room/RoomListScreen.tsx`, `mobile/src/screens/room/components/RoomCardSkeleton.tsx`, `mobile/src/screens/room/components/RoomCardActions.tsx`, `mobile/src/components/ScreenHeader.tsx`, `mobile/src/components/BuildingSelector.tsx` (7 files touched across Rounds 1–2)
- Round 1 fixes applied:
  - **R1.1** (MAJOR, AC-5): Fixed conditional rendering in RoomCardItemComponents.tsx (building, description) and RoomContractTile.tsx (endDate, id columns) — changed from `&&` operator to ternary to prevent bare string rendering in View
  - **R1.2** (MAJOR, AC-4): Replaced hard-coded icons/tones with `CARD_ACTION_PRESETS.edit` and `CARD_ACTION_PRESETS.delete` (edit icon: create-outline, tone: ink; delete icon: trash-outline, tone: error)
  - **R1.3** (MAJOR, AC-5): Added `flex: 1` to buildingText style to prevent text overflow on card
  - **R1.4** (MAJOR, AC-9): Wrapped footer skeleton with View and `marginTop: uiSpace.gap` style for proper spacing
  - **R1.5** (MINOR, AC-12): Moved inline styles to StyleSheet.create in RoomCardSkeleton (buttonSlot)
  - **R1.6** (MINOR): Removed unused imports from RoomCardItemComponents.tsx (Button, ContractListResponse, IoniconName type)
  - **R1.7** (MINOR): Improved typing in RoomCardActions.tsx (ROOM_ACTION_ICONS: Record<RoomActionType>, ACTION_VARIANT: Record<RoomActionSeverity>)
  - **R1.9** (MINOR, AC-6): Wrapped divider + stats row in RoomContractTile with conditional to prevent empty section rendering
- Round 2 fixes applied:
  - **R2.1** (BLOCKER, AC-2): Merged main `ScreenHeader.tsx` (`onBack` prop + back button + `IconButton` import) with worktree compact styles (`compact` prop, `contentCompact`, `titleRowCompact`, `titleCompact` styles) — kept both features intact, no backward incompatibility
  - **R2.2** (MAJOR, AC-12): Removed `as any` casts on `CARD_ACTION_PRESETS.edit.tone` and `CARD_ACTION_PRESETS.delete.tone` in RoomCardItemComponents.tsx (types already match)
  - **R2.3** (MAJOR, AC-5): Wrapped room name Text and building row in `<View style={styles.nameBlock}>` with `gap: 2` to maintain 2pt spacing per §5.2 specification
  - **R2.4** (MAJOR, AC-3): Replaced `flex: 1` with `flexShrink: 1` on `pillLabel` in BuildingSelector.tsx to prevent label collapse in title row
- Deviations from blueprint: None. All Round 1 and Round 2 items fixed as specified.
- Validation results: Not run in worktree (partial checkout). User to run from full checkout: `cd mobile && npx tsc --noEmit · npm run check:colors · npx expo export --platform ios`

## Review log
<!-- Appended by UI Reviewer, newest round last. -->

### Round 1 — COMPLETED
All major issues (R1.1–R1.4) and most optional issues (R1.5, R1.6, R1.7, R1.9) have been fixed in the worktree.
- [x] R1.1 [MAJOR] FIXED: Conditionals in RoomCardItemComponents.tsx (building, description) and RoomContractTile.tsx (endDate, id) changed from `&&` to ternary.
- [x] R1.2 [MAJOR] FIXED: Icon buttons now use CARD_ACTION_PRESETS for correct icon/tone pairing.
- [x] R1.3 [MAJOR] FIXED: Building text has `flex: 1` to prevent overflow.
- [x] R1.4 [MAJOR] FIXED: Footer skeleton wrapped with `marginTop: uiSpace.gap` spacing.
- [x] R1.5 (MINOR) FIXED: Inline styles in RoomCardSkeleton moved to StyleSheet.
- [x] R1.6 (MINOR) FIXED: Unused imports removed from RoomCardItemComponents.tsx.
- [x] R1.7 (MINOR) FIXED: Better typing for ROOM_ACTION_ICONS and ACTION_VARIANT.
- [x] R1.9 (MINOR) FIXED: Divider + stats row in RoomContractTile wrapped in conditional.
- R1.8 (MINOR) SKIPPED: Header JSX extraction is optional refactoring; not critical to functionality.

Validation: Not run in worktree. User to run from full checkout: `cd mobile && npx tsc --noEmit · npm run check:colors · npx expo export --platform ios`.

### Round 2 — COMPLETED
All major issues (R2.1–R2.4) have been fixed in the worktree. Optional issues (R2.5, R2.6) are not addressed as they are marked non-critical and do not block implementation.
- [x] R2.1 [BLOCKER] FIXED: Merged `onBack` + back button + `IconButton` import from main into worktree `ScreenHeader.tsx`; preserved all `compact` prop and styles added in Round 1.
- [x] R2.2 [MAJOR] FIXED: Removed `as any` type casts on `CARD_ACTION_PRESETS.edit.tone` and `.delete.tone` in RoomCardItemComponents.tsx.
- [x] R2.3 [MAJOR] FIXED: Wrapped room name and building row in `nameBlock` View with `gap: 2` in RoomCardItemComponents.tsx.
- [x] R2.4 [MAJOR] FIXED: Replaced `flex: 1` with `flexShrink: 1` on `pillLabel` in BuildingSelector.tsx.
- R2.5 (MINOR) SKIPPED: ScreenHeader JSX deduplication across loading/content branches is optional refactoring; not critical to spec compliance.
- R2.6 (MINOR) SKIPPED: Redundant `pendingTaskCount > 0 &&` guard is harmless (CountBadge self-hides); removal is optional.

Validation: Not run in worktree (partial checkout). User to run from full checkout: `cd mobile && npx tsc --noEmit · npm run check:colors · npx expo export --platform ios`.

### Round 3 — APPROVED
Validation: tsc deferred · colors deferred · bundle deferred · backend n.a. (partial checkout; run from the full checkout before merging: `cd mobile && npx tsc --noEmit && npm run check:colors && npx expo export --platform ios --output-dir /tmp/room-list-export`, then delete the output dir)
- All of AC-1 to AC-12 checked by reading the code. R2.1–R2.4 are confirmed fixed. Imported props exist in the shared components (`Card elevation/padding`, `StatusBadge size/showDot`, `IconSquircle tone="neutral"`, `Button size/block`, `PressableScale` = TouchableOpacityProps incl. `hitSlop`/`accessibilityState`, `CARD_ACTION_PRESETS.edit/.delete`, `ROOM_STATUS_BADGE.UNAVAILABLE`).
- Compared the worktree files with the current main checkout (`/Users/nguyentrannhatduc/Documents/Github/learn/home-tour/mobile/src/...`). Each file differs only by changes the blueprint intends, so copying the worktree files over main loses nothing:
  - `components/ScreenHeader.tsx`: only adds `compact` (prop, JSDoc ASCII, `contentCompact`/`titleRowCompact`/`titleCompact`). Main's uncommitted `onBack` work is already in the worktree copy.
  - `components/CountBadge.tsx`: only adds `icon` (prop, Ionicons import, `withIcon` style, JSDoc). The default render is unchanged.
  - `components/BuildingSelector.tsx`: only adds `variant` (`pill` branch + styles). The theme import was merged into one line. The field branch is unchanged.
  - `screens/room/RoomListScreen.tsx`: contains the §7 step 5 changes. The rest is cosmetic: quotes changed from single to double, the emoji `console.error` became a descriptive message with optional chaining, and the empty `.finally` is gone. Query key, `queryFn`, `getNextPageParam`, the combo effect, chips, `PaymentSummary` and infinite scroll are all kept.

Optional (MINOR):
- `mobile/src/screens/room/RoomListScreen.tsx:410` — `centerContent.paddingHorizontal: uiSpace.screen` also applies inside `ListEmptyComponent`. The list content is already padded 20, so the EmptyState gets 40pt side insets. Use a separate empty-state style without horizontal padding.
- `mobile/src/screens/room/RoomListScreen.tsx:162-224` — the ScreenHeader + BuildingSelector sheet JSX is written twice (R2.5). Pull it into a `header` const.
- `mobile/src/screens/room/components/RoomCardItemComponents.tsx:128` — the `pendingTaskCount > 0 &&` guard is redundant (R2.6).

Escalate: non-blocking product decisions remain open in §10: delete icon is a no-op, PaymentSummary shows hard-coded zeros, payment chips are not wired, no card-tap → `RoomDetail`, and "Tổng hoá đơn" shows `depositAmountPaid`. A human must also run the deferred validations and copy the worktree files into main.
