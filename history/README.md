# History — Nhật ký thay đổi từ agent

Folder này lưu lại lịch sử các thay đổi mà agent thực hiện theo yêu cầu của người dùng.
Mục đích là để **dễ theo dõi đã có những update nào**, ai yêu cầu gì, đụng tới phần nào
(Backend / Frontend), và kết quả ra sao.

Backend (`backend_v2/`) và Frontend (`mobile/`) **dùng chung** folder history này.

## Khi nào tạo file history?

Chỉ tạo file history khi **cả hai điều kiện** sau được thỏa:

1. Agent đã **hoàn thành phần code** cho yêu cầu.
2. Người dùng đã **xác nhận / chấp nhận** kết quả.

> Không tạo file khi mới chỉ lên kế hoạch hoặc code chưa được chấp nhận.

## Quy ước đặt tên file

```
YYYYMMDDHHmmss-<slug-title>.md
```

- `YYYYMMDDHHmmss`: ngày giờ (giờ local của máy) tại thời điểm tạo file.
  Ví dụ `20261003112738` = 2026-10-03 11:27:38.
- `<slug-title>`: tiêu đề của change request, đã **bỏ dấu tiếng Việt**, **viết thường**,
  thay khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang `-`.

**Ví dụ:** yêu cầu "Cập nhật config history" lúc 2026-10-03 11:27:38
→ `20261003112738-cap-nhat-config-history.md`

## Cập nhật trong cùng một session

Nếu trong **cùng một session**, người dùng yêu cầu chỉnh sửa / bổ sung tiếp cho cùng
change request đó, thì **cập nhật lại chính file history đã tạo** (ghi thêm vào mục
"Nhật ký cập nhật") — **không tạo file mới**.

Yêu cầu mới ở session khác, hoặc là một change request khác → tạo file mới.

## Một yêu cầu đụng cả Backend và Frontend

Nếu một yêu cầu cần thay đổi cả BE và FE, **mô tả chung trong một file** duy nhất,
và đánh dấu "Phạm vi: Cả hai (Backend + Frontend)" rồi liệt kê thay đổi ở từng bên.

## Template

Dùng [`_TEMPLATE.md`](./_TEMPLATE.md) làm mẫu. File có tiền tố `_` nên **không** được
tính là một bản ghi history thật. Người dùng có thể chỉnh sửa template này bất cứ lúc nào;
agent phải đọc template hiện tại và viết file history theo đúng cấu trúc đó.
