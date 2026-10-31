# Blueprint — Invoice create / confirm-draft / cancel-reason restyle (InvoiceDetail base UI)

| Field | Value |
| --- | --- |
| Status | `IMPLEMENTED` |
| Request | Restyle `ConfirmCreateInvoiceScreen`, `components/CreateInvoice` (host `ConfirmDraftInvoice`) and the `CancelPreInvoiceReason` sheet from NativeWind `className` / legacy `CardComponent` to the Modern Minimalist system (StyleSheet + tokens, FormScreen · FormSection · Card · StatusBadge · NoticeBanner · DisplayField · EmptyState), consistent with the implemented invoice-detail restyle, with zero business-logic / data-flow change. |
| Scope | Frontend only (no API, type, hook, navigation or backend change; `App.tsx` untouched) |
| Screen route | `ConfirmCreateInvoice` (`{ invoice: InvoiceCreateRequest }`) and `ConfirmDraftInvoice` (`{ invoiceId; isPreInvoice? }` → renders `CreateInvoice`) in `RootStackParamList` |
| Design system | `.claude/rules/mobile-ui-design.md` |
| Base reference | `.github/ui-blueprints/20261030-invoice-detail-restyle.md` + `mobile/src/screens/invoice/InvoiceDetailScreen.tsx`, `components/detail/InvoiceSummaryCard.tsx`, `InvoiceInfoCard.tsx`, `InvoiceCostCard.tsx`, `InvoicePaymentHistory.tsx`, `components/ConfirmPaymentInvoice.tsx`, `mobile/src/screens/room/UpdateRoomScreen.tsx` |

## 1. Goal & UX narrative
Two moments of the invoice life cycle get the same look as the invoice detail: (a) **ConfirmCreateInvoice** — the landlord
reviews a manually built invoice before sending it ("is the total right?"), and (b) **ConfirmDraftInvoice / CreateInvoice** —
right after a contract is created, the landlord checks the first (draft) invoice and confirms it, records a payment, edits
item prices, or cancels it with a reason. Reading order for both: identity + money summary card (amount tile) → titled
`FormSection` cards (contract facts, billing facts, line items, summary / notes) → sticky `ActionButtonBottom`. The cancel
reason sheet follows the sheet-content convention defined by `ConfirmPaymentInvoice` (gutter padding 16, tone notice,
grouped fields, footer clearance).

Both host screens **keep their native stack header** (titles `Xác Nhận Tạo Hóa Đơn` with `headerBackTitle: "Chỉnh sửa"`,
and `Xác Nhận Hóa Đơn Nháp`). `CreateInvoice` toggles `headerBackVisible` / `gestureEnabled` via `navigation.setOptions`
for the pre-invoice back-lock, so the native header is load-bearing — no `ScreenHeader` here (see §10).

**Frozen (must stay byte-identical; only moved lines inside JSX are allowed to change):**
- `ConfirmCreateInvoiceScreen.tsx`: props type, `isSubmitting` state, the whole `calculatedInvoiceData` `useMemo`,
  `totalServiceAmount`, `onEdit`, `onSubmit` (payload, `createInvoice`, Toast texts, `popToTop`), the `if (isSubmitting) return <Loading />` branch,
  and the `ActionButtonBottom` `actions` array (labels, icons, variants, `isLoading`, handlers).
- `CreateInvoice.tsx`: `CreateInvoiceProps`, `formatDateSafe`, every `useState` / `useRef` / `useQueryClient` / `useGlobalAppSheet`,
  `fetchInvoice`, both `useEffect`s, `isBackLocked`, the BackHandler / `beforeRemove` / `setOptions` effect,
  `handleCancelPreInvoice` (incl. `isCancellingRef` double-submit guard, `cancelContractPreInvoice`, invalidations, `requestAnimationFrame(goBack)`),
  `handleOpenCancelPreInvoice`, `handleSavePayment`, `handleOpenPaymentForm`, `handleSaveInvoiceItemsPrice`,
  `handleOpenUpdateItemsPrice`, `handleConfirmInvoice` (all sheet configs: snap points, header titles, footers, variants,
  labels incl. `Xác Nhận`), the `if (loading) return <Loading />` branch, `status` / `invoiceItems` derivations, and the
  footer `ActionButtonBottom` `actions` array (incl. `isPreInvoice` branch and `hidden: status !== InvoiceStatus.DRAFT`).
- `CancelPreInvoiceReason.tsx`: `FormValues`, `Props { onSubmit }`, `CancelPreInvoiceReasonRef { submit }`, `MAX_REASON_LENGTH`,
  `useForm` defaults, `useImperativeHandle` body, the whole `Controller` (name, `validate` rule + messages, `Input` props), default export.
- `ConfirmPaymentInvoice.tsx`, `UpdateInvoiceItemsPrice.tsx`, `ServiceDetailInvoiceItemComponent.tsx`, `App.tsx`, `navigation/types.ts`: **not edited**.

## 2. Layout blueprint

