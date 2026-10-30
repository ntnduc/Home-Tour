# Blueprint — Invoice detail + payment sheet restyle (UpdateRoom base UI)

| Field | Value |
| --- | --- |
| Status | `IMPLEMENTED` |
| Request | Restyle `InvoiceDetailScreen` + its 4 detail section components to the UpdateRoom base UI (ScreenHeader · FormScreen · summary Card · FormSection cards · sticky ActionButtonBottom), and restyle the `ConfirmPaymentInvoice` bottom-sheet form to StyleSheet + tokens, with zero business-logic / data-flow change. |
| Scope | Frontend only (no API, type, hook or backend change) |
| Screen route | `InvoiceDetail` in `RootStackParamList` (`{ invoiceId; fromHistory?; confirmContractId? }`) |
| Design system | `.claude/rules/mobile-ui-design.md` |
| Base reference | `mobile/src/screens/room/UpdateRoomScreen.tsx` (+ `src/components/FormScreen.tsx`, `FormSection.tsx`, `ScreenHeader.tsx`, `Card.tsx`, `IconSquircle.tsx`) |

## 1. Goal & UX narrative
The landlord opens an invoice to answer "how much is still owed and can I record a payment now?". Reading order mirrors
UpdateRoom: full-bleed `ScreenHeader` (back + title + history shortcut) → late warning (only when late) → identity summary
card (code · place · status) with the money overview → titled `FormSection` cards (contract facts, billing facts, service
lines, cost summary, payment history, notes) → sticky action bar (cancel / record payment, by status). Recording a payment
opens a bottom sheet whose content follows one shared sheet-content convention (gutter padding, amount tile, grouped
fields, StyleSheet + tokens).

**Frozen (must not change):** `useInvoiceDetailData` usage and return values, `handlePay` / `handleCancel` /
`handleStartPayment` / `handleOpenPaymentForm` / `handleOpenCancelForm` bodies (sheet configs, Toasts, double-submit
refs, `closeAppSheet`, `goBack` on `confirmContractId`), `CONTRACT_PAYMENT_ALERT` text, `getInvoiceActionRules` /
`isInvoiceLate` / `getDaysOverdue`, focus-refetch logic, `ConfirmPaymentInvoice` props/ref API, form defaults, validation
rules and the submitted `InvoicePaymentRequest` mapping.

## 2. Layout blueprint

