# Cập nhật UI PropertyListScreen theo chuẩn Modern Minimalist

- **Thời gian:** 2026-10-06 23:40:52
- **Mã file:** `20261006234052-cap-nhat-ui-propertylistscreen-theo-chuan-moi`
- **Phạm vi:** Frontend
- **Trạng thái:** Hoàn thành & đã được người dùng chấp nhận

## Yêu cầu gốc
> Thay đổi UI của màn `PropertyListScreen` theo chuẩn UI mới (Modern Minimalist):
> - Nút tạo mới dễ nhìn hơn, đặt ở vị trí hợp lý và chuẩn hoá để dùng cho các màn sau.
> - Header gọn gàng, hoà hợp với homepage; ô search trên header cũng gọn lại.
> - Card item và các action đổi lại đúng cấu trúc UI.
> - Tách các phần dùng chung để tái sử dụng về sau, đúng cấu trúc đã thiết kế.
>
> Quyết định đã chốt: (A) dùng nút "+ Thêm" ở header/section theo Apple HIG, không dùng FAB nổi; (B) bỏ hẳn stats strip; (C) shared đặt dưới `src/components/` và tạo `src/theme/shadows.ts`.

## Thay đổi Backend
Không có.

## Thay đổi Frontend
- Viết lại `PropertyListScreen` theo hướng orchestration-only: header gọn + search pill + danh sách card, có skeleton/empty/error, không còn stats strip và không còn FAB nổi.
- Nút tạo mới chuyển thành component dùng chung `AddButton` ("+ Thêm") đặt trong header, làm chuẩn cho các màn danh sách sau này.
- Header mới `PropertyListHeader` (tiêu đề + số lượng + nút thêm) và ô tìm kiếm thu gọn thành `SearchField` dạng pill (icon + debounce + clear), thay cho search của `HeaderComponents` legacy.
- Rebuild `PropertyCardComponent` theo token: bo góc 24, soft shadow, màu từ token, dùng Ionicons thay emoji, status pill theo bảng `statusColor`, action row dùng `PressableScale`; chỉnh typography tiêu đề (18/24, w700) để không bị cắt dấu tiếng Việt trên Android.
- Tách các phần dùng chung xuống `src/components/`: `PressableScale`, `SkeletonBlock`, `SectionError` (chuyển từ dashboard-local), thêm mới `EmptyState`, `AddButton`, `SearchField`.
- Tạo `src/theme/shadows.ts` (3 tầng soft/medium/hero kèm `elevation` cho Android) để các màn không còn phụ thuộc `homeShadow` của dashboard; cập nhật `homeStyles.ts` để `homeShadow` alias sang token mới và cập nhật các import ở dashboard.
- Tạo hook `usePropertyListData` gói toàn bộ logic dữ liệu: infinite query `getListProperty`, tìm kiếm, refetch-on-focus (bỏ qua lần focus đầu), pull-to-refresh với `isRefreshing`, `keepPreviousData`, `staleTime 30s`.
- Sửa bug `getNextPageParam` (so sánh số item đã tải với tổng số, tránh lặp vô hạn), và chỉ gửi `globalKey` khi có từ khoá (trước đây gửi "all" làm backend trả rỗng); tăng page size 5 → 10.
- Thêm `propertyListStyles.ts` (style token-only cho màn) và `propertyNavigation.ts` (typed navigation).

## Danh sách file bị ảnh hưởng
- `mobile/src/theme/shadows.ts` — mới: 3 tầng shadow soft/medium/hero + elevation.
- `mobile/src/theme/index.ts` — export shadow tokens mới.
- `mobile/src/components/PressableScale.tsx` — chuyển thành component dùng chung.
- `mobile/src/components/SkeletonBlock.tsx` — chuyển thành component dùng chung.
- `mobile/src/components/SectionError.tsx` — chuyển thành component dùng chung.
- `mobile/src/components/EmptyState.tsx` — mới: empty-state card tiếng Việt.
- `mobile/src/components/AddButton.tsx` — mới: nút "+ Thêm" dùng chung cho header.
- `mobile/src/components/SearchField.tsx` — mới: ô tìm kiếm pill (debounce + clear).
- `mobile/src/screens/property/PropertyListScreen.tsx` — viết lại theo chuẩn mới, orchestration-only.
- `mobile/src/screens/property/propertyListStyles.ts` — mới: style token-only cho màn.
- `mobile/src/screens/property/propertyNavigation.ts` — mới: typed navigation.
- `mobile/src/screens/property/hooks/usePropertyListData.ts` — mới: hook dữ liệu của màn.
- `mobile/src/screens/property/components/PropertyListHeader.tsx` — mới: header màn danh sách.
- `mobile/src/screens/property/components/PropertyCardSkeleton.tsx` — mới: skeleton cho card.
- `mobile/src/screens/property/components/PropertyCardComponent.tsx` — rebuild theo token (Ionicons, status pill, PressableScale).
- `mobile/src/screens/dashboard/components/` — xoá 3 bản trùng (PressableScale/SkeletonBlock/SectionError) đã chuyển lên `src/components/`.
- `mobile/src/screens/dashboard/homeStyles.ts` — `homeShadow` alias sang `src/theme/shadows.ts`.
- `mobile/src/screens/dashboard/DashboardScreen.tsx` cùng các component dashboard — cập nhật đường dẫn import sau khi di chuyển.
- `.github/ui-blueprints/20261006-property-list-redesign.md` — blueprint thiết kế (Planner → Coder → Reviewer, APPROVED vòng 3).

## Ghi chú / việc cần làm tiếp
- Validation đã xanh qua các vòng: `tsc` (không phát sinh lỗi mới ở file liên quan), `npm run check:colors`, `expo export ios`.
- Còn 4 MINOR tuỳ chọn không chặn đã ghi trong blueprint (import `useDebouncedCallback` thừa, `EmptyState` lặp `AddButton`, `fontSize: 12` dư, khoảng cách footer skeleton) — có thể dọn sau nếu muốn.
- Các component dùng chung mới (`AddButton`, `SearchField`, `EmptyState`, `PressableScale`, `SkeletonBlock`, `SectionError`) và `src/theme/shadows.ts` nên được tái sử dụng cho các màn danh sách tiếp theo.

## Nhật ký cập nhật
- 2026-10-06 23:40:52 — Tạo bản ghi ban đầu.