### 2.1 ConfirmCreateInvoice (native header "Xác Nhận Tạo Hóa Đơn")
```
FormScreen (canvas · gutter 20 · top 16 · gap 12 · keyboard-aware)
┌ Card soft r24 p16 gap16 ─────────────────────────┐ S1 ConfirmCreateSummaryCard
│ ▣  Xác nhận tạo hóa đơn          [✎ Chỉnh sửa]   │    IconSquircle md receipt-outline (info) · section title · Button sm outline
│    Kiểm tra kỹ các thông tin trước khi xác nhận  │    caption (2 lines max)
│ ┌ tile canvas r20 p16 gap4 ────────────────────┐ │
│ │ TỔNG TIỀN CẦN THU                            │ │    eyebrow
│ │ 5.000.000đ                                   │ │    display, color info
│ └──────────────────────────────────────────────┘ │
│ Tiền thuê                            3.000.000đ  │    body / bodyStrong · gap 8
│ Dịch vụ                              2.000.000đ  │
└──────────────────────────────────────────────────┘
┌ FormSection ▣ Thông tin hợp đồng ───────────────┐ S2 reader-outline
│ Phòng                                Phòng 101   │    DisplayField compact strong
│ Người thuê                           Nguyễn A    │    DisplayField compact
└──────────────────────────────────────────────────┘
┌ FormSection ▣ Thông tin thanh toán ─────────────┐ S3 calendar-outline
│ Hóa đơn tháng                        Tháng 9     │
│ Hạn thanh toán                       05/10/2026  │
│ ──────────────────────────────── (notes only)    │    divider hairline
│ Ghi chú                              (caption)   │    DisplayField vertical (notes only)
│ nội dung ghi chú                                 │
└──────────────────────────────────────────────────┘
┌ FormSection ▣ Chi tiết dịch vụ ─────────────────┐ S4 flash-outline + caption
│   Các dịch vụ được tính trong hóa đơn này        │
│ ServiceDetailInvoiceItemComponent rows           │    unchanged component/keys/isLast
│ (or caption "Không có dịch vụ nào")              │
└──────────────────────────────────────────────────┘
┌ FormSection ▣ Tóm tắt thanh toán ───────────────┐ S5 calculator-outline
│ Tiền thuê                            3.000.000đ  │
│ Dịch vụ                              2.000.000đ  │
│ ──────────────────────────────────────────────── │    hairline (totalRow border)
│ Tổng cộng                            5.000.000đ  │    bodyStrong · section primary
└──────────────────────────────────────────────────┘
├──────────────────────────────────────────────────┤
│ [✓ Xác nhận tạo hóa đơn]  [✎ Chỉnh sửa thông tin] │ S6 FormScreen.footer = ActionButtonBottom (frozen actions)
└──────────────────────────────────────────────────┘
```

### 2.2 ConfirmDraftInvoice → CreateInvoice (native header "Xác Nhận Hóa Đơn Nháp")
```
FormScreen (canvas · gutter 20 · top 16 · gap 12)
╭ ✓ Hợp đồng đã được tạo cùng hóa đơn đầu tiên. … ╮ S1 NoticeBanner tone success, icon checkmark-circle (no title, no Card)
╰──────────────────────────────────────────────────╯
┌ Card soft r24 p16 gap16 ─────────────────────────┐ S2 InvoiceDraftSummaryCard
│ ▣  Mã hóa đơn (caption)            ● Nháp        │    IconSquircle md receipt-outline (tone by status) · StatusBadge
│    HD-001 / Chưa cấp mã (section)                │
│ ┌ tile canvas r20 p16 gap4 ────────────────────┐ │
│ │ SỐ TIỀN CẦN THANH TOÁN                       │ │    eyebrow
│ │ 3.500.000đ                                   │ │    display, color info
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
┌ FormSection ▣ Thông tin hợp đồng ───────────────┐ S3 reader-outline
│ Phòng (strong) · Người thuê · Tòa nhà (if any)   │    DisplayField compact
└──────────────────────────────────────────────────┘
┌ FormSection ▣ Thông tin thanh toán ─────────────┐ S4 calendar-outline
│ Kỳ thanh toán         01/09/2026 - 30/09/2026    │
│ Hạn thanh toán        05/10/2026                 │
│ ──────────────────────────────────────────────── │    divider hairline
│ Tổng tiền (strong)                   3.500.000đ  │
│ Đã thanh toán (success)                      0đ  │
│ Còn lại (strong)                     3.500.000đ  │
└──────────────────────────────────────────────────┘
┌ FormSection ▣ Chi tiết hóa đơn    [✎ Cập nhật giá]┐ S5 InvoiceDraftItemsSection list-outline + caption
│   Các khoản mục được tính trong hóa đơn          │    action Button sm soft — only when status === DRAFT
│ ▣ Tiền phòng                         3.000.000đ  │    rows: IconSquircle sm · bodyStrong name · bodyStrong amount
│ ──────────────────────────────────────────────── │    hairline between rows
│ ▣ Điện                                 500.000đ  │
│ (or caption "Chưa có khoản mục nào")             │
└──────────────────────────────────────────────────┘
┌ FormSection ▣ Ghi chú ──────────────────────────┐ S6 document-text-outline
│ notes || "Không có ghi chú" (body)               │    always rendered (unchanged)
└──────────────────────────────────────────────────┘
├──────────────────────────────────────────────────┤
│ [💳 Ghi nhận thanh toán]                         │ S7 FormScreen.footer = ActionButtonBottom (frozen actions)
│ [⊗ Hủy hóa đơn / Hủy] [✓ Xác nhận hóa đơn]       │
└──────────────────────────────────────────────────┘

Not-found branch (`!invoice`):
View emptyWrap (flex 1 · center · padding 20 · canvas)
  EmptyState icon receipt-outline · title "Không tìm thấy hóa đơn" · description "Hóa đơn của hợp đồng chưa được tạo hoặc đã xảy ra lỗi khi tải dữ liệu."
```