### 2.1 Screen
```
SafeAreaView edges={[]} · bg uiColors.canvas
┌─────────────────────────────────────────────┐
│ ░ orbs ░  ‹  Chi tiết hóa đơn        (🕘)   │ S0 ScreenHeader insetTop · onBack · action = IconButton
│                                             │    "time-outline" (hidden when fromHistory)
├─────────────────────────────────────────────┤
│ FormScreen (KeyboardAwareScrollView)        │ gutter 20 · top 16 · gap 12 · RefreshControl
│ ┌ ⚠ Hóa đơn quá hạn ──────────────────────┐ │ S1 NoticeBanner tone error (late only) — unchanged
│ │ Quá hạn 5 ngày (hạn: 01/10/2026)        │ │
│ └─────────────────────────────────────────┘ │
│ ┌ Card soft r24 p16 ──────────────────────┐ │ S2 InvoiceSummaryCard
│ │ ▣  #HD-001                ● Chờ TT      │ │    IconSquircle md "receipt-outline" · title · StatusBadge
│ │    Phòng 101 • Tòa A                    │ │    caption place
│ │ ┌ tile canvas r20 p16 ────────────────┐ │ │    amount tile
│ │ │ CÒN PHẢI THU                        │ │ │    eyebrow
│ │ │ 2.500.000đ                          │ │ │    display, color by status
│ │ └─────────────────────────────────────┘ │ │
│ │ Tổng tiền                   5.000.000đ  │ │    body / bodyStrong rows (gap 8)
│ │ Đã thu                      2.500.000đ  │ │    success color
│ │ Ghi nợ sang kỳ sau            300.000đ  │ │    only when carriedOverAmount > 0
│ └─────────────────────────────────────────┘ │
│ ┌ FormSection ▣ Thông tin hợp đồng ───────┐ │ S3 InvoiceInfoCard (part 1)
│ │ ─────────────────────────────────────── │ │
│ │ Phòng                       Phòng 101   │ │ DisplayField compact (strong)
│ │ Người thuê                  Nguyễn A    │ │
│ │ Tòa nhà                     Tòa A       │ │
│ └─────────────────────────────────────────┘ │
│ ┌ FormSection ▣ Thông tin thanh toán ─────┐ │ S4 InvoiceInfoCard (part 2)
│ │ Kỳ thanh toán     01/09/2026 - 30/09/2026│ │
│ │ Hạn thanh toán    01/10/2026 (error)    │ │ error color + strong when late
│ │ Ngày tạo          25/09/2026            │ │ only when createdAt
│ └─────────────────────────────────────────┘ │
│ ┌ FormSection ▣ Chi tiết dịch vụ ─────────┐ │ S5 InvoiceCostCard (part 1)
│ │   Các dịch vụ được tính trong hóa đơn…  │ │ caption
│ │ ServiceDetailInvoiceItemComponent rows  │ │ or caption empty line
│ └─────────────────────────────────────────┘ │
│ ┌ FormSection ▣ Tóm tắt chi phí ──────────┐ │ S6 InvoiceCostCard (part 2)
│ │ Tiền thuê                   3.000.000đ  │ │
│ │ Dịch vụ                     2.000.000đ  │ │
│ │ ─────────────────────────────────────── │ │ hairline
│ │ Tổng cộng                   5.000.000đ  │ │ section 18/28 bold primary
│ └─────────────────────────────────────────┘ │
│ ┌ FormSection ▣ Lịch sử thanh toán   [2]  │ │ S7 InvoicePaymentHistory (hidden when empty)
│ │ ▣ 12/05/2026             +2.500.000đ    │ │ rows unchanged (hairline between)
│ │   Tiền mặt · ghi chú     ● Đã thanh toán│ │
│ └─────────────────────────────────────────┘ │
│ ┌ FormSection ▣ Ghi chú ──────────────────┐ │ S8 notes (only when invoice.notes)
│ │ text body                               │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ [ ⊗ Hủy hóa đơn ]  [ 💵 Ghi nhận thanh toán ]│ S9 ActionButtonBottom as FormScreen footer (unchanged actions)
└─────────────────────────────────────────────┘
```

### 2.2 Payment sheet (`ConfirmPaymentInvoice`, snap 80%, header "Ghi nhận thanh toán", footer Hủy / Xác nhận — all unchanged)
```
BottomSheetScrollView · contentContainerStyle: padding 16 (uiSpace.card) · paddingBottom SHEET_FOOTER_CLEARANCE (120) · gap 16
┌ amount tile · bg uiColors.canvas · radius 20 · padding 16 · row gap 12 ┐
│ ▣ wallet-outline (IconSquircle md tone info)                          │
│    SỐ TIỀN CÒN LẠI                     eyebrow                        │
│    2.500.000đ                          title 24/36 bold, color info   │
└───────────────────────────────────────────────────────────────────────┘
Group "money" (gap 12)
  Input  Số tiền thanh toán *  (icon cash)                 unchanged props/rules
  ┌ (only when isPartialPayment) carry box · bg canvas · r14 · p12 · gap 4 ┐
  │ Switch  Ghi nợ vào tháng sau        (horizontal)                        │
  │ Còn thiếu: 500.000đ                 caption, color amber[500]           │
  └─────────────────────────────────────────────────────────────────────────┘
───────────── hairline (1, uiColors.hairline) ─────────────
Group "details" (gap 12)
  DatePicker  Ngày thanh toán * (disabled, icon calendar)   unchanged props
  ComboBox    Phương thức thanh toán * (icon card-outline)  unchanged props
  Input area  Ghi chú                                       unchanged props
```

