# Cập nhật config rule cho agent: ghi history sau mỗi thay đổi

- **Thời gian:** 2026-10-03 11:27:38
- **Mã file:** `20261003112738-cap-nhat-config-rule-ghi-history`
- **Phạm vi:** Cả hai (Backend + Frontend) — thay đổi ở phần cấu hình/hướng dẫn agent dùng chung
- **Trạng thái:** Hoàn thành & đã được người dùng chấp nhận

## Yêu cầu gốc
> Mỗi lần có yêu cầu đưa cho agent, sau khi hoàn thành code và người dùng chấp nhận thì
> tạo một file history trong folder `history`, tên file gồm ngày giờ + title change request,
> để dễ theo dõi các update từ agent. Nếu trong cùng session người dùng cập nhật tiếp thì
> cập nhật lại file history đó. Backend và Frontend lưu chung một folder; yêu cầu đụng cả BE
> và FE thì mô tả chung trong một file. Viết template history để agent đọc và dễ chỉnh sửa.

## Thay đổi Backend
- Thêm mục "History Logging" vào agent `backend_v2/.github/agents/nestjs-backend-developer.md`,
  trỏ tới quy ước và template history dùng chung.

## Thay đổi Frontend
- Thêm mục "History Logging" vào agent `mobile/.github/agents/react-native-developer.md`,
  trỏ tới quy ước và template history dùng chung.

## Danh sách file bị ảnh hưởng
- `history/README.md` — quy ước: khi nào tạo, cách đặt tên, cập nhật trong session, phạm vi BE+FE.
- `history/_TEMPLATE.md` — template tiếng Việt cho các bản ghi history.
- `.github/copilot-instructions.md` — thêm mục "History Logging" (quy tắc chung cho mọi agent).
- `backend_v2/.github/agents/nestjs-backend-developer.md` — tham chiếu quy tắc history.
- `mobile/.github/agents/react-native-developer.md` — tham chiếu quy tắc history.
- `history/20261003112738-cap-nhat-config-rule-ghi-history.md` — file history mẫu (chính file này).

## Ghi chú / việc cần làm tiếp
- Không cần cài thêm công cụ; đây là thay đổi tài liệu/hướng dẫn.
- Người dùng có thể chỉnh sửa `history/_TEMPLATE.md` bất cứ lúc nào; agent sẽ bám theo bản mới nhất.

## Nhật ký cập nhật
- 2026-10-03 11:27:38 — Tạo bản ghi ban đầu.