### 2.3 CancelPreInvoiceReason sheet (snap 50%, header + footer owned by host, unchanged)
```
BottomSheetScrollView · contentContainerStyle: padding 16 (uiSpace.card) · paddingBottom SHEET_FOOTER_CLEARANCE (120) · gap 16
╭ ⚠ Hóa đơn đầu tiên sẽ bị hủy và hợp đồng sẽ tiếp tục mà ╮ NoticeBanner tone warning, icon "warning", message = exact
│   không cần thanh toán. Thao tác này không thể hoàn tác.  │ existing copy (no title)
╰───────────────────────────────────────────────────────────╯
Lý do hủy *                                                  Controller + Input type area (frozen)
┌───────────────────────────────────────────────────────────┐
│ Nhập lý do hủy hóa đơn                                     │
└───────────────────────────────────────────────────────────┘
```

| # | Section | Card size | Shadow | Radius | Data source | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| C-S1 | ConfirmCreate summary | full | soft (`Card`) | 24 (tile 20) | `calculatedInvoiceData`, `invoice.invoiceItems` | NEW `ConfirmCreateSummaryCard` |
| C-S2 | Contract info | full | soft | 24 | `invoice` | inline `FormSection` |
| C-S3 | Billing info | full | soft | 24 | `invoice` | inline `FormSection`; notes block conditional |
| C-S4 | Service lines | full | soft | 24 | `calculatedInvoiceData.invoiceItemsWithTotal` | inline `FormSection` |
| C-S5 | Payment summary | full | soft | 24 | `calculatedInvoiceData`, `totalServiceAmount` | inline `FormSection` |
| C-S6 | Action bar | full sticky | ActionButtonBottom own | — | local | `FormScreen.footer` |
| D-S1 | Created notice | full | — | NoticeBanner own (16) | static | `NoticeBanner` success |
| D-S2 | Draft summary | full | soft | 24 (tile 20) | `invoice`, `status` | NEW `InvoiceDraftSummaryCard` |
| D-S3 | Contract info | full | soft | 24 | `invoice` | inline `FormSection` |
| D-S4 | Billing info | full | soft | 24 | `invoice` | inline `FormSection` |
| D-S5 | Items | full | soft | 24 | `invoiceItems`, `status` | NEW `InvoiceDraftItemsSection` |
| D-S6 | Notes | full | soft | 24 | `invoice.notes` | inline `FormSection` |
| D-S7 | Action bar | full sticky | own | — | local | `FormScreen.footer` |
| R-S1 | Cancel notice + reason | sheet | — | — | form | `NoticeBanner` warning + frozen Controller |

Icon / tone table (`FormSection.icon`, `iconTone` default `primary`):

| Section | Title (exact) | Icon | iconTone | caption (exact) |
| --- | --- | --- | --- | --- |
| C-S1 leading | — | `receipt-outline` (IconSquircle `md`) | `info` | — |
| C-S2 / D-S3 | `Thông tin hợp đồng` | `reader-outline` | primary | — |
| C-S3 / D-S4 | `Thông tin thanh toán` | `calendar-outline` | primary | — |
| C-S4 | `Chi tiết dịch vụ` | `flash-outline` | primary | `Các dịch vụ được tính trong hóa đơn này` |
| C-S5 | `Tóm tắt thanh toán` | `calculator-outline` | primary | — |
| D-S2 leading | — | `receipt-outline` (IconSquircle `md`) | PAID→`success` · CANCELLED→`neutral` · else `primary` | — |
| D-S5 | `Chi tiết hóa đơn` | `list-outline` | primary | `Các khoản mục được tính trong hóa đơn` |
| D-S5 rows | — | ROOM_RENT→`home-outline` · else `construct-outline` (IconSquircle `sm`) | ROOM_RENT→`primary` · else `neutral` | — |
| D-S6 | `Ghi chú` | `document-text-outline` | primary | — |

## 3. Component tree
```
src/screens/invoice/ConfirmCreateInvoiceScreen.tsx              EDIT  JSX/imports/styles only; KeyboardAwareScrollView+CardComponent → FormScreen(footer)
├── components/create/ConfirmCreateSummaryCard.tsx              NEW   props §4.1 (presentational)
│   ├── REUSE src/components/Card.tsx
│   ├── REUSE src/components/IconSquircle.tsx
│   └── REUSE src/components/Button.tsx  (size "sm", variant "outline")
├── REUSE src/components/FormScreen.tsx                         scroll scaffold + sticky footer (no refreshControl)
├── REUSE src/components/FormSection.tsx                        C-S2…C-S5
├── REUSE src/components/DisplayField                           rows (compact)
├── REUSE screens/invoice/components/ServiceDetailInvoiceItemComponent.tsx (untouched)
├── REUSE src/components/ActionButtonBottom.tsx                 C-S6 (frozen actions)
└── REUSE src/components/Loading.tsx                            submitting branch (frozen)

src/screens/invoice/components/CreateInvoice.tsx                EDIT  JSX/imports/styles only; CardComponent/Status/className → FormScreen + sections
├── REUSE src/components/NoticeBanner.tsx                       D-S1
├── components/create/InvoiceDraftSummaryCard.tsx               NEW   props §4.1
│   ├── REUSE Card, IconSquircle, StatusBadge (+ INVOICE_STATUS_BADGE from @/types/invoice)
├── REUSE FormSection + DisplayField                            D-S3, D-S4, D-S6
├── components/create/InvoiceDraftItemsSection.tsx              NEW   props §4.1
│   ├── REUSE FormSection, IconSquircle, Button (size "sm", variant "soft")
├── REUSE src/components/EmptyState.tsx                         not-found branch
├── REUSE src/components/FormScreen.tsx + ActionButtonBottom    D-S7 (frozen actions)
├── REUSE components/ConfirmPaymentInvoice.tsx                  untouched (opened by frozen handler)
├── REUSE components/UpdateInvoiceItemsPrice.tsx                untouched (opened by frozen handler)
└── components/CancelPreInvoiceReason.tsx                       EDIT  className → StyleSheet + tokens; NoticeBanner warning
    └── REUSE Input, NoticeBanner, @gorhom/bottom-sheet BottomSheetScrollView
```
3 `NEW` files (all in `src/screens/invoice/components/create/`), 0 `MOVE`. `CardComponent` and `Status` imports are removed
from the two edited files (components stay — used elsewhere). `CancelPreInvoiceReason` is also used by
`InvoiceDetailScreen` (cancel sheet) — it receives the same restyle there automatically, no edit in that screen.