| # | Section | Card size | Shadow | Radius | Data source | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| S0 | ScreenHeader | full-bleed | animated (none, no `scrollY`) | — | route `fromHistory` | `insetTop`, `onBack=goBack`, history `IconButton` |
| S1 | Late notice | full | — | NoticeBanner own | `invoice` | unchanged |
| S2 | Summary | full | soft (`Card` default) | 24 (inner tile 20) | `invoice` | mirrors UpdateRoom summary row + amount tile |
| S3 | Contract info | full | soft | 24 | `invoice` | `FormSection` |
| S4 | Billing info | full | soft | 24 | `invoice` | `FormSection` |
| S5 | Service lines | full | soft | 24 | `invoice.invoiceItems` | `FormSection` + caption |
| S6 | Cost summary | full | soft | 24 | `invoice` | `FormSection` |
| S7 | Payment history | full | soft | 24 | `payments` | `FormSection`, count badge in `action` |
| S8 | Notes | full | soft | 24 | `invoice.notes` | `FormSection` |
| S9 | Action bar | full sticky | ActionButtonBottom own | — | `getInvoiceActionRules` | passed as `FormScreen.footer` |

Icon / tone table (Ionicons, `FormSection.icon`, `iconTone` default `primary` unless stated):

| Section | Title (exact) | Icon | iconTone | caption |
| --- | --- | --- | --- | --- |
| S2 summary leading | — | `receipt-outline` (IconSquircle `md`) | PAID→`success`, CANCELLED→`neutral`, late→`error`, else `primary` | — |
| S3 | `Thông tin hợp đồng` | `reader-outline` | primary | — |
| S4 | `Thông tin thanh toán` | `calendar-outline` | late→`error`, else primary | — |
| S5 | `Chi tiết dịch vụ` | `flash-outline` | primary | `Các dịch vụ được tính trong hóa đơn này` |
| S6 | `Tóm tắt chi phí` | `calculator-outline` | primary | — |
| S7 | `Lịch sử thanh toán` | `time-outline` | success | — |
| S8 | `Ghi chú` | `document-text-outline` | primary | — |

## 3. Component tree
```
App.tsx                                                     EDIT  InvoiceDetail options → { headerShown: false } (drop title/headerRight)
src/components/FormScreen.tsx                               EDIT  add optional prop refreshControl (additive, default undefined)
src/screens/invoice/InvoiceDetailScreen.tsx                 EDIT  layout only: SafeAreaView + ScreenHeader + FormScreen(footer)
├── REUSE src/components/ScreenHeader.tsx                   title "Chi tiết hóa đơn", insetTop, onBack, action
├── REUSE src/components/IconButton.tsx                     history shortcut (icon "time-outline")
├── REUSE src/components/FormScreen.tsx                     scroll scaffold + sticky footer + refreshControl
├── REUSE src/components/NoticeBanner.tsx                   S1 unchanged
├── components/detail/InvoiceSummaryCard.tsx                EDIT  props: { invoice; isLate } (isLate NEW optional prop, see 4.1)
│   ├── REUSE src/components/Card.tsx  (elevation soft)
│   ├── REUSE src/components/IconSquircle.tsx
│   └── REUSE src/components/StatusBadge.tsx
├── components/detail/InvoiceInfoCard.tsx                   EDIT  CardContent → FormSection ×2 (props unchanged)
│   └── REUSE src/components/DisplayField
├── components/detail/InvoiceCostCard.tsx                   EDIT  CardContent → FormSection ×2; EmptyState → caption line (props unchanged)
│   └── REUSE screens/invoice/components/ServiceDetailInvoiceItemComponent.tsx (untouched)
├── components/detail/InvoicePaymentHistory.tsx             EDIT  CardContent → FormSection + count badge (props unchanged)
│   └── REUSE SectionError, IconSquircle, StatusBadge
├── S8 notes                                                REUSE src/components/FormSection.tsx (inline in screen, replaces CardContent)
├── REUSE src/components/ActionButtonBottom.tsx             S9 (same actions array)
├── REUSE src/components/Loading.tsx / SectionError.tsx     loading / error states
└── components/ConfirmPaymentInvoice.tsx                    EDIT  className → StyleSheet + tokens; amount tile; carry box; groups
    ├── REUSE Input, Switch, DatePicker, ComboBox, IconSquircle
    └── REUSE @gorhom/bottom-sheet BottomSheetScrollView
```
No `NEW` files, no `MOVE`. `CardContent` import is removed from all 4 detail files + screen (component itself stays, used elsewhere).

