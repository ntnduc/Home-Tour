# Nâng cấp UI màn hình Tạo / Cập nhật tài sản

- **Thời gian:** 2026-10-17 20:25:19
- **Mã file:** `20261017202519-nang-cap-ui-man-hinh-tao-cap-nhat-tai-san`
- **Phạm vi:** Frontend
- **Trạng thái:** Hoàn thành & đã được người dùng chấp nhận

## Yêu cầu gốc
> Nâng cấp UI/UX của UpdatePropertyScreen (sau đó là CreatePropertyScreen) theo design system hiện có, lấy Dashboard và
> PropertyListScreen làm chuẩn: tái sử dụng màu, typography, spacing, bo góc, shadow, header và component dùng chung;
> không đưa vào phong cách lạ hay dependency mới.

## Thay đổi Backend
Không có.

## Thay đổi Frontend
- Thiết kế lại `UpdatePropertyScreen` và `CreatePropertyScreen` theo Modern Minimalist: nền `surfaceMuted`, lề 20, gap 12,
  card trắng bo 24 + `shadows.soft`; toàn bộ style qua `StyleSheet` + token từ `propertyListStyles.ts` (bỏ `className`, bỏ hex).
- Bố cục: card tóm tắt (cập nhật trực tiếp theo form) → 4 section card: Thông tin chung · Địa chỉ · Thiết lập cho thuê ·
  Dịch vụ thu phí (nút `AddButton` soft, mỗi dịch vụ là tile bo 20 với nút xóa tròn, trạng thái rỗng thân thiện).
- Loading lần đầu dùng skeleton đúng hình khối thay cho `Loading` toàn màn hình; khi submit form vẫn hiển thị, nút
  hiện spinner + disabled (tách `isSubmitting` khỏi `isLoading`).
- Tách logic dữ liệu ra hook riêng (`useUpdatePropertyData`, `useCreatePropertyData`); tải dữ liệu khởi tạo song song
  (`Promise.all`); xử lý lỗi an toàn (không còn crash khi lỗi không có `response.data.message`).
- Create: bỏ `// @ts-nocheck` và mọi `as any`; chuẩn hóa số (giá, ngày thanh toán, giá dịch vụ) trong hook; bỏ nút
  "Chọn vị trí trên bản đồ" (chưa có chức năng).
- Update: trường "Tên gợi nhớ" hiển thị dấu bắt buộc (*) cho khớp với rule validate sẵn có.

## Danh sách file bị ảnh hưởng
- `mobile/src/screens/property/UpdatePropertyScreen.tsx` — thiết kế lại, chỉ còn điều phối form.
- `mobile/src/screens/property/CreatePropertyScreen.tsx` — thiết kế lại, bỏ `@ts-nocheck`.
- `mobile/src/screens/property/components/PropertyFormSection.tsx` — mới: card section (icon + tiêu đề + caption + action).
- `mobile/src/screens/property/components/PropertyEditSummary.tsx` — mới: card tóm tắt tài sản (tầng / phòng / dịch vụ).
- `mobile/src/screens/property/components/PropertyServiceItem.tsx` — mới: tile dịch vụ + nút xóa.
- `mobile/src/screens/property/components/PropertyFormSkeleton.tsx` — mới: skeleton dùng chung cho Create/Update.
- `mobile/src/screens/property/hooks/useUpdatePropertyData.ts` — mới: tải dữ liệu, cascade địa chỉ, submit cập nhật.
- `mobile/src/screens/property/hooks/useCreatePropertyData.ts` — mới: tải tỉnh + dịch vụ mặc định, submit tạo mới.

## Ghi chú / việc cần làm tiếp
- Đã kiểm tra: `npx tsc --noEmit` không có lỗi ở các file đã sửa, `npm run check:colors` đạt, `npx expo export --platform ios` build thành công.
- Chưa test thủ công trên thiết bị/simulator (iOS + Android).
- Các component dùng chung kiểu cũ (`Input`, `ComboBox`, `ActionButtonBottom`, `ServiceSelectedSearchComponent`,
  `CalculatorMethodComponent`) vẫn giữ style NativeWind — có thể nâng cấp riêng sau.
- Hook vẫn dùng `useState`, chưa chuyển sang React Query.

## Nhật ký cập nhật
- 2026-10-17 20:25:19 — Tạo bản ghi ban đầu (gồm cả UpdatePropertyScreen và CreatePropertyScreen).