## 4. Data contracts
No change to types, endpoints, queries, hooks or navigation params.

### 4.1 Prop signatures (NEW presentational components)
```ts
// components/create/ConfirmCreateSummaryCard.tsx
interface ConfirmCreateSummaryCardProps {
  /** Pre-formatted, e.g. "5.000.000đ" (built in the screen from calculatedInvoiceData.totalAmount). */
  totalText: string;
  /** Pre-formatted room rent, e.g. "3.000.000đ". */
  roomRentText: string;
  /** Pre-formatted service total, e.g. "2.000.000đ". */
  serviceText: string;
  /** The screen's existing onEdit (navigation.goBack). */
  onEdit: () => void;
}
export default function ConfirmCreateSummaryCard(props: ConfirmCreateSummaryCardProps): React.JSX.Element;

// components/create/InvoiceDraftSummaryCard.tsx
interface InvoiceDraftSummaryCardProps {
  /** Shown as `code || "Chưa cấp mã"`. */
  code?: string;
  /** Already resolved by the parent: `invoice.status ?? InvoiceStatus.DRAFT`. */
  status: InvoiceStatus;
  /** Pre-formatted: `${formatCurrency((Number(invoice.remainingAmount) || 0).toString())}đ`. */
  remainingText: string;
}

// components/create/InvoiceDraftItemsSection.tsx
interface InvoiceDraftItemsSectionProps {
  items: InvoiceItemDetailResponse[];
  /** Parent passes `status === InvoiceStatus.DRAFT` (same rule as the old CardComponent disabled filter). */
  canEditPrice: boolean;
  /** Parent passes the frozen `handleOpenUpdateItemsPrice`. */
  onEditPrice: () => void;
}

// components/CancelPreInvoiceReason.tsx — unchanged public API
type Props = { onSubmit: (reason: string) => void | Promise<void> };
export interface CancelPreInvoiceReasonRef { submit: () => void }
// Module constant (NEW, local): SHEET_FOOTER_CLEARANCE = 120  // same value/meaning as in ConfirmPaymentInvoice
```

### 4.2 Endpoints
| Method | Path | Query | Response `data` | Backend status |
| --- | --- | --- | --- | --- |
| — | unchanged (`createInvoice`, `getInvoice`, `confirmInvoice`, `paymentInvoice`, `updateInvoiceItems`, `cancelContractPreInvoice`) | — | — | EXISTS |

### 4.3 Hook contract
None (screens keep their current local state / direct API calls — refactoring them into a hook is a logic change, out of scope).

### 4.4 Derived display-only values (pure, no logic change)
| Where | Const (render scope, after frozen code) | Exact expression |
| --- | --- | --- |
| ConfirmCreate | `roomRentText` | `` `${formatCurrency((invoice.invoiceItems?.find((item) => item.type === InvoiceItemType.ROOM_RENT)?.amount \|\| 0).toString())}đ` `` (used by C-S1 and C-S5; replaces the two identical inline copies) |
| ConfirmCreate | `serviceText` | `` `${formatCurrency(totalServiceAmount.toString())}đ` `` |
| ConfirmCreate | `totalText` | `` `${formatCurrency(calculatedInvoiceData.totalAmount.toString())}đ` `` |
| ConfirmCreate | `serviceItems` | `calculatedInvoiceData.invoiceItemsWithTotal.filter((item) => item.type === InvoiceItemType.SERVICE_FEE)`; empty check `serviceItems.length === 0`; `isLast={idx === serviceItems.length - 1}`; `key` unchanged `` `${calc.contractServiceId \|\| idx + 1}` `` |
| CreateInvoice | `remainingText` | `` `${formatCurrency((Number(invoice.remainingAmount) \|\| 0).toString())}đ` `` |
| CreateInvoice D-S4 values | — | exactly the old `renderRow` value arguments (`formatDateSafe(...)` period string, `formatDateSafe(invoice.dueDate)`, `` `${formatCurrency((invoice.totalAmount \|\| 0).toString())}đ` ``, paid, remaining) |
| D-S2 | `iconTone` | `status === PAID` → `success` · `status === CANCELLED` → `neutral` · else `primary` |
| D-S2 | `badge` | `INVOICE_STATUS_BADGE[status]` (same label source as the old `Status` + `INVOICE_STATUS_OPTIONS`) |
| D-S5 rows | `amount` | unchanged `item.totalAmount ?? item.amount ?? 0`; key unchanged `` item.id \|\| `${item.type}-${idx}` `` |

