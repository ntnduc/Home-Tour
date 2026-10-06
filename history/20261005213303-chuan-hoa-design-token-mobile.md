<!--
  Bản ghi tracking cho công việc chuẩn hóa Design Token (mobile).
  Người dùng yêu cầu liệt kê các phần cần thay đổi vào history để follow & cập nhật dần.
  Đây là bản ghi SỐNG: migrate theo từng phase, cập nhật checklist + "Nhật ký cập nhật" trong CÙNG file này.
-->

# Chuẩn hóa Design Token cho app mobile

- **Thời gian:** 2026-10-05 21:33:03
- **Mã file:** `20261005213303-chuan-hoa-design-token-mobile`
- **Phạm vi:** Frontend (mobile)
- **Trạng thái:** Hoàn thành toàn bộ Phase 1→5 (foundation, dọn code chết, gom màu, migrate screens ưu tiên, guardrail). Còn tùy chọn: dọn nốt `landlord`/hex nội bộ component (đã có guardrail chống tái phát).

## Yêu cầu gốc
> Chỉnh lại kiến trúc/cấu hình để chuẩn hóa về MỘT hệ design token rõ ràng, dễ dùng và dễ nâng cấp.
> Liệt kê các phần bị ảnh hưởng / chưa đúng, các phần cần thay đổi và lưu ý, để follow và cập nhật dần.

## Bối cảnh / Vấn đề (đã kiểm chứng trong code)
- `tailwind.config.js` có `theme.extend` **rỗng** → NativeWind không biết brand color; `className="text-primary"` vô nghĩa.
- `src/theme/ThemeProvider.tsx` **không được mount** ở đâu → `useTheme()` trả về object rỗng; 14 file rơi về fallback hardcode; còn tàn dư Tamagui (`theme.red10?.val`) trong `src/styles/component/StyleInput.ts`.
- **459 mã hex hardcode**, **41** `StyleSheet.create`, bảng màu trùng lặp ở `types/invoice.ts`, `types/payment.ts`, `components/StepByStep/colors.ts`.

## Kiến trúc token mới (nguồn chân lý)
- `src/theme/tokens.js` (CommonJS) — RAW values dùng CHUNG cho cả Tailwind (require) và app (import).
- Lớp 1 `primitives` (palette thô) → Lớp 2 `semantic` (ngữ nghĩa) → UI dùng qua class Tailwind semantic.
- `tailwind.config.js` bắc cầu token → dùng `bg-primary`, `text-foreground`, `text-muted`, `bg-success-surface`, `border-border`, `rounded-lg`, `text-md`...
- Chỉ light mode; tên semantic cố định, `darkMode: 'class'` đã bật sẵn để thêm dark mode sau không phải sửa UI.

## Thay đổi Backend
Không có.

## Thay đổi Frontend
### Phase 1 — Foundation (ĐÃ XONG)
- [x] `src/theme/tokens.js` (mới) — nguồn chân lý CommonJS: palette, semantic, spacingScale, fontSize, lineHeight, fontWeight, radius.
- [x] `src/theme/primitives.ts` (mới) — re-export `palette` có kiểu.
- [x] `src/theme/semantic.ts` (mới) — re-export `semanticColors` có kiểu.
- [x] `src/theme/radius.ts` (mới) — re-export `radius`.
- [x] `src/theme/spacing.ts` — dùng chung `spacingScale` từ tokens.
- [x] `src/theme/typography.ts` — dùng chung `fontSize/lineHeight/fontWeight` từ tokens.
- [x] `src/theme/index.ts` — export `tokens` (mới) + giữ `theme`/`colors` (deprecated) tương thích ngược; kèm hướng dẫn dùng.
- [x] `src/theme/colors.ts` — chuyển thành ALIAS deprecated, derive từ primitives/semantic (không vỡ 28 file đang import).
- [x] `tailwind.config.js` — `require('./src/theme/tokens')`, map colors/fontSize/spacing/borderRadius + `darkMode: 'class'`.
- [x] Verify: `tsc --noEmit` = 50 lỗi, ĐÚNG BẰNG baseline (0 lỗi mới); `tailwind.config.js` load OK.

