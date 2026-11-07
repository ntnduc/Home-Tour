# Room / contract / payment workflow fixes

- **Time:** 2026-10-25 00:18:23
- **File ID:** `20261025001823-room-contract-payment-workflow-fixes`
- **Scope:** Both (Backend + Frontend)
- **Status:** Done & accepted by user

## Original request
> Review the room and contract business logic (RoomActionService, RoomsService, room action view) via a standalone workflow website, then implement the change requests written there: contract creation by free time slot, CREATE_CONTRACT button rules, create → confirm payment → activate workflow, DRAFT invoices not overdue, transactional confirm-invoice, and invoice payment with carry-over of the unpaid balance.

## Backend changes
- **Contract creation:** only MAINTENANCE / UNAVAILABLE rooms are rejected; other statuses are allowed when the requested dates do not overlap a DRAFT / PENDING_START / WAITING_PAYMENT_INVOICE / ACTIVE contract. A null `endDate` means open-ended. Lookups now run inside the transaction (`contract-workflow.util.ts`).
- **Creation outcome:** payment required → `WAITING_PAYMENT_INVOICE` (room `PENDING_DEPOSIT` if started); no invoice → `ACTIVE` + room `OCCUPIED` if started, else `PENDING_START`. `getPreInvoiceContract` returns null when there are no items.
- **New `POST /api/contract/:id/confirm-payment`:** one transaction — first invoice PAID, Payment recorded, contract ACTIVE (+ room OCCUPIED) or PENDING_START for a future start, change log saved.
- **Room actions:** `CONFIRM_PAYMENT` replaces `CONFIRM_DEPOSIT` and is the only action while a contract awaits payment (no active contract). `CREATE_CONTRACT` is driven by the new view signal `hasAvailableSlot`.
- **View `vw_room_action_signals` rebuilt:** adds `awaitingPaymentContractId`, `awaitingPaymentInvoiceId`, `hasAvailableSlot`; `overdueInvoiceCount` excludes DRAFT invoices.
- **`confirmInvoice`:** awaited write inside a committed transaction; validation and the already-PENDING no-op happen before any transaction (no spurious rollback); 400/404 instead of 502.
- **`paymentInvoice`:** new `calculateInvoicePayment` (accumulating amounts, PAID / PARTIALLY_PAID via `resolveInvoiceStatus`); partial payment with `isCarryOver` settles the invoice as PAID and stores the shortfall in new `Invoice.carriedOverAmount`; all writes in one awaited transaction; `paidAmount` must be > 0.
- **`create` invoice:** previous invoice's `carriedOverAmount` is added as an "Nợ hóa đơn" item regardless of the contract flag; fixed the chained `.where()` bug in the previous-invoice lookup.

## Frontend changes
- `CONFIRM_PAYMENT` action type replaces `CONFIRM_DEPOSIT` (types, icon, variant); new `confirmContractPayment` API and `promptConfirmContractPayment` helper (confirm alert → API → refetch rooms/dashboard) wired in the room card and dashboard navigation.
- Invoice type gains `carriedOverAmount`; payment form amount must be ≥ 1; label typo "Ghi nợ vào tháng sau" fixed.

## Affected files
- `backend_v2/src/modules/contract/contract.service.ts` — create rules, `confirmPayment`
- `backend_v2/src/modules/contract/contract.controller.ts` — `POST :id/confirm-payment`
- `backend_v2/src/modules/contract/contract-workflow.util.ts` — overlap / status-outcome helpers
- `backend_v2/src/modules/contract/dto/contract-dto/contract.confirm-payment.dto.ts` — request body DTO
- `backend_v2/src/modules/property/room-action.service.ts`, `dto/room-dto/room-action.dto.ts`, `entities/room-action-signal.view.ts` — new actions and signals
- `backend_v2/src/database/migrations/1789290100000-UpdateRoomActionSignalsView.ts` — rebuilt view
- `backend_v2/src/database/migrations/1789290200000-AddInvoiceCarriedOverAmount.ts` — new `carriedOverAmount` column
- `backend_v2/src/modules/invoice/invoice.service.ts`, `invoice-payment.util.ts`, `entities/invoice.entity.ts`, `dto/invoice-dto/invoice.payment.dto.ts`, `invoice.detail.dto.ts` — payment, confirm and create logic
- `backend_v2/src/modules/contract/contract-workflow.util.spec.ts`, `contract.service.spec.ts`, `invoice/invoice-payment.spec.ts`, `property/room-action.service.spec.ts` — tests
- `mobile/src/types/room.ts`, `types/invoice.ts`, `api/contract/contract.api.ts` — types and API
- `mobile/src/screens/room/confirmContractPayment.ts`, `RoomCardItemComponents.tsx`, `RoomCardActions.tsx`, `dashboard/DashboardScreen.tsx`, `dashboard/homeNavigation.ts` — confirm-payment UI wiring
- `mobile/src/screens/invoice/components/ConfirmPaymentInvoice.tsx` — amount validation, label fix

## Notes / follow-ups
- Run `npm run migration:run` (two new migrations) before using the app; they were not run against a database.
- Specs for room-action, contract-workflow, contract.service and invoice-payment pass; `invoice.service.spec.ts` and `payment.service.spec.ts` were already failing before these changes.
- Open: no job moves PENDING_START → ACTIVE; terminating a contract does not free the room; a payment of 0 (carry the whole amount) is rejected; carried amount is not shown in the mobile invoice detail; no automatic OVERDUE / EXPIRED / ENDED status.
- The workflow review website lives outside the repo at `../home-tour-workflow-review/index.html`.

## Update log
- 2026-10-25 00:18:23 — Initial entry.