## 5. States & micro-interactions
| Section | Loading | Fetching | Error | Empty | Touch → action |
| --- | --- | --- | --- | --- | --- |
| ConfirmCreate screen | `isSubmitting` → `<Loading />` (frozen branch) | — | Toasts (frozen) | — | — |
| C-S1 edit | — | — | — | — | `Button` (PressableScale inside) → `onEdit` (goBack) |
| C-S3 notes | — | — | — | divider + notes field hidden when `!invoice.notes` | — |
| C-S4 | — | — | — | caption `Không có dịch vụ nào` | — |
| C-S6 | button `isLoading: isSubmitting` (frozen) | — | — | — | `onSubmit` / `onEdit` (frozen) |
| CreateInvoice screen | `loading` → `<Loading />` (frozen branch) | refetch after actions keeps old `loading` behavior (frozen) | `!invoice` → centered `EmptyState` (no retry — none before) | — | — |
| D-S5 action | — | — | — | hidden unless `canEditPrice` | `Button sm soft` "Cập nhật giá" → `onEditPrice` (opens UpdateInvoiceItemsPrice sheet, frozen) |
| D-S5 list | — | — | — | caption `Chưa có khoản mục nào` | none (static rows) |
| D-S6 | — | — | — | text `Không có ghi chú` | — |
| D-S7 | `isLoading` by `isSubmitting` / `isCancelling` / `isConfirming` (frozen) | — | Toasts (frozen) | cancel hidden when not DRAFT on pre-invoice (frozen) | frozen handlers |
| Back-lock | — | — | — | — | hardware back / swipe / header back blocked while pre-invoice DRAFT (frozen effect) |
| Cancel sheet | — | — | Input `error` from `validate` (frozen messages) | — | footer "Xác nhận hủy" → `refCancelForm.current?.submit()` (frozen) |

Exact styles per element (coder makes no choices; all `StyleSheet.create` at file bottom):

| Element | Style |
| --- | --- |
| C-S1 / D-S2 card | `Card` default (soft, p16) with `style={styles.card}` → `gap 16` |
| C-S1 / D-S2 header row | `flexDirection row`, `alignItems center`, `gap 12` |
| Header text col | `flex 1`, `gap 2` |
| C-S1 title | `uiType.section` + `lineHeight 24`, `numberOfLines 1`, text `Xác nhận tạo hóa đơn` |
| C-S1 subtitle | `uiType.caption`, `numberOfLines 2`, text `Kiểm tra kỹ các thông tin trước khi xác nhận` |
| C-S1 edit button | `Button label="Chỉnh sửa" icon="create-outline" variant="outline" size="sm" onPress={onEdit}` |
| D-S2 label + code | label `uiType.caption` text `Mã hóa đơn`; code `uiType.section` + `lineHeight 24`, `numberOfLines 1`, text `code \|\| "Chưa cấp mã"` |
| D-S2 badge | `StatusBadge label={badge.label} tone={badge.tone}` |
| Amount tile (both) | `backgroundColor uiColors.canvas`, `borderRadius uiRadius.tile`, `padding uiSpace.card`, `gap 4`; label `uiType.eyebrow` (C: `Tổng tiền cần thu`, D: `Số tiền cần thanh toán`); value `uiType.display` + `color tokens.colors.info`, `numberOfLines 1`, `adjustsFontSizeToFit` |
| C-S1 breakdown | `gap 8`; rows `flexDirection row`, `justifyContent space-between`, `alignItems center`; label `uiType.body`, value `uiType.bodyStrong` (`Tiền thuê` / `Dịch vụ`) |
| DisplayField rows | `compact` always; `strong` exactly where the old `renderRow` had `strong=true` (C: Phòng · D: Phòng, Tổng tiền, Còn lại); D `Đã thanh toán` adds `valueStyle={{ color: tokens.colors.success }}` via a `styles.successValue` entry |
| C-S3 notes | `View style={styles.divider}` (`height 1`, `backgroundColor uiColors.hairline`) then `DisplayField direction="vertical" label="Ghi chú" value={invoice.notes} compact` |
| D-S4 divider | same `styles.divider` between `Hạn thanh toán` and `Tổng tiền` |
| C-S4 list | plain `View` wrapping the mapped `ServiceDetailInvoiceItemComponent`s (it draws its own dividers); empty → `Text uiType.caption` |
| C-S5 rows | `styles.row` as above; `Tổng cộng` row adds `styles.totalRow` (`paddingTop 12`, `borderTopWidth StyleSheet.hairlineWidth`, `borderTopColor uiColors.hairline`); label `uiType.bodyStrong`, value `uiType.section` + `color tokens.colors.primary` (identical to `InvoiceCostCard`) |
| D-S5 row | `flexDirection row`, `alignItems center`, `gap 12`, `paddingVertical 12`; idx > 0 adds `borderTopWidth StyleSheet.hairlineWidth`, `borderTopColor uiColors.hairline`; first row `paddingTop 0`, last row `paddingBottom 0`; name `uiType.bodyStrong` + `flex 1`, `numberOfLines 1`, text `item.name \|\| "Khoản mục"`; amount `uiType.bodyStrong` text `` `${formatCurrency(amount.toString())}đ` `` |
| D-S5 action | `Button label="Cập nhật giá" icon="create-outline" variant="soft" size="sm" accessibilityLabel="Cập nhật giá"` |
| D-S6 text | `uiType.body` |
| Not-found wrap | `flex 1`, `justifyContent center`, `padding uiSpace.screen`, `backgroundColor uiColors.canvas` |
| Cancel sheet content | `padding uiSpace.card`, `paddingBottom SHEET_FOOTER_CLEARANCE`, `gap 16` (identical to `ConfirmPaymentInvoice.styles.content`) |

