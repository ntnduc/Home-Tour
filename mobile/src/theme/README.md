# Design Tokens (mobile) — Hướng dẫn sử dụng & nâng cấp

Tài liệu này mô tả cách dùng hệ **design token** của app mobile, và cách **thay đổi / nâng cấp** khi cần.

> TL;DR: Đừng hardcode mã màu (hex). Dùng **class semantic** (`bg-primary`, `text-muted`…) trong `className`, hoặc import `tokens` khi buộc phải truyền màu vào prop. Muốn đổi màu toàn app → sửa **một chỗ** trong [`tokens.js`](./tokens.js).

---

## 1. Kiến trúc (2 lớp)

```
tokens.js  ──►  primitives (palette thô)  ──►  semantic (ngữ nghĩa)  ──►  UI
(nguồn chân         brand/gray/red...          primary/surface/            - className: bg-primary, text-muted
 lý DUY NHẤT)                                   muted/success...           - tokens.colors.* (khi cần prop màu)
```

- [`tokens.js`](./tokens.js) — **nguồn chân lý duy nhất** (CommonJS). Giữ giá trị thô: `palette`, `semantic`, `spacingScale`, `fontSize`, `lineHeight`, `fontWeight`, `radius`. Vì file `.js` nên **cả** `tailwind.config.js` (chạy bằng Node) lẫn app (TypeScript) cùng `require`/`import` được.
- [`primitives.ts`](./primitives.ts) — re-export `palette` (màu thô theo thang bậc, **không** dùng trực tiếp trong UI).
- [`semantic.ts`](./semantic.ts) — re-export `semanticColors` (token mang ngữ nghĩa — thứ UI nên dùng).
- [`status.ts`](./status.ts) — màu badge trạng thái dùng chung (`statusColor`).
- [`spacing.ts`](./spacing.ts), [`typography.ts`](./typography.ts), [`radius.ts`](./radius.ts) — thang khoảng cách / chữ / bo góc.
- [`index.ts`](./index.ts) — export gộp: `tokens`, `semanticColors`, `statusColor`, `palette`… và `colors`/`theme` (cũ, **deprecated**, chỉ để tương thích ngược).
- [`../../tailwind.config.js`](../../tailwind.config.js) — bắc cầu token → class NativeWind.

---

## 2. Dùng hằng ngày

### 2.1. Trong JSX — ưu tiên dùng `className` semantic

```tsx
<View className="bg-surface p-md rounded-lg border border-border">
  <Text className="text-lg font-bold text-foreground">Tiêu đề</Text>
  <Text className="text-sm text-muted">Mô tả phụ</Text>
  <TouchableOpacity className="bg-primary rounded-lg p-sm">
    <Text className="text-white">Lưu</Text>
  </TouchableOpacity>
</View>
```

**Bảng class semantic có sẵn** (prefix `bg-` / `text-` / `border-` tuỳ ngữ cảnh):

| Nhóm | Class | Ý nghĩa |
|---|---|---|
| Brand | `primary`, `primary-muted`, `primary-strong`, `primary-foreground` | Màu thương hiệu (nút/hành động chính) |
| Phụ | `secondary`, `secondary-muted`, `secondary-strong` | Hành động phụ / nhấn mạnh |
| Nền | `surface`, `surface-muted`, `surface-strong`, `surface-foreground` | Nền & nội dung trên nền |
| Chữ | `foreground`, `foreground-muted`, `foreground-subtle` | Text chính / phụ / mờ |
| Viền | `border`, `border-strong` | Viền nhạt / đậm |
| Trạng thái | `success`, `warning`, `error`, `info`, `draft` (+ `-surface`) | Màu trạng thái + nền nhạt cho badge |

Ví dụ badge: `className="bg-success-surface"` + `className="text-success"`.

**Typography:** `text-xs text-sm text-md text-lg text-xl text-xxl text-xxxl` (đã kèm line-height).
**Spacing:** `p-xs p-sm p-md p-lg p-xl p-xxl` (và `m-`, `gap-`, `px-`, `py-`…). Vẫn dùng được thang số mặc định của Tailwind (`p-4`…).
**Bo góc:** `rounded-sm rounded-md rounded-lg rounded-xl rounded-xxl rounded-full`.

### 2.2. Khi buộc phải truyền MÀU vào prop (không dùng được className)

Ví dụ: `color` của icon (`Ionicons`), `ActivityIndicator`, thư viện chart, `placeholderTextColor`…

```tsx
import { tokens } from "@/theme";

<Ionicons name="pencil" size={20} color={tokens.colors.primary} />
<ActivityIndicator color={tokens.colors.primary} />
<TextInput placeholderTextColor={tokens.colors.subtle} />
```

`tokens.colors.*` = semantic (string hex). Khi cần palette thô: `tokens.palette.brand[500]`, `tokens.palette.gray[200]`…