## 4. Data contracts
No change to types, endpoints, hook or query keys.

### 4.1 Prop signatures (only additions)
```ts
// src/components/FormScreen.tsx — additive
export interface FormScreenProps {
  children: ReactNode;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** Forwarded to KeyboardAwareScrollView (pull-to-refresh on detail screens). */
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

// components/detail/InvoiceSummaryCard.tsx
interface InvoiceSummaryCardProps {
  invoice: InvoiceDetailResponse;
  /** Drives the leading IconSquircle tone only (error when late). Default false. */
  isLate?: boolean;
}

// components/detail/InvoiceInfoCard.tsx   — unchanged: { invoice: InvoiceDetailResponse; isLate: boolean }
// components/detail/InvoiceCostCard.tsx   — unchanged: { invoice: InvoiceDetailResponse }
// components/detail/InvoicePaymentHistory.tsx — unchanged:
//   { payments: BasePagingResponse<PaymentDetailResponse> | never[]; isError: boolean; onRetry: () => void }

// components/ConfirmPaymentInvoice.tsx — unchanged public API
type Props = { invoice: InvoiceDetailResponse; onSubmit?: (data: InvoicePaymentRequest) => void | Promise<void> };
export interface ConfirmPaymentInvoiceRef { submit: () => void }
// Module constant (NEW, local): SHEET_FOOTER_CLEARANCE = 120  // px under last field so the BottomSheetFooter never covers it
```

### 4.2 Endpoints
| Method | Path | Query | Response `data` | Backend status |
| --- | --- | --- | --- | --- |
| — | (unchanged; via `useInvoiceDetailData`) | — | — | EXISTS |

### 4.3 Hook contract
`useInvoiceDetailData(invoiceId, confirmContractId)` — used exactly as today; destructured fields unchanged
(`invoice, payments, isLoading, isRefreshing, isInvoiceError, isPaymentsError, refetchInvoice, refetchPayments, refreshAll, pay, isPaying, cancel, isCancelling`).

### 4.4 Derived display-only values (no logic change)
| Where | Value | Rule |
| --- | --- | --- |
| Screen | `fromHistory` | read from `route.params` alongside `invoiceId`, `confirmContractId` |
| S2 | `iconTone` | `PAID`→`success` · `CANCELLED`→`neutral` · `isLate`→`error` · else `primary` |
| S7 | count badge | `payments.items.length` (only when `!Array.isArray(payments)`) |
| Sheet | `shortfall` | `invoice.remainingAmount - (amount ?? 0)`, shown only when `isPartialPayment`; formatted `formatCurrency(String(shortfall))` + `đ` |