## 6. Navigation map
| Element | Route | Params |
| --- | --- | --- |
| C-S1 "Chỉnh sửa" / footer "Chỉnh sửa thông tin" | `navigation.goBack()` (frozen `onEdit`) | — |
| Create success | `navigation.popToTop()` (frozen) | — |
| D footer "Hủy" (non pre-invoice) | `navigation.goBack()` (frozen) | — |
| Pre-invoice cancel success | `requestAnimationFrame(() => navigation.goBack())` (frozen) | — |

## 7. Implementation steps
1. **Cancel reason sheet** — file `components/CancelPreInvoiceReason.tsx`. Replace `className="p-4"` with
   `contentContainerStyle={styles.content}` (keep `keyboardShouldPersistTaps="handled"`); replace the gray `Text` with
   `NoticeBanner tone="warning" icon="warning" message="…exact existing copy…"`; keep the `Controller` block byte-identical;
   add `SHEET_FOOTER_CLEARANCE = 120`, JSDoc ASCII from §2.3, `StyleSheet.create` at bottom; imports: add `StyleSheet`,
   `NoticeBanner`, `uiSpace` (drop `Text` if unused). ~35 lines.
2. **ConfirmCreateSummaryCard (NEW)** — file `components/create/ConfirmCreateSummaryCard.tsx` per §4.1 / §5 (Card, header row,
   tile, breakdown), JSDoc ASCII (C-S1 of §2.1). ~100 lines. Not yet used → compiles alone.
3. **ConfirmCreateInvoiceScreen restyle** — replace the `return (<> KeyboardAwareScrollView … </> )` block with
   `FormScreen footer={<ActionButtonBottom actions={…frozen array…} />}` containing C-S1 (`ConfirmCreateSummaryCard`) and
   C-S2…C-S5 per §2.1/§5; add the §4.4 display consts right after the frozen `if (isSubmitting)` branch; delete
   `renderRow`; remove imports `CardComponent`, `TouchableOpacity`, `KeyboardAwareScrollView`, `Ionicons`, `tokens` only if
   unused; add `FormScreen`, `FormSection`, `DisplayField`, `StyleSheet`, `uiColors`, `uiType`, `tokens` as needed; add a
   screen JSDoc with the §2.1 ASCII; delete the commented-out `ServiceCalculation` type block only if it is directly above
   the JSDoc you add (optional, comments only). Do not touch lines of the frozen list in §1. ~150 lines.
4. **InvoiceDraftSummaryCard (NEW)** — file `components/create/InvoiceDraftSummaryCard.tsx` per §4.1 / §5, JSDoc ASCII (D-S2). ~90 lines.
5. **InvoiceDraftItemsSection (NEW)** — file `components/create/InvoiceDraftItemsSection.tsx` per §4.1 / §5 (FormSection with
   caption + conditional `action`, rows, empty caption), JSDoc ASCII (D-S5). ~100 lines.
6. **CreateInvoice restyle** — replace the not-found branch JSX with `emptyWrap` + `EmptyState` (§2.2); replace the main
   `return (<> KeyboardAwareScrollView … ActionButtonBottom </>)` with `FormScreen footer={<ActionButtonBottom actions={…frozen array…} />}`
   containing D-S1…D-S6 (pass `code={invoice.code}`, `status={status}`, `remainingText`, `items={invoiceItems}`,
   `canEditPrice={status === InvoiceStatus.DRAFT}`, `onEditPrice={handleOpenUpdateItemsPrice}`); delete `renderRow` and the
   commented-out `statusColor` / `INVOICE_STATUS_LABEL` JSX comments; remove imports `CardComponent`, `Status`,
   `INVOICE_STATUS_OPTIONS`, `KeyboardAwareScrollView`, `Ionicons`, `InvoiceItemType` (only if unused), `tokens` (only if
   unused); add `FormScreen`, `FormSection`, `DisplayField`, `NoticeBanner`, `EmptyState`, `StyleSheet`, theme tokens; add a
   component JSDoc with the §2.2 ASCII; `StyleSheet.create` at the bottom. Every handler / effect / ref stays byte-identical. ~150 lines.
7. **Validate** per §9 and fill Implementation notes.

