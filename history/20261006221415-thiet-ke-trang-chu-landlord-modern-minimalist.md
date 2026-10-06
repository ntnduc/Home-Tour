# Thiết kế trang chủ Landlord theo phong cách Modern Minimalist

- **Thời gian:** 2026-10-06 22:14:15
- **Mã file:** `20261006221415-thiet-ke-trang-chu-landlord-modern-minimalist`
- **Phạm vi:** Cả hai (Backend + Frontend)
- **Trạng thái:** Hoàn thành & đã được người dùng chấp nhận

## Yêu cầu gốc
> Thiết kế lại HomePage cho app quản lý nhà trọ (Landlord) theo phong cách "Modern Minimalist": bố cục bất đối xứng (card full-width + lưới chia đôi), bo góc lớn (20+), đổ bóng nhiều tầng, header cá nhân hóa có widget tài chính (vòng tiến độ), lưới thao tác nhanh, live feed (carousel trạng thái phòng + cảnh báo gấp), phản hồi xúc giác `activeOpacity={0.6}`, `StyleSheet`, icon hiện đại, custom hook gọi API, pull-to-refresh, comment giải thích layout/UX.
> Backend: tạo module `homepage` lấy dữ liệu cho UI; nếu dữ liệu nhiều thì tách nhiều API để tải nhanh hơn.

Các quyết định đã chốt với người dùng: dùng `@expo/vector-icons` (không thêm thư viện icon), tổng hợp mọi tài sản + chip lọc theo tài sản, tách 3 endpoint gọi song song.

## Thay đổi Backend
- Module mới `src/modules/homepage/` (đăng ký trong `app.module.ts`), 3 endpoint gọi song song từ app:
  - `GET /api/homepage/summary?propertyId=` — danh sách tài sản (chip lọc), thống kê phòng theo trạng thái + tỷ lệ lấp đầy, số khách đang thuê, doanh thu tháng (dự kiến / đã thu / còn lại / tỷ lệ thu), số hóa đơn quá hạn, số hợp đồng sắp hết hạn (30 ngày).
  - `GET /api/homepage/room-feed?propertyId=&limit=` — phòng cần chú ý, tái dùng `RoomActionService` + view `vw_room_action_signals`; sắp xếp quá hạn → nhiều việc tồn → tên.
  - `GET /api/homepage/alerts?propertyId=&limit=` — hóa đơn quá hạn, hóa đơn sắp đến hạn (`DATE_ALERT_THRESHOLD`), hợp đồng sắp hết hạn, hợp đồng chờ xác nhận; sắp theo mức độ rồi theo ngày.
- `HomepageScopeService`: phạm vi dữ liệu = tài sản user sở hữu ∪ tài sản được gán role (`user_roles`); `propertyId` ngoài phạm vi → 403; user chưa có tài sản → payload rỗng/0, không lỗi.
- Trong mỗi endpoint, các truy vấn độc lập chạy song song bằng `Promise.all` (COUNT/SUM gộp, không load entity thừa).
- Unit test `homepage.service.spec.ts` (tính thống kê, doanh thu, sắp xếp, ngày, scope).

## Thay đổi Frontend
- `DashboardScreen.tsx` viết lại thành màn điều phối: Header → chip lọc → Hero doanh thu (vòng tiến độ SVG animate) → Bento bất đối xứng (lấp đầy / khách / HĐ sắp hết hạn) → Thao tác nhanh 4 ô → "Cần xử lý" → Carousel "Phòng cần chú ý"; `RefreshControl` kéo để làm mới.
- Custom hook `useHomepageData` (React Query `useQueries`, 3 query song song, `keepPreviousData`, `refresh()` + `isRefreshing` riêng, refetch khi focus lại).
- Bộ component mới trong `screens/dashboard/components/`: `PressableScale` (activeOpacity 0.6 + spring scale), `ProgressRing`, `SkeletonBlock`, `SectionHeader`, `SectionError`, `HomeHeader`, `PropertyFilterChips`, `RevenueHeroCard`, `StatBento`, `QuickActionGrid`, `AlertFeed`, `RoomStatusCarousel`.
- Lớp thiết kế `homeStyles.ts` (radius 28/24/20/16, 3 tầng bóng soft/medium/hero có `elevation`, thang chữ, màu qua token), `homeFormat.ts`, `homeNavigation.ts` (điều hướng theo action giống `RoomCardItemComponents`).
- API/type mới: `api/homepage/homepage.api.ts`, `types/homepage.ts`; xóa stub không dùng `api/dashboard/dashboard.api.ts`.

## Danh sách file bị ảnh hưởng
- `backend_v2/src/app.module.ts` — đăng ký `HomepageModule`.
- `backend_v2/src/modules/homepage/**` — module mới (controller, service, scope service, utils, DTO, spec).
- `mobile/src/screens/dashboard/DashboardScreen.tsx` — viết lại.
- `mobile/src/screens/dashboard/{components/*, hooks/useHomepageData.ts, homeStyles.ts, homeFormat.ts, homeNavigation.ts}` — mới.
- `mobile/src/api/homepage/homepage.api.ts`, `mobile/src/types/homepage.ts` — mới.
- `mobile/src/api/dashboard/dashboard.api.ts` — xóa (stub rỗng, không được dùng).

## Ghi chú / việc cần làm tiếp
- Đã kiểm chứng: backend `tsc` sạch, 18/18 test pass; chạy thật 3 service trên Postgres tạm với dữ liệu mẫu cho kết quả đúng; mobile `tsc` không thêm lỗi mới (49 lỗi cũ có sẵn), `check:colors` pass, `expo export` iOS bundle thành công.
- `jest.config.js` của backend có lỗi sẵn (`moduleNameMapping` thay vì `moduleNameMapper` + trùng cấu hình với `package.json`) → `npx jest` mặc định không chạy được; tạm chạy bằng `--config` inline. Chưa sửa vì ngoài phạm vi.
- Kiến thức thiết kế đã được lưu lại để tái sử dụng: `.github/instructions/mobile-ui-design.instructions.md` (xem bản ghi history của yêu cầu pipeline agent khi được chấp nhận).
- Khi màn khác cần `PressableScale`/`SkeletonBlock`/`SectionHeader`/`SectionError`/`ProgressRing`, chuyển chúng sang `src/components/ui/` (quy tắc promotion trong design system).

## Nhật ký cập nhật
- 2026-10-06 22:14:15 — Tạo bản ghi ban đầu (người dùng xác nhận hài lòng với UI trang chủ).