## 5. States & micro-interactions
| Section | Loading | Fetching / refresh | Error | Empty | Touch (`scaleTo`) → action |
| --- | --- | --- | --- | --- | --- |
| Screen (first load, `isLoading`) | `SafeAreaView` + S0 header + `<Loading />` (mirrors UpdateRoom) | — | `isInvoiceError \|\| !invoice` → S0 header + centered `SectionError` message `Không tải được hóa đơn`, retry `refetchInvoice()` inside `errorWrap` (flex 1, center, padding 20) | — | — |
| S0 back | — | — | — | — | `IconButton` 0.92 → `navigation.goBack()` |
| S0 history | — | — | — | hidden when `fromHistory` | `IconButton` 0.92, `accessibilityLabel="Lịch sử hóa đơn"` → `navigate("InvoiceHistory")` |
| Pull-to-refresh | — | `RefreshControl refreshing={isRefreshing} onRefresh={refreshAll}` tint/colors `tokens.colors.primary` (data stays visible) | — | — | — |
| S1 | — | — | — | not rendered unless late | — |
| S2–S6, S8 | n/a (screen-level) | keep data | n/a | S5: caption `Không có dịch vụ nào trong hóa đơn này.` · S8 hidden when no notes | none (static cards) |
| S7 | n/a | keep data | `SectionError` message `Không tải được lịch sử thanh toán`, retry `onRetry` (unchanged) | hidden when `items.length === 0` (unchanged) | none |
| S9 | — | buttons `isLoading` by `isCancelling` / `isPaying` (unchanged) | Toasts unchanged | bar renders with hidden actions per rules (unchanged) | pay → `handleStartPayment` (Alert first when `confirmContractId`), cancel → `handleOpenCancelForm` |
| Sheet | — | — | field errors via `Input/DatePicker/ComboBox error` (unchanged rules/messages) | — | footer Xác nhận → `refPaymentForm.current?.submit()` (unchanged) |

Exact type/tokens per element (coder makes no choices):

| Element | Style |
| --- | --- |
| S2 header row | `flexDirection row`, `alignItems center`, `gap 12` (identical to UpdateRoom `summary`) |
| S2 title | `uiType.section` + `lineHeight 24`, `numberOfLines 1`; text `#${code}` or `Hóa đơn` (unchanged copy) |
| S2 place | `uiType.caption`, `numberOfLines 1` |
| S2 card | `gap 16` |
| S2 amount tile | `backgroundColor uiColors.canvas`, `borderRadius uiRadius.tile`, `padding uiSpace.card`, `gap 4`; label `uiType.eyebrow`; value `uiType.display` + status color (logic unchanged), `numberOfLines 1`, `adjustsFontSizeToFit` |
| S2 breakdown | `gap 8`, rows `space-between`; NO top border (tile separates) |
| S3/S4 rows | `DisplayField compact` exactly as today |
| S6 total row | `paddingTop 12`, `borderTopWidth StyleSheet.hairlineWidth`, `borderTopColor uiColors.hairline`; total text `uiType.section` + `color tokens.colors.primary` (replaces ad-hoc 18/28 bold; same metrics) |
| S7 count badge (`FormSection.action`) | pill: `minWidth 24`, `height 24`, `paddingHorizontal 8`, `borderRadius uiRadius.pill`, `backgroundColor uiColors.ink`, centered; text `uiType.caption` + `color tokens.colors.surface` + `fontWeight uiWeight.bold` |
| S7 rows | unchanged (row gap 12, paddingVertical 12, hairline divider); drop the wrapping `View`'s implicit spacing — first row `paddingTop 0` |
| S8 text | `uiType.body` |
| Sheet tile | `flexDirection row`, `alignItems center`, `gap 12`, `backgroundColor uiColors.canvas`, `borderRadius uiRadius.tile`, `padding uiSpace.card`; text col `flex 1, gap 2`; label `uiType.eyebrow`; amount `uiType.title` + `color tokens.colors.info` |
| Sheet groups | each a `View` with `gap uiSpace.gap`; between groups a `View` `height 1`, `backgroundColor uiColors.hairline` |
| Sheet carry box | `backgroundColor uiColors.canvas`, `borderRadius uiRadius.field`, `padding 12`, `gap 4`; shortfall `uiType.caption` + `color tokens.palette.amber[500]`, copy `Còn thiếu: {x}đ` |

## 6. Navigation map
| Element | Route | Params |
| --- | --- | --- |
| Header back | `navigation.goBack()` | — |
| Header history icon (only `!fromHistory`) | `InvoiceHistory` | `undefined` |
| Pay success with `confirmContractId` | `navigation.goBack()` (unchanged, inside `handlePay`) | — |