## 8. Acceptance criteria (Reviewer checks every ID)
- **AC-1** `git diff` of `ConfirmCreateInvoiceScreen.tsx` shows no change inside: the props type, `isSubmitting` state, the `calculatedInvoiceData` `useMemo` body + deps, `totalServiceAmount`, `onEdit`, `onSubmit` (payload, API call, Toast `text1`/`text2`, `popToTop`, `finally`), the `if (isSubmitting) return <Loading />` branch, and the footer `actions` array entries (labels `Xác nhận tạo hóa đơn` / `Chỉnh sửa thông tin`, icons, variants, `isLoading`, `onPress`). Changes are limited to imports, JSDoc, the returned JSX, new display consts (§4.4), removal of `renderRow`, and `styles`.
- **AC-2** `git diff` of `CreateInvoice.tsx` shows no change inside: `CreateInvoiceProps`, `formatDateSafe`, all state/refs/hooks, `fetchInvoice`, both `useEffect`s, `isBackLocked`, `handleCancelPreInvoice` (incl. `isCancellingRef` guard, `cancelContractPreInvoice(invoice.contractId, reason)`, `["rooms"]`/`["homepage"]` invalidation, `setInvoice({...CANCELLED})`, `requestAnimationFrame(goBack)`), `handleOpenCancelPreInvoice`, `handleSavePayment`, `handleOpenPaymentForm`, `handleSaveInvoiceItemsPrice`, `handleOpenUpdateItemsPrice`, `handleConfirmInvoice` (all snap points, sheet titles, footer action arrays), the `if (loading)` branch, `status` / `invoiceItems` consts and the footer `actions` array (incl. `isPreInvoice` ternary and `hidden: status !== InvoiceStatus.DRAFT`).
- **AC-3** `git diff` of `CancelPreInvoiceReason.tsx` leaves `FormValues`, `Props`, `CancelPreInvoiceReasonRef`, `MAX_REASON_LENGTH`, `useForm`, `useImperativeHandle` and the whole `Controller` element unchanged; `onSubmit` prop and `ref.submit()` work from both `CreateInvoice` and `InvoiceDetailScreen` without edits there.
- **AC-4** `ConfirmPaymentInvoice.tsx`, `UpdateInvoiceItemsPrice.tsx`, `ServiceDetailInvoiceItemComponent.tsx`, `InvoiceDetailScreen.tsx`, `ConfirmDraftInvoiceScreen.tsx`, `App.tsx`, `navigation/types.ts` and all `src/api/*` / `src/types/*` files have an empty diff.
- **AC-5** The three edited files and the three NEW files contain zero `className`, no `CardComponent`, no `TouchableOpacity`, no `KeyboardAwareScrollView` import (scrolling comes from `FormScreen`), and use `StyleSheet.create` + `tokens`/`uiColors`/`uiType`/`uiRadius`/`uiSpace` only.
- **AC-6** ConfirmCreateInvoice renders, top to bottom: summary card (receipt `IconSquircle` info, title `Xác nhận tạo hóa đơn`, caption `Kiểm tra kỹ các thông tin trước khi xác nhận`, outline `Chỉnh sửa` button calling goBack, amount tile `Tổng tiền cần thu` with the total, `Tiền thuê` / `Dịch vụ` rows), then `FormSection`s `Thông tin hợp đồng`, `Thông tin thanh toán` (notes block only when `invoice.notes` is truthy), `Chi tiết dịch vụ` (caption + rows or `Không có dịch vụ nào`), `Tóm tắt thanh toán` (hairline + `Tổng cộng` in primary), with the action bar sticky as `FormScreen.footer`. Displayed amounts equal the pre-change values for the same input.
- **AC-7** ConfirmDraftInvoice renders: success `NoticeBanner` with the exact existing sentence, draft summary card (`Mã hóa đơn`, `code || "Chưa cấp mã"`, `StatusBadge` from `INVOICE_STATUS_BADGE[status]`, tile `Số tiền cần thanh toán`), `Thông tin hợp đồng` (Tòa nhà only when `propertyName`), `Thông tin thanh toán` (Kỳ / Hạn / divider / Tổng tiền / Đã thanh toán / Còn lại), `Chi tiết hóa đơn` (caption `Các khoản mục được tính trong hóa đơn`, `Cập nhật giá` button visible only for DRAFT and opening the update-price sheet, rows or `Chưa có khoản mục nào`), `Ghi chú` (`Không có ghi chú` fallback), sticky footer.
- **AC-8** `!invoice` (after loading) shows a centered `EmptyState` with title `Không tìm thấy hóa đơn` and description `Hóa đơn của hợp đồng chưa được tạo hoặc đã xảy ra lỗi khi tải dữ liệu.`, no extra buttons.
- **AC-9** Pre-invoice back-lock unchanged: while the pre-invoice is DRAFT the native header back button is hidden, swipe-back and Android hardware back are blocked; after cancel success the screen leaves via goBack; the native header titles of both routes are unchanged.
- **AC-10** Cancel sheet: content padded 16 with 120 bottom clearance, warning `NoticeBanner` with the exact existing copy, `Lý do hủy` area input; the input stays fully visible above the sheet footer at 50% snap; empty/too-long reason still shows `Vui lòng nhập lý do hủy` / `Lý do tối đa 500 ký tự`; pressing `Xác nhận hủy` twice quickly triggers one API call.
- **AC-11** All UI copy Vietnamese and unchanged (except the D-S2/D-S5 layout reuse of existing strings); all new code comments English; every edited/NEW component has a JSDoc layout note with ASCII.
- **AC-12** `npx tsc --noEmit` shows no new errors in touched files; `npm run check:colors` passes; iOS export bundles.

## 9. Validation
- `cd mobile && npx tsc --noEmit 2>&1 | grep -E "ConfirmCreateInvoiceScreen|components/CreateInvoice|CancelPreInvoiceReason|components/create/"` (expect nothing new)
- `cd mobile && npm run check:colors`
- `cd mobile && npx expo export --platform ios --output-dir /tmp/invoice-create-export` (then `rm -rf /tmp/invoice-create-export`)
- Diff review for AC-1…AC-4: `git diff -- mobile/src/screens/invoice/ConfirmCreateInvoiceScreen.tsx mobile/src/screens/invoice/components/CreateInvoice.tsx mobile/src/screens/invoice/components/CancelPreInvoiceReason.tsx` and `git diff --stat` (only the 3 edited + 3 new files + this blueprint).
- Manual: create an invoice from a room → confirm screen → create; create a contract → pre-invoice (DRAFT) → try back (blocked), update price, confirm, record payment, cancel with reason (empty reason error, double tap); open an invoice detail and use its cancel sheet.