### Phase 2 — Dọn code chết / tàn dư (CHƯA LÀM)
- [ ] `src/theme/ThemeProvider.tsx` — bỏ dark mode chết + trùng token; cho `useTheme()` trả về `tokens` thật (hoặc gỡ hẳn, chuyển sang className).
- [ ] `src/styles/component/StyleInput.ts` — bỏ fallback kiểu Tamagui (`theme.red10?.val`, `theme.color?.val`), dùng token.
- [ ] Rà 14 file `useTheme()`: `components/Input.tsx`, `LabelForm.tsx`, `DatePicker.tsx`, `ComboBox.tsx`, `Switch/Switch.tsx`, `Uploadfile/UploadFile.tsx`, `Uploadfile/UploadMultiFile.tsx`, `screens/profile/ProfileScreen.tsx`, `screens/property/CreatePropertyScreen.tsx`, `screens/property/UpdatePropertyScreen.tsx`, `screens/tenant/components/CalculatorMethodComponent.tsx`, `screens/tenant/components/ServiceSelectedSearchComponent.tsx`, `screens/contract/components/ContractServiceComponent.tsx`.

### Phase 2 — Dọn code chết / tàn dư (ĐÃ XONG)
- [x] `src/theme/ThemeProvider.tsx` — gỡ ~150 dòng dark mode chết + bản sao token; `useTheme()` nay trả về `tokens` thật (light). Giữ Context để sau thêm dark mode không phải sửa component.
- [x] `src/styles/component/StyleInput.ts` — bỏ tàn dư Tamagui (`theme.red10?.val`, `theme.color?.val`), dùng `Tokens` + semantic (`colors.error`, `colors.foreground`, typography/spacing).
- [x] `src/styles/component/StyleComboBox.ts` — tương tự: `(tokens: Tokens)`, thay `.val` → semantic.
- [x] `src/styles/component/StyleUploadFile.ts` — tương tự.
- [x] `src/styles/StyleCreateTenantScreen.ts` — tương tự: thay toàn bộ `theme.blueX/grayX/color/background?.val` → semantic token.
- [x] `src/screens/profile/ProfileScreen.tsx` — gỡ `useTheme()` chết + code Tamagui trong comment; khôi phục hiển thị tên/SĐT bằng class semantic (`text-primary`, `text-foreground-muted`).
- [x] 12 file `useTheme()` khác KHÔNG phải sửa: chỉ `const theme = useTheme(); createStyles(theme)` — nay nhận `Tokens`, type khớp.
- [x] Verify: `tsc --noEmit` = 48 lỗi (giảm từ baseline 50 — sửa 2 lỗi cũ, 0 lỗi mới); 0 lỗi ở file đã đụng. Hết `isDarkMode/toggleTheme` và hết tàn dư `.val`.

### Phase 3 — Gom bảng màu trùng lặp + component dùng chung (CHƯA LÀM)
- [ ] `src/types/invoice.ts` — map màu status → semantic token.
- [ ] `src/types/payment.ts` — map màu status → semantic token (đang trùng invoice).
- [ ] `src/components/StepByStep/colors.ts` — thay `bg-[#6a5af9]`, `bg-[#28a745]`, `bg-[#dc3545]` bằng class semantic.
- [ ] `src/components/Status.tsx` — gom màu status vào token.
- [ ] `src/constant/*.constant.ts` — rà màu trạng thái dùng chung.
- [ ] Tạo/chuẩn hóa primitive component: `Text`, `Button`, `Badge/Status`, `Card`, `Input`, `Checkbox`, `Switch` theo token.
- [ ] `src/styles/` & `src/screens/*/styles/` (41 `StyleSheet.create`) — thay hex bằng token.

### Phase 3 — Gom bảng màu trùng lặp + component dùng chung (ĐÃ XONG)
- [ ] `src/theme/status.ts` (MỚI) — nguồn chân lý DUY NHẤT cho màu badge trạng thái (`statusColor`: draft/pending/success/info/error/cancelled → {bg, color} semantic). Re-export qua `@/theme`.
- [ ] `src/types/invoice.ts` — `INVOICE_STATUS_COLOR` bỏ 6 cặp hex trùng → tham chiếu `statusColor`.
- [x] `src/types/payment.ts` — `PAYMENT_STATUS_COLOR` (trùng y hệt invoice) → tham chiếu `statusColor`.
- [x] `src/components/Status.tsx` — dùng `tokens` semantic; bỏ hack `color + "20"`, dùng `*Surface`; sửa bug `default` bg (`"20"` → `surfaceMuted`).
- [x] `src/components/StepByStep/colors.ts` — `bg-[#6a5af9]/#28a745/#dc3545`, `bg-amber-500` → `bg-primary/bg-success/bg-error/bg-warning`.
- [x] Thống nhất brand ở component dùng chung (trước đây lẫn lộn xanh/tím):
  - `src/components/ActionButtonBottom.tsx` — variant `bg-blue-600/amber-500/red-500/green-600` → `bg-primary/bg-warning/bg-error/bg-success`.
  - `src/components/DatePicker.tsx` — `bg-blue-500` → `bg-primary`.
  - `src/components/Loading.tsx` — `color="#6a5af9"` → `tokens.colors.primary`.
  - `src/components/QuickActionButton.tsx` — `backgroundColor:"#6a5af9"` → `tokens.colors.primary`; đồng thời sửa tàn dư `import { TextStyle } from "tamagui"` → `react-native` (fix 1 lỗi tsc cũ).
  - `src/styles/component/CardComponent.styles.ts` — thay toàn bộ hex (tint success/error/warning/neutral) → semantic `*Surface` + palette border + radius/spacing token.