## 7. Implementation steps
1. **Native header off + FormScreen refresh prop** — files: `mobile/App.tsx` (InvoiceDetail `options` → `{ headerShown: false }`;
   remove the now-unused `Pressable`/`Ionicons` imports only if no other usage remains in App.tsx), `mobile/src/components/FormScreen.tsx`
   (add `refreshControl?` to props + JSDoc, forward to `KeyboardAwareScrollView`). ~25 lines. Compiles alone (screen still renders, without header until step 2).
2. **Screen shell** — file: `InvoiceDetailScreen.tsx`. Read `fromHistory` from `route.params`; build `header` const
   (`ScreenHeader title="Chi tiết hóa đơn" onBack insetTop action={!fromHistory ? IconButton : undefined}`); loading/error
   branches render `SafeAreaView edges={[]}` + header + `Loading` / `errorWrap SectionError`; main branch:
   `SafeAreaView edges={[]} style=screen` → header → `FormScreen footer={ActionButtonBottom…} refreshControl={RefreshControl…}`
   containing S1, S2 (`isLate` passed), S3–S7, S8 as `FormSection title="Ghi chú" icon="document-text-outline"`.
   Remove `ScrollView`, `CardContent`, `styles.content`; update the JSDoc ASCII to §2.1. Do not touch any handler. ~90 lines.
3. **InvoiceSummaryCard** — leading `IconSquircle` row + amount tile + breakdown per §5; add optional `isLate`; update JSDoc ASCII. ~70 lines.
4. **InvoiceInfoCard + InvoiceCostCard** — `CardContent` → `FormSection` with titles/icons/captions from §2 table;
   S4 `iconTone` error when `isLate`; S5 empty → caption line; S6 total uses `uiType.section` + primary; remove
   `EmptyState`/`emptyInner`/`uiWeight` imports if unused; update JSDoc. ~80 lines.
5. **InvoicePaymentHistory** — `CardContent` → `FormSection title="Lịch sử thanh toán" icon="time-outline" iconTone="success" action={count badge}`;
   keep error/empty logic and row markup; first-row `paddingTop 0`. ~40 lines.
6. **ConfirmPaymentInvoice restyle** — remove every `className`; `BottomSheetScrollView contentContainerStyle={styles.content}`
   (keep `nestedScrollEnabled`, `showsVerticalScrollIndicator`; add `keyboardShouldPersistTaps="handled"`); amount tile,
   money group (Input + carry box with Switch + shortfall caption), hairline, details group (DatePicker, ComboBox, note Input);
   add JSDoc ASCII from §2.2; `StyleSheet.create` at bottom; keep `useForm` defaults, `watch`, `isPartialPayment`,
   `useImperativeHandle` body and every Controller `name`/`rules`/props byte-identical. ~110 lines.
7. **Validate** per §9.

