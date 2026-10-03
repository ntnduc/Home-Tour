# Cập nhật UI card phòng trong RoomListView

- **Thời gian:** 2026-10-03 16:31:04
- **Mã file:** `20261003163104-cap-nhat-ui-card-phong-roomlistview`
- **Phạm vi:** Frontend
- **Trạng thái:** Hoàn thành & đã được người dùng chấp nhận

## Yêu cầu gốc
> Thay đổi UI của card phòng trong màn hình danh sách phòng (RoomListView):
> - Đưa thông báo cảnh báo (hóa đơn/công việc quá hạn) lên **đầu card, phía trên title**;
>   cho phép `CardComponent` nhận một prop render DOM phía trên. Bỏ border + background riêng
>   của thông báo, thay vào đó đổi style của **nguyên card** theo màu của thông báo.
> - Nền cảnh báo nhạt hơn, **bỏ border** và dùng **box-shadow** (màu theo cảnh báo) thay cho border;
>   box-shadow không lan ngang quá nhiều. Banner cảnh báo cần nổi bật hơn: **tăng cỡ chữ** và **canh giữa**.
> - Số lượng task đang chờ (`pendingTaskCount`) không render cạnh title nữa mà đưa ra **góc trên phải**
>   của card, đè ra ngoài một chút như badge thông báo của các app. Ưu tiên dùng component bên thứ ba.
> - Sửa lỗi nền của các nút trong "Hành động thêm" bị tràn ra ngoài viền nút.

## Thay đổi Backend
Không có.

## Thay đổi Frontend
- **`CardComponent`**: thêm prop mới `topContent?: React.ReactNode`, render ở đầu card (phía trên
  header/title). Backward compatible — card không truyền prop giữ nguyên hành vi cũ.
- **`RoomCardItemComponents`**:
  - Bỏ hộp cảnh báo cũ (`overdueAlertRow`) có border + background trong thân card; thay bằng banner
    `cardNotice` (icon + text) **không border/background**, truyền qua prop `topContent` để nằm trên title.
  - Khi `hasOverdueAlert`: đổi style **nguyên card** theo tông cảnh báo — nền tint nhạt (`#FFF6F6`),
    `borderWidth: 0`, dùng **box-shadow màu đỏ** (offset {0,3}, opacity 0.18, radius 5, elevation 5)
    thay cho border; box-shadow tập trung xuống dưới, hạn chế lan trái/phải.
  - Banner cảnh báo nổi bật hơn: chữ `fontSize 14` + `fontWeight 700`, canh giữa (icon + text), icon size 17.
  - Chuyển badge `pendingTaskCount` từ cạnh title ra **góc trên phải** card, lồi ra ngoài
    (`top: -8, right: -6`, `zIndex 20`) như badge thông báo; dùng component `Badge` của
    **`react-native-elements`** (bên thứ ba). `>99` hiển thị `99+`, có viền trắng 2px cho nổi trên mép card.
  - Bọc card trong `cardWrapper` (`position: relative`) để định vị badge; chuyển `marginBottom` sang wrapper.
  - Thêm `overflow: "hidden"` cho style nút `roomActionButton` để nền không tràn ra ngoài viền bo tròn
    (áp dụng cho cả nút chính và nút trong "Hành động thêm").

## Danh sách file bị ảnh hưởng
- `mobile/src/screens/common/CardComponent.tsx` — thêm prop `topContent` và render phía trên header.
- `mobile/src/screens/room/components/RoomCardItemComponents.tsx` — banner cảnh báo trên title,
  đổi màu nguyên card theo cảnh báo (box-shadow thay border), badge count ở góc card, bọc `cardWrapper`.
- `mobile/src/screens/room/styles/StyleRoomCardItemComponent.ts` — thêm `cardWrapper`, `cardNotice`/
  `cardNoticeText`, style badge góc (`pendingBadgeContainer`/`pendingBadge`/`pendingBadgeText`),
  `overflow: hidden` cho `roomActionButton`; bỏ style cảnh báo cũ (`overdueAlertRow`) và badge inline cũ
  (`titleWithBadge`/`pendingTaskBadge`...).

## Ghi chú / việc cần làm tiếp
- Worktree này chưa cài `node_modules`; để test chạy `npm ci` (hoặc symlink node_modules của repo chính)
  rồi `npx expo start -c`, vào tab "Danh Sách Phòng" để kiểm tra trực quan.
- `Badge` lấy từ `react-native-elements` (đã có sẵn trong dependencies).
- Có file `mobile/yarn.lock` lạ đang untracked (repo dùng npm) — nên xoá để không lọt vào PR.

## Nhật ký cập nhật
- 2026-10-03 16:31:04 — Tạo bản ghi ban đầu.