### 2.3. Màu badge trạng thái (invoice/payment…)

```ts
import { statusColor } from "@/theme";
// statusColor.pending => { bg, color }; các key: draft | pending | success | info | error | cancelled
```

### ❌ Đừng làm
- Hardcode hex: `color="#6a5af9"`, `className="bg-[#6a5af9]"`, `backgroundColor: "#fff"` trong style màu.
- Dùng palette mặc định của Tailwind cho brand: `bg-blue-600`, `text-blue-800` (dùng `bg-primary`, `text-info`…).
- Dùng `colors`/`theme` cũ từ `@/theme` cho code mới (đã **deprecated**).

---

## 3. Thay đổi (đổi màu / thêm token)

> Luôn sửa ở [`tokens.js`](./tokens.js). Sau khi sửa, **khởi động lại Metro với cache sạch** để Tailwind nạp lại: `npm start -- --clear`.

### 3.1. Đổi màu brand (hoặc bất kỳ màu semantic nào) cho TOÀN APP
Sửa đúng một dòng trong `semantic` của [`tokens.js`](./tokens.js). Ví dụ đổi màu chính sang xanh dương:

```js
// tokens.js
const semantic = {
  primary: palette.blue[500],       // trước: palette.brand[500]
  primaryMuted: palette.blue[50],
  primaryStrong: palette.blue[700],
  // ...
};
```

Mọi `bg-primary`, `text-primary`, `tokens.colors.primary` trong toàn app tự đổi theo.

### 3.2. Chỉnh một nấc màu trong palette
Sửa giá trị trong `palette` của [`tokens.js`](./tokens.js), ví dụ `palette.brand[500] = "#7c6cff"`.

### 3.3. Thêm một màu/thang mới
1. Thêm giá trị vào `palette`/`semantic` trong [`tokens.js`](./tokens.js).
2. Bắc cầu class trong [`tailwind.config.js`](../../tailwind.config.js) tại `theme.extend.colors` (vd thêm `brandAlt: { DEFAULT: semantic.brandAlt }` → class `bg-brand-alt`).
3. (Khuyến nghị) thêm vào bảng ở Mục 2.1 của tài liệu này.

### 3.4. Thêm trạng thái badge mới
Thêm key vào `statusColor` trong [`status.ts`](./status.ts), rồi map enum nghiệp vụ tới nó trong `types/*.ts`.

---

## 4. Nâng cấp: thêm Dark Mode (khi cần)

Kiến trúc đã **sẵn sàng**: tên class semantic cố định, `darkMode: "class"` đã bật sẵn trong [`tailwind.config.js`](../../tailwind.config.js). Khi muốn làm dark mode:

1. Trong [`tokens.js`](./tokens.js): tạo thêm bảng `semanticDark` (cùng key với `semantic`, đổi giá trị cho nền tối).
2. Cho NativeWind dùng CSS variables theo class `.dark` (tham khảo tài liệu NativeWind v4 về dark mode + `vars()`), hoặc đổi `value` của Context trong [`ThemeProvider.tsx`](./ThemeProvider.tsx) theo chế độ sáng/tối rồi đọc qua `useTheme()`.
3. **Không cần sửa UI**: các class `bg-surface`, `text-foreground`… giữ nguyên, chỉ giá trị token thay đổi theo mode.

> `ThemeProvider` + `useTheme()` đã có sẵn để sau này gắn logic chuyển mode mà không phải sửa component đang dùng.

---

## 5. Guardrail — chống tái phát hex hardcode

Script: [`../../scripts/check-hardcoded-colors.js`](../../scripts/check-hardcoded-colors.js) (cơ chế "ratchet" theo baseline).

```bash
npm run check:colors          # kiểm tra: FAIL nếu có hex MỚI vượt baseline
npm run check:colors:update   # chốt lại baseline (sau khi dọn bớt hex / thêm màu hợp lệ)
```

- Nợ hex cũ (trong `components/`, `styles/`, `landlord/`…) được giữ trong [`color-baseline.json`](../../scripts/color-baseline.json) nên không làm đỏ.
- Mỗi khi bạn **dọn bớt** hex trong một file → chạy `check:colors:update` để **hạ** baseline (ratchet chỉ đi xuống).
- Nên chạy `npm run check:colors` trước khi commit / trong CI.

---

## 6. Quy ước nhanh (ghi nhớ)

- **Một nguồn chân lý:** mọi giá trị màu/thang ở [`tokens.js`](./tokens.js).
- **UI dùng semantic:** `className` semantic trước, `tokens.colors.*` khi cần prop.
- **Không hardcode hex.** Màu trắng/đen thuần (`#fff`, `#000`) được chấp nhận.
- **Đổi 1 chỗ → đổi toàn app.** Tên class không đổi khi đổi giá trị ⇒ dễ rebrand & thêm dark mode.