## 8. Acceptance criteria (Reviewer checks every ID)
- **AC-1** `InvoiceDetail` shows no native header; the screen renders `ScreenHeader` with title `Chi tiết hóa đơn`, a back button calling `goBack`, and (only when `fromHistory` is falsy) a `time-outline` `IconButton` labelled `Lịch sử hóa đơn` navigating to `InvoiceHistory`.
- **AC-2** Screen structure is `SafeAreaView edges={[]}` → `ScreenHeader` → `FormScreen` with `ActionButtonBottom` passed as `footer` (same as UpdateRoom); no `ScrollView`, no `CardContent`, no `className` in the screen or the 4 detail components.
- **AC-3** Loading state shows the header + `Loading`; invoice error shows the header + `SectionError` "Không tải được hóa đơn" whose retry calls `refetchInvoice`.
- **AC-4** Pull-to-refresh still works: `RefreshControl refreshing={isRefreshing} onRefresh={refreshAll}` tinted `tokens.colors.primary`, wired through the new optional `FormScreen.refreshControl` prop; other `FormScreen` callers are unaffected (prop optional).
- **AC-5** S2 summary card: `IconSquircle receipt-outline` + code/place + `StatusBadge` row, amount tile (eyebrow label + display amount with the same label/value/color logic as before), Tổng tiền / Đã thu / Ghi nợ rows with the same conditions.
- **AC-6** S3–S8 are `FormSection` cards with exactly the titles, icons, tones and captions in the §2 icon table; S4 due date keeps error color + strong when late; S5 empty shows `Không có dịch vụ nào trong hóa đơn này.`; S7 hidden when there are no payments, `SectionError` on error, count badge when shown; S8 only when `invoice.notes`.
- **AC-7** Action rules unchanged: pay button only for PENDING / PARTIALLY_PAID / OVERDUE, cancel only for DRAFT / PENDING, neither for PAID / CANCELLED (still sourced from `getInvoiceActionRules`); `isLoading`/`disabled` wiring unchanged.
- **AC-8** With `confirmContractId`, tapping pay shows `Alert` titled `Xác nhận thanh toán` with message exactly `Xác nhận thanh toán hợp đồng sẽ chuyển sang trạng thái hoạt động hoặc chờ hoạt động khi thời gian bắt đầu chưa đến.` and buttons Hủy / Tiếp tục; Tiếp tục opens the payment sheet. Without it, the sheet opens directly.
- **AC-9** `handlePay`, `handleCancel`, sheet configs (snap points, header titles, footers), Toast texts, double-submit refs and focus-refetch code are byte-identical to the pre-change version (diff shows only layout/JSX/imports/styles changes).
- **AC-10** `ConfirmPaymentInvoice` exports the same `Props`, `ConfirmPaymentInvoiceRef { submit }` and default export; `submit()` still produces `{ id, paymentMethod, remainingAmount, isCarryOver, paidAmount, notes }` with the same sources; form defaults and all validation rules/messages unchanged; still works from `CreateInvoice.tsx` without edits there.
- **AC-11** `ConfirmPaymentInvoice` has zero `className`, uses `StyleSheet.create` + `tokens`/`uiColors`/`uiType`/`uiRadius`/`uiSpace` only, shows the amount tile, the carry-over box (Switch + `Còn thiếu: …đ` caption) only for partial payments, a hairline between the money and details groups, and the last field (Ghi chú) is fully visible above the sheet footer when scrolled to the end.
- **AC-12** All UI copy Vietnamese, all new code comments English, every touched section component has an updated JSDoc layout note.
- **AC-13** `npx tsc --noEmit` shows no new errors in touched files; `npm run check:colors` passes; iOS export bundles.

## 9. Validation
- `cd mobile && npx tsc --noEmit 2>&1 | grep -E "InvoiceDetailScreen|components/detail/|ConfirmPaymentInvoice|FormScreen|App.tsx"` (expect no new errors)
- `cd mobile && npm run check:colors`
- `cd mobile && npx expo export --platform ios --output-dir /tmp/invoice-detail-export` (then `rm -rf /tmp/invoice-detail-export`)
- Manual: open an invoice in each status (DRAFT, PENDING, PARTIALLY_PAID, OVERDUE, PAID, CANCELLED) and from InvoiceHistory (`fromHistory`), and the contract pre-invoice flow (`confirmContractId`).