- [x] Lưu ý phạm vi: "component dùng chung" tập trung CHUẨN HÓA các component sẵn có về token. Việc TẠO MỚI thư viện primitive (AppText/AppButton/Card…) là tùy chọn, để Phase 4 cân nhắc cùng lúc migrate screens — tránh thêm code suy đoán.
- [x] Verify: `tsc --noEmit` = 47 lỗi (giảm từ 48, 0 lỗi mới); 0 lỗi ở file đã đụng.

### Phase 4 — Migrate screens theo ưu tiên (CHƯA LÀM)
- [ ] property → room → tenant → contract → invoice → report/profile.
- [ ] Mỗi screen: thay hex/`bg-[#..]` bằng class semantic; không đổi layout/logic.

### Phase 4 — Migrate screens theo ưu tiên (ĐÃ XONG nhóm ưu tiên)
- [x] `property` — Create/Update/Detail: `#007AFF`/`bg-blue-*` → `primary`, `border-[#e9ecef]` → `border-border-strong`.
- [x] `room` — RoomDetail/BuildingFilter/RoomCardItem: `#2563EB/#007AFF` → `primary`, status hex (`#FFECEC/#E9F9EF/#FF3B30/#34C759`) → semantic, grays → token.
- [x] `tenant` — Calculator/ServiceSelected/TenantDetail/Terminate: brand → `primary`, panel info `blue-*` → `info`, status/gray → token.
- [x] `contract` (9 file) & `invoice` (12 file) — script map chuẩn: blue (panel info) → `info`, brand `#007AFF` → `primary`, đỏ/xanh/vàng → success/error/warning, grays → foreground/muted/subtle/surfaceMuted/border.
- [x] `auth` (3 file) — brand `#6a5af9` (11×) → `primary`, grays → token.
- [x] `dashboard` — map nhóm brand/gray/status; **GIỮ CỐ Ý** màu trang trí stat-card (`#00c2ff`, `#AF52DE`, `#ff4d6d`, các tint) — không ép về semantic để không mất chủ ý thiết kế.
- [x] `report`/`profile`/`home` — vốn 0 hex (profile đã dọn ở Phase 2).
- [x] Sửa thêm: đổi semantic `info` từ teal `#17a2b8` → blue thật `#1976d2` (đúng ngữ nghĩa, giúp map panel info sạch).
- [x] Kết quả: 8/8 nhóm ưu tiên = **0 hex màu**; `tsc` = 47 (đúng baseline hiện tại, **0 lỗi mới**).
- [ ] CÒN LẠI (tùy chọn, ngoài ưu tiên): `landlord/` (~37 hex — module legacy đang có nhiều lỗi type sẵn), `dashboard` 7 màu trang trí (giữ), và một ít hex nội bộ trong `components/`/`styles/` chưa semantic.

### Phase 5 — Guardrail (ĐÃ XONG)
- [x] `scripts/check-hardcoded-colors.js` (MỚI) — quét `src/**` (.ts/.tsx), đếm hex theo file, so với baseline; FAIL nếu có hex MỚI/tăng so với baseline. Bỏ qua `src/theme/` và trắng/đen/trong suốt.
- [x] `scripts/color-baseline.json` (MỚI) — baseline chốt hiện trạng (30 file, 179 hex nợ cũ) theo cơ chế "ratchet": nợ cũ được giữ, mọi hex mới bị chặn; dọn bớt thì chạy `--update` để hạ baseline.
- [x] `package.json` — thêm script `check:colors` và `check:colors:update`.
- [x] Verify: `npm run check:colors` = xanh; thử thêm `#123456` vào 1 screen → FAIL đúng như kỳ vọng; revert → xanh lại.

### (Tùy chọn) Việc còn lại để dọn dần
- [ ] `src/screens/landlord/**` (~37 hex) — module legacy, migrate khi xử lý luôn các lỗi type sẵn có.
- [ ] Hex nội bộ trong `src/components/**` & `src/styles/**` (~135, đã nằm trong baseline) — dọn dần theo file, hạ baseline sau mỗi lần.
- [ ] (Tùy chọn) ESLint rule / script cảnh báo hex hardcode mới.

