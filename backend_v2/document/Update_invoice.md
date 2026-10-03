# Module Thanh Toán Hóa Đơn (Invoice Payment)

## 1. Mục tiêu

Module thanh toán hóa đơn cho phép người quản lý ghi nhận các lần thanh toán của khách thuê đối với từng hóa đơn.

Hệ thống cần đảm bảo:

- Ghi nhận đầy đủ lịch sử thanh toán.
- Kiểm tra tính hợp lệ của khoản thanh toán.
- Tự động cập nhật trạng thái hóa đơn.
- Tính toán lại số tiền còn nợ.
- Hỗ trợ cộng dồn công nợ sang kỳ hóa đơn tiếp theo (nếu được cấu hình).
- Đảm bảo dữ liệu luôn nhất quán thông qua Transaction.

---

# 2. API

## Endpoint

```http
POST /payments
```

## Request Body

| Thuộc tính | Kiểu | Bắt buộc | Mô tả |
|------------|------|----------|-------|
| invoiceId | string | ✅ | ID hóa đơn cần thanh toán |
| amount | decimal | ✅ | Số tiền khách thanh toán |
| paymentMethod | enum | ✅ | Phương thức thanh toán |
| note | string | ❌ | Ghi chú |
| carryDebtToNextInvoice | boolean | ✅ | Có cộng dồn công nợ sang hóa đơn tiếp theo hay không |

---

# 3. Nghiệp vụ

## 3.1 Kiểm tra hóa đơn

Khi nhận yêu cầu thanh toán hệ thống cần kiểm tra:

- Hóa đơn có tồn tại.
- Hóa đơn chưa bị xóa.
- Hóa đơn không ở trạng thái `DRAFT`.
- Hóa đơn không ở trạng thái `CANCELLED`.
- Hóa đơn chưa được thanh toán hoàn tất (`PAID`).

Nếu không thỏa mãn trả về lỗi.

---

## 3.2 Kiểm tra số tiền thanh toán

### Rule 1

Số tiền thanh toán phải lớn hơn 0.

```text
amount > 0
```

Nếu không

```text
INVALID_PAYMENT_AMOUNT
```

---

### Rule 2

Số tiền thanh toán không được lớn hơn số tiền còn phải thu.

```text
amount <= remainingAmount
```

Ví dụ

```
remainingAmount = 2.000.000

payment = 2.500.000
```

Trả lỗi

```text
PAYMENT_EXCEED_REMAINING_AMOUNT
```

---

### Rule 3

Không cho phép thanh toán hóa đơn đã thanh toán.

```text
status = PAID
```

---

# 4. Luồng xử lý

## Bước 1

Lấy thông tin Invoice theo

```text
invoiceId
```

---

## Bước 2

Kiểm tra trạng thái Invoice

Không cho phép thanh toán nếu

- DRAFT
- CANCELLED
- PAID

---

## Bước 3

Kiểm tra số tiền thanh toán

```
amount > 0
```

---

## Bước 4

Kiểm tra

```
amount <= remainingAmount
```

---

## Bước 5

Tạo Payment

Thông tin cần lưu

- invoiceId
- contractId
- amount
- paymentMethod
- note
- createdBy
- createdAt

---

## Bước 6

Cập nhật Invoice

```
paidAmount = paidAmount + amount

remainingAmount = totalAmount - paidAmount
```

---

## Bước 7

Cập nhật trạng thái Invoice

Chi tiết ở mục 5.

---

## Bước 8

Kiểm tra công nợ hóa đơn trước

Nếu Invoice có

```
preInvoiceId
```

↓

Lấy Invoice trước

↓

Kiểm tra trạng thái

Nếu Invoice trước còn nợ

- PENDING
- PARTIALLY_PAID
- OVERDUE

thì xác định tồn tại công nợ.

---

## Bước 9

Nếu cấu hình cộng dồn công nợ

```
carryDebtToNextInvoice = true
```

↓

Khi tạo hóa đơn kỳ tiếp theo sẽ cộng phần còn nợ của hóa đơn hiện tại.

---

# 5. Quy tắc cập nhật trạng thái hóa đơn

## Trường hợp 1

Thanh toán đủ

```
remainingAmount == 0
```

↓

```
status = PAID
```

---

## Trường hợp 2

Thanh toán một phần

```
paidAmount > 0

remainingAmount > 0
```