## 10. Assumptions & open questions
- **Header swap** — UpdateRoom hides the native header and uses `ScreenHeader`; matching it requires `headerShown: false` for `InvoiceDetail` in `App.tsx`, which removes the native `headerRight` history icon (hard-coded `#007AFF`). That icon moves into `ScreenHeader.action` with the same `fromHistory` condition and route. Navigation behavior is unchanged.
- **FormScreen refresh** — `FormScreen` has no refresh slot; an optional, additive `refreshControl` prop is the minimal shared-component edit that keeps pull-to-refresh (data flow) intact. No other caller changes.
- **Summary elevation** — the rule suggests `medium` for raised/KPI cards; we use the `Card` default `soft` to match the UpdateRoom summary card exactly, and make the money stand out with the canvas amount tile instead.
- **S5 empty state** — UpdateRoom shows empty content inside a `FormSection` as a single `uiType.caption` line; we mirror that instead of a nested `EmptyState` card (nested card-in-card would break the depth rule).
- **Sibling sheets** — `CancelPreInvoiceReason`, `UpdateInvoiceItemsPrice` (and `ServiceDetailInvoiceItemComponent`) still use `className`. Only their spacing (`p-4` = 16, field gap) is mirrored; the StyleSheet + tokens convention defined in §2.2 (padding `uiSpace.card`, groups with `gap uiSpace.gap`, hairline separators, canvas tiles) is meant to be reused when they are migrated. Migrating them is out of scope here (follow-up).
- **Footer clearance** — `SHEET_FOOTER_CLEARANCE = 120` is an estimate of `ActionButtonBottom` height (12 top + ~48 button + bottom inset) inside `BottomSheetFooter`; the coder may adjust only if AC-11 fails on a device, and must log it in Implementation notes.
- **Shortfall caption** — `Còn thiếu: …đ` is display-only (remainingAmount − entered amount); it does not change what is submitted.
- `fromHistory` is already in `RootStackParamList["InvoiceDetail"]`; no navigation type change.

---

## Implementation notes
<!-- Filled by UI Coder. -->
- Files changed:
  - `mobile/App.tsx` — `InvoiceDetail` options → `{ headerShown: false }` (native headerRight removed; `Pressable`/`Ionicons` still used by InvoiceHistory, imports kept).
  - `mobile/src/components/FormScreen.tsx` — optional `refreshControl` prop, forwarded to `KeyboardAwareScrollView`.
  - `mobile/src/screens/invoice/InvoiceDetailScreen.tsx` — `SafeAreaView edges={[]}` + `ScreenHeader` (history `IconButton` when `!fromHistory`) + `FormScreen` with `footer` and `refreshControl`; loading/error branches render the header; `CardContent`/`ScrollView` removed; notes as `FormSection`. Handlers, hook usage, sheet configs and Toasts untouched.
  - `mobile/src/screens/invoice/components/detail/InvoiceSummaryCard.tsx` — `IconSquircle receipt-outline` row, amount tile, breakdown; new optional `isLate` drives icon tone.
  - `mobile/src/screens/invoice/components/detail/InvoiceInfoCard.tsx` — two `FormSection`s; due-date tone error when late.
  - `mobile/src/screens/invoice/components/detail/InvoiceCostCard.tsx` — two `FormSection`s; caption empty state; total row `uiType.section` + primary.
  - `mobile/src/screens/invoice/components/detail/InvoicePaymentHistory.tsx` — `FormSection` with count-pill `action`; first row `paddingTop 0`; error/empty logic unchanged.
  - `mobile/src/screens/invoice/components/ConfirmPaymentInvoice.tsx` — `className` removed, `StyleSheet` + tokens; amount tile, carry box with shortfall caption, hairline divider, `keyboardShouldPersistTaps="handled"`, `SHEET_FOOTER_CLEARANCE = 120`. `useForm` defaults, `watch`, `useImperativeHandle` body and all Controllers unchanged.
- Deviations from blueprint (with reason):
  - None in behaviour. `prettier --write` reformatted the 5 detail/screen files as a whole (the files were not prettier-clean before), so some non-JSX lines changed wrapping only.
  - `SHEET_FOOTER_CLEARANCE` kept at 120; not yet verified on a device (AC-11 needs a manual check).
- Validation results:
  - `npx tsc --noEmit`: 0 errors in touched files (54 pre-existing errors repo-wide, none in touched files).
  - `npm run check:colors`: passed (no new hex).
  - `npx expo export --platform ios`: bundles (output removed after).
  - Manual device checks (§9: each status, `fromHistory`, `confirmContractId`, sheet footer clearance) not run by the coder.

## Review log
<!-- Appended by UI Reviewer, newest round last. -->