## 10. Assumptions & open questions
- **Native header kept** — unlike InvoiceDetail/UpdateRoom, both routes keep the native header: `CreateInvoice` drives the back-lock through `navigation.setOptions({ headerBackVisible, gestureEnabled })`, and ConfirmCreate relies on `headerBackTitle: "Chỉnh sửa"`. Swapping to `ScreenHeader` would change navigation/back-lock behavior, which is frozen. `FormScreen` is documented for native-header stack screens, so no `SafeAreaView`/`ScreenHeader` wrapper is added.
- **Summary merge (ConfirmCreate)** — the old "header" card and "total" card are merged into one summary card (identity row + amount tile + breakdown), mirroring `InvoiceSummaryCard`; copy is preserved verbatim. The `Tiền thuê` / `Dịch vụ` rows intentionally appear both in the summary and in `Tóm tắt thanh toán` (as before).
- **Tile color** — amount tiles keep the old `info` color (not the detail's status-driven color) because both amounts are "to collect" previews; the `Tổng cộng` row uses `primary` to match `InvoiceCostCard`.
- **`Status` → `StatusBadge`** — `INVOICE_STATUS_OPTIONS` is derived from `INVOICE_STATUS_BADGE`, so labels/tones are identical; `StatusBadge` matches the detail screen.
- **`Đã thanh toán` success color** — display-only, mirrors `Đã thu` in `InvoiceSummaryCard`.
- **"Cập nhật giá" action** — old `CardComponent` dropped actions with `disabled: true`, so the icon was only visible for DRAFT. The new soft `Button` uses the same visibility rule (`canEditPrice = status === DRAFT`), now with a visible label.
- **Notes condition** — `{invoice.notes && (…)}` becomes `invoice.notes ? (…) : null` (same truthiness; avoids rendering a raw empty string outside `Text`).
- **Sheet footers not restyled** — the CreateInvoice sheets use `variant: "danger"` for `Hủy` and label `Xác Nhận` while InvoiceDetail uses `outline` / `Xác nhận`; these live inside frozen handlers, so the inconsistency is left as-is (follow-up if logic edits are later allowed).
- **`SHEET_FOOTER_CLEARANCE` duplicated** — same local constant (120) as `ConfirmPaymentInvoice`; not promoted to a shared file to avoid editing `ConfirmPaymentInvoice` (out of scope). Adjust only if AC-10 fails on a device; log it in Implementation notes.
- **Out of scope** — `UpdateInvoiceItemsPrice` and `ServiceDetailInvoiceItemComponent` still use `className`; they keep working unchanged (follow-up migration). Pre-existing `catch (error: any)` and `navigation as any` (host) are inside frozen code and stay.
- **No retry on not-found** — the old empty view had no retry; adding `SectionError` + `fetchInvoice` would be new behavior, so `EmptyState` without action is used.
- **Warning tone on the cancel notice** — the copy describes an irreversible action, so the plain gray text becomes a `warning` `NoticeBanner` (display-only).

---

## Implementation notes
<!-- Filled by UI Coder. -->
- Files changed:
  - EDIT `mobile/src/screens/invoice/components/CancelPreInvoiceReason.tsx` (className → StyleSheet, NoticeBanner warning, SHEET_FOOTER_CLEARANCE 120; Controller/useForm/useImperativeHandle untouched)
  - EDIT `mobile/src/screens/invoice/ConfirmCreateInvoiceScreen.tsx` (imports, JSDoc, display consts, renderRow removed, FormScreen + sections; frozen handlers/useMemo/actions content untouched)
  - EDIT `mobile/src/screens/invoice/components/CreateInvoice.tsx` (imports, JSDoc, not-found EmptyState, renderRow removed, FormScreen + sections; all state/effects/handlers/sheets/loading branch untouched)
  - NEW `mobile/src/screens/invoice/components/create/ConfirmCreateSummaryCard.tsx`
  - NEW `mobile/src/screens/invoice/components/create/InvoiceDraftSummaryCard.tsx`
  - NEW `mobile/src/screens/invoice/components/create/InvoiceDraftItemsSection.tsx`
- Deviations from blueprint (with reason):
  - Commented-out code removed (repo rule: no commented-out code): the `// type ServiceCalculation` block in ConfirmCreateInvoiceScreen, the `// const statusColor` line and the commented `renderRow("Hóa đơn tháng")` JSX in CreateInvoice, and the commented status-chip JSX in CreateInvoice. Comments only, no logic.
  - Footer `ActionButtonBottom` is wrapped as the `footer={…}` prop of `FormScreen`, so the action array is re-indented. Labels, icons, variants, `isLoading`, `hidden` and handlers are unchanged.
  - CancelPreInvoiceReason JSDoc ASCII uses `(!)` instead of a non-ASCII warning glyph.
  - Not verified on device: AC-9 back-lock and AC-10 sheet clearance / double-tap (manual checks in §9 remain for the reviewer or device run).
- Validation results:
  - `npx tsc --noEmit`: 0 errors in touched files / `components/create/` (54 pre-existing errors elsewhere, none new).
  - `npm run check:colors`: passes (57 hex, same baseline, none new).
  - `npx expo export --platform ios`: bundles; output dir removed afterwards.
  - `npx prettier --check` on the 6 touched files: pass.
  - Greps on the 6 files: no `className`, `CardComponent`, `TouchableOpacity`, `KeyboardAwareScrollView`; only pre-existing frozen `catch (error: any)` remain.
  - `git diff` hunks in the two edited screens fall only in imports, JSDoc, removed `renderRow`, display consts, returned JSX and styles; no hunk in props / state / `useMemo` / handlers / effects / sheet configs / `loading` branch.
  - Backend: n.a.

## Review log
<!-- Appended by UI Reviewer, newest round last. -->