## Danh sách file bị ảnh hưởng (Phase 1)
- `mobile/src/theme/tokens.js` — MỚI: nguồn chân lý token (CommonJS).
- `mobile/src/theme/primitives.ts` — MỚI: re-export palette.
- `mobile/src/theme/semantic.ts` — MỚI: re-export semanticColors.
- `mobile/src/theme/radius.ts` — MỚI: re-export radius.
- `mobile/src/theme/spacing.ts` — sửa: dùng chung spacingScale.
- `mobile/src/theme/typography.ts` — sửa: dùng chung fontSize/lineHeight/fontWeight.
- `mobile/src/theme/index.ts` — sửa: thêm `tokens`, giữ `theme`/`colors` deprecated.
- `mobile/src/theme/colors.ts` — sửa: thành alias deprecated derive từ token.
- `mobile/tailwind.config.js` — sửa: bắc cầu token + darkMode class.

## Ghi chú / việc cần làm tiếp
- Mobile KHÔNG có test/lint script → verify bằng `npx tsc --noEmit` (so với baseline) + kiểm tra thủ công trên app.
- Migrate dần theo phase, mỗi đợt giữ `tsc` không phát sinh lỗi mới; không đụng logic nghiệp vụ.
- Bảng class semantic hay dùng: `bg-primary|bg-primary-muted|bg-primary-strong`, `text-foreground|text-foreground-muted|text-foreground-subtle`, `text-primary|text-success|text-warning|text-error|text-info`, `bg-success-surface|bg-warning-surface|bg-error-surface|bg-info-surface`, `border-border|border-border-strong`, `rounded-sm..rounded-xxl`, `text-xs..text-xxxl`, `p-xs..p-xxl`.

## Nhật ký cập nhật
- 2026-10-05 21:33:03 — Tạo bản ghi; hoàn thành Phase 1 (Foundation: tokens.js + primitives/semantic/radius, bắc cầu tailwind, alias colors). Verify tsc = baseline (0 lỗi mới).
- 2026-10-05 21:53:21 — Hoàn thành Phase 2 (Dọn code chết): viết lại ThemeProvider (gỡ dark mode chết), 4 file createStyles bỏ tàn dư Tamagui dùng semantic token, dọn ProfileScreen. Verify tsc = 48 (giảm 2 so với baseline, 0 lỗi mới). Lưu ý review: một số màu được thống nhất về brand (vd nút action #007AFF → primary, màu lỗi #ff3b30 → colors.error) và ProfileScreen nay hiển thị tên/SĐT.
- 2026-10-05 22:03:11 — Hoàn thành Phase 3 (Gom màu trùng + chuẩn hóa component dùng chung): tạo `theme/status.ts` làm nguồn chung cho badge trạng thái, wire invoice/payment (bỏ 12 cặp hex trùng), chuẩn hóa Status/StepByStep/ActionButtonBottom/DatePicker/Loading/QuickActionButton/CardComponent về token. Sửa thêm 1 tàn dư tamagui. Verify tsc = 47 (0 lỗi mới). Lưu ý review: brand được thống nhất (nút primary xanh #007AFF/blue-600 → tím brand; tint card/badge về *Surface).
- 2026-10-05 22:18:55 — Hoàn thành Phase 4 (Migrate screens ưu tiên): property/room/tenant/contract/invoice/auth/dashboard(+report/profile) → dùng class/token semantic; 8/8 nhóm ưu tiên = 0 hex màu. Đổi semantic `info` teal→blue. Giữ cố ý màu trang trí dashboard. Verify tsc = 47 (0 lỗi mới). CÒN: landlord (legacy) + vài hex nội bộ component là tùy chọn. Lưu ý review: panel thông tin dùng blue `info`, nút chính dùng tím `primary` toàn app.
- 2026-10-05 22:24:29 — Hoàn thành Phase 5 (Guardrail): thêm `scripts/check-hardcoded-colors.js` + `scripts/color-baseline.json` (ratchet) và npm script `check:colors`. Chặn mọi hex hardcode MỚI; nợ cũ giữ trong baseline để dọn dần. Đã test chặn/xanh đúng. => Kết thúc trọn bộ Phase 1→5 cho khởi tạo hệ design token.
- 2026-10-05 22:27 — Thêm tài liệu hướng dẫn `src/theme/README.md`: cách dùng (className semantic + `tokens`), bảng class, cách THAY ĐỔI màu/thang (sửa 1 chỗ ở `tokens.js`), cách NÂNG CẤP (thêm dark mode), và cách dùng guardrail `check:colors`.