↓

```
status = PARTIALLY_PAID
```

---

## Trường hợp 3

Chưa thanh toán

```
paidAmount == 0

today <= dueDate
```

↓

```
status = PENDING
```

---

## Trường hợp 4

Quá hạn

```
remainingAmount > 0

today > dueDate
```

↓

```
status = OVERDUE
```

---

# 6. Công nợ hóa đơn

Nếu hóa đơn trước còn tiền chưa thanh toán

```
previousDebt = previousInvoice.remainingAmount
```

Nếu

```
carryDebtToNextInvoice = true
```

↓

Khi tạo hóa đơn tiếp theo

```
newInvoice.totalAmount

=

serviceAmount

+

previousDebt
```

Đồng thời

```
newInvoice.remainingAmount

=

newInvoice.totalAmount
```

Nếu

```
carryDebtToNextInvoice = false
```

↓

Không cộng tiền nợ.

Hóa đơn cũ vẫn giữ nguyên trạng thái.

---

# 7. Công thức tính

## Tổng tiền hóa đơn

```
Total Amount

=

Tiền phòng

+

Tiền điện

+

Tiền nước

+

Dịch vụ

+

Khoản phát sinh

+

Công nợ kỳ trước
```

---

## Đã thanh toán

```
Paid Amount

=

Tổng tất cả Payment
```

---

## Còn phải thanh toán

```
Remaining Amount

=

Total Amount

-

Paid Amount
```

---

# 8. Transaction

Toàn bộ quá trình phải thực hiện trong một Transaction.

Bao gồm

```
Insert Payment

↓

Update Invoice

↓

Update Invoice Status

↓

Update Pre Invoice (nếu cần)

↓

Commit
```

Nếu bất kỳ bước nào lỗi

↓

Rollback toàn bộ.

---

# 10. Business Rules

| Mã | Quy tắc |
|-----|----------|
| BR-001 | Không thanh toán hóa đơn Draft |
| BR-002 | Không thanh toán hóa đơn Cancelled |
| BR-003 | Không thanh toán hóa đơn đã Paid |
| BR-004 | Payment phải lớn hơn 0 |
| BR-005 | Payment không được lớn hơn Remaining Amount |
| BR-006 | PaidAmount luôn bằng tổng tất cả Payment |
| BR-007 | RemainingAmount = TotalAmount - PaidAmount |
| BR-008 | RemainingAmount = 0 ⇒ PAID |
| BR-009 | PaidAmount > 0 và RemainingAmount > 0 ⇒ PARTIALLY_PAID |
| BR-010 | RemainingAmount > 0 và quá DueDate ⇒ OVERDUE |
| BR-011 | Nếu bật cộng dồn công nợ thì hóa đơn tiếp theo phải cộng RemainingAmount của hóa đơn trước |
| BR-012 | Toàn bộ xử lý phải nằm trong Transaction |
| BR-013 | Không cho phép ghi nhận Payment cho Invoice không tồn tại |
| BR-014 | Mỗi Payment phải được lưu lịch sử và không được chỉnh sửa sau khi tạo |

---

# 11. Các trường hợp kiểm thử

## Thanh toán đủ

- Invoice còn nợ 2.000.000
- Thanh toán 2.000.000

Kết quả

- PaidAmount = 2.000.000
- RemainingAmount = 0
- Status = PAID

---

## Thanh toán một phần

- Invoice còn nợ 2.000.000
- Thanh toán 500.000

Kết quả

- PaidAmount = 500.000
- RemainingAmount = 1.500.000
- Status = PARTIALLY_PAID

---

## Thanh toán vượt quá

- Invoice còn nợ 2.000.000
- Thanh toán 2.500.000

Kết quả

- Báo lỗi
- Không tạo Payment

---

## Thanh toán hóa đơn đã Paid

Kết quả

- Báo lỗi

---

## Thanh toán hóa đơn Draft

Kết quả

- Báo lỗi

---

## Thanh toán hóa đơn Cancelled

Kết quả

- Báo lỗi

---

## Cộng dồn công nợ

Invoice tháng 1

```
Total = 3.000.000

Paid = 2.000.000

Remaining = 1.000.000
```

Tạo Invoice tháng 2

```
Tiền tháng mới = 3.500.000

Công nợ = 1.000.000
```

Kết quả

```
Total Invoice tháng 2

=

4.500.000
```