# Plan triển khai: Module Thanh Toán Hóa Đơn (Invoice Payment)

> Tài liệu này là **plan kỹ thuật** để một model/dev khác dùng làm hướng dẫn implement.
> Không chứa code hoàn chỉnh, chỉ mô tả chi tiết các bước, file cần đụng tới, chữ ký hàm, và ràng buộc nghiệp vụ.
> Nguồn nghiệp vụ: [document/Update_invoice.md](Update_invoice.md).

---

## 0. Quyết định thiết kế đã chốt (đọc trước khi code)

| # | Vấn đề | Quyết định |
|---|--------|------------|
| D1 | Nơi lưu cờ `carryDebtToNextInvoice` | **Lưu trên `Contracts`** (cấu hình chung cho cả hợp đồng). Thêm cột `carryDebtToNextInvoice: boolean` vào bảng `contracts`. |
| D2 | `contractId` trên `Payment` | **KHÔNG** thêm cột. Khi cần contractId thì lấy qua quan hệ `payment.invoice.contractId`. |
| D3 | Kiểu `paymentMethod` | **Giữ nguyên `string`** tự do như hiện tại (không tạo enum). |
| D4 | Endpoint thanh toán | **Override `create()`** của `BaseController`/`BaseService` trong module Payment để chạy logic nghiệp vụ. Không tạo endpoint mới. |
| D5 | Phạm vi | (1) Ghi nhận payment + cập nhật invoice (BR-001→BR-010); (2) Cộng dồn công nợ khi tạo kỳ sau (BR-011); (3) Migration DB; (4) Unit test theo mục 11 doc. |

> ⚠️ Lưu ý: request body trong doc có field `carryDebtToNextInvoice`, nhưng theo D1 cờ này thuộc **hợp đồng**, không phải per-payment. => **Bỏ field này khỏi `PaymentCreateDto`**; thay vào đó đọc `contract.carryDebtToNextInvoice`. (Xác nhận lại với PO nếu muốn cho phép override per-payment.)

---

## 1. Thay đổi Database (Migration)

### 1.1 Thêm cột vào bảng `contracts`
- Cột mới: `carryDebtToNextInvoice` — `boolean`, `default false`, `NOT NULL`.
- File entity cần sửa: [src/modules/contract/entities/contracts.entity.ts](../src/modules/contract/entities/contracts.entity.ts)
  - Thêm:
    ```ts
    // Có tự động cộng dồn công nợ còn lại sang kỳ hóa đơn tiếp theo hay không.
    @Column({ type: 'boolean', default: false })
    carryDebtToNextInvoice: boolean;
    ```

### 1.2 Kiểm tra kiểu số (decimal → string) ⚠️ Quan trọng
- TypeORM trả cột `decimal` dưới dạng **string**. Hiện `Invoice.totalAmount/paidAmount/remainingAmount` khai báo `number` nhưng runtime là string.
- Trong toàn bộ logic tính toán, **luôn ép kiểu `Number(...)`** trước khi cộng/trừ/so sánh để tránh lỗi nối chuỗi (`"2000000" + 500000`).

### 1.3 Sinh & chạy migration
- Sinh migration (sau khi sửa entity):
  ```bash
  npm run migration:generate -- src/database/migrations/AddCarryDebtToContract
  ```
- Kiểm tra file sinh ra trong [src/database/migrations/](../src/database/migrations/), đảm bảo chỉ `ADD COLUMN carryDebtToNextInvoice`.
- Chạy:
  ```bash
  npm run migration:run
  ```
- Tham khảo: [DATABASE_MIGRATION_GUIDE.md](../DATABASE_MIGRATION_GUIDE.md).

---

## 2. Enum & Hằng số

File: [src/common/enums/invoice.enum.ts](../src/common/enums/invoice.enum.ts) — đã có đủ:
`PENDING, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED, DRAFT`.

Nếu chưa có, thêm mã lỗi nghiệp vụ (khuyến nghị tạo hằng số message ở service, không cần enum riêng):
- `INVALID_PAYMENT_AMOUNT` — "Số tiền thanh toán phải lớn hơn 0"
- `PAYMENT_EXCEED_REMAINING_AMOUNT` — "Số tiền thanh toán vượt quá số tiền còn nợ"
- `INVOICE_NOT_FOUND` — "Hóa đơn không tồn tại"
- `INVOICE_NOT_PAYABLE` — "Không thể thanh toán hóa đơn ở trạng thái này"

---

## 3. DTO

### 3.1 `PaymentCreateDto`
File: [src/modules/payment/dto/payment-dto/payment.create.dto.ts](../src/modules/payment/dto/payment-dto/payment.create.dto.ts)

Chuẩn hóa lại các field theo doc mục 2 (request body):

| Field | Kiểu | Validator | Ghi chú |
|-------|------|-----------|---------|
| `invoiceId` | string (uuid) | `@IsUUID()` | Bắt buộc |
| `amount` | number | `@IsNumber() @Min(0.01)` hoặc `@IsPositive()` | Bắt buộc, > 0 |
| `paymentMethod` | string | `@IsString() @IsOptional()` | Mặc định `'CASH'` |
| `note` / `notes` | string | `@IsString() @IsOptional()` | Ghi chú (giữ tên `notes` cho khớp entity) |
| `paymentDate` | string (date) | `@IsDateString() @IsOptional()` | Mặc định `new Date()` nếu không truyền |
| `type` | `PaymentType` | `@IsEnum() @IsOptional()` | Mặc định `PaymentType.IN` (khách trả tiền vào) |

- **Bỏ** yêu cầu bắt buộc `propertyId` từ client → suy ra từ `invoice.propertyId` trong service (giảm rủi ro sai lệch dữ liệu). Có thể giữ optional.
- **Bỏ** field `status` khỏi input (status Payment do service quyết định).
- **Không thêm** `carryDebtToNextInvoice` (theo D1 — đọc từ contract).

### 3.2 `PaymentDetailDto`
- Giữ nguyên [payment.detail.dto.ts](../src/modules/payment/dto/payment-dto/payment.detail.dto.ts). Có thể bổ sung trả về ảnh chụp `invoice` sau khi cập nhật (đã có sẵn quan hệ invoice).

---

## 4. Service — Logic nghiệp vụ chính

File: [src/modules/payment/payment.service.ts](../src/modules/payment/payment.service.ts)

### 4.1 Dependencies cần inject thêm
```ts
constructor(
  @InjectRepository(Payment) paymentRepository: Repository<Payment>,
  @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>,
  private readonly dataSource: DataSource,   // để mở transaction
) { ... }
```
> Cần cập nhật [payment.module.ts](../src/modules/payment/payment.module.ts): `TypeOrmModule.forFeature([Payment, Invoice, Properties])` — đã có `Invoice`. Đảm bảo `DataSource` khả dụng (mặc định TypeOrmModule đã provide).

### 4.2 Override `create(dto: PaymentCreateDto): Promise<PaymentDetailDto>`

Thực hiện **toàn bộ trong 1 transaction** (theo mẫu ở [invoice.service.ts](../src/modules/invoice/invoice.service.ts) `create()` — dùng `queryRunner`).

**Trình tự (map với mục 4 của doc):**

1. **Mở transaction**: `queryRunner.connect()` → `startTransaction()`.
2. **Lấy Invoice** theo `dto.invoiceId` (dùng `queryRunner.manager` hoặc `invoiceRepository`), kèm quan hệ `contract`.
   - Không tồn tại / đã xóa → `NotFoundException(INVOICE_NOT_FOUND)`.  *(BR-013)*
3. **Kiểm tra trạng thái Invoice** — không cho thanh toán nếu:
   - `DRAFT` → `BadRequestException` *(BR-001)*
   - `CANCELLED` → `BadRequestException` *(BR-002)*
   - `PAID` → `BadRequestException` *(BR-003)*
4. **Ép kiểu số**: `totalAmount = Number(invoice.totalAmount)`, `paidAmount = Number(invoice.paidAmount)`, `remainingAmount = Number(invoice.remainingAmount)`.
5. **Validate amount**:
   - `amount > 0`, nếu không → `BadRequestException(INVALID_PAYMENT_AMOUNT)` *(BR-004)*
   - `amount <= remainingAmount`, nếu không → `BadRequestException(PAYMENT_EXCEED_REMAINING_AMOUNT)` *(BR-005)*
6. **Tạo Payment** (`queryRunner.manager.save`):
   - `invoiceId = dto.invoiceId`
   - `amount = dto.amount`
   - `propertyId = invoice.propertyId`
   - `paymentMethod = dto.paymentMethod ?? 'CASH'`
   - `type = dto.type ?? PaymentType.IN`
   - `status = PaymentStatus.PAID` (bản ghi payment là 1 lần trả thành công)
   - `paymentDate = dto.paymentDate ? new Date(...) : new Date()`
   - `notes = dto.notes`
   - `createdBy` tự set qua `BaseEntity.beforeInsert` (RequestContext).
7. **Cập nhật Invoice**:
   - `newPaidAmount = paidAmount + amount`
   - `newRemaining = totalAmount - newPaidAmount`
   - Gán lại `invoice.paidAmount`, `invoice.remainingAmount`.
   *(BR-006, BR-007)*
8. **Tính lại trạng thái Invoice** — gọi helper `resolveInvoiceStatus()` (mục 4.3), gán `invoice.status`.
9. **Lưu Invoice** trong transaction (`queryRunner.manager.save(invoice)`).
10. **Commit**. Nếu bất kỳ bước nào lỗi → `rollbackTransaction()` rồi ném lỗi. `finally { queryRunner.release() }`. *(BR-012)*
11. **Trả về** `PaymentDetailDto.fromEntity(payment)` (load lại kèm quan hệ invoice nếu muốn).

> **Lưu ý về cộng dồn công nợ**: cờ `contract.carryDebtToNextInvoice` **KHÔNG** xử lý ở bước thanh toán. Nó chỉ được đọc khi **tạo hóa đơn kỳ tiếp theo** (mục 5). Ở bước payment không cần đụng tới.

### 4.3 Helper: `resolveInvoiceStatus(...)`
Chữ ký gợi ý (đặt private trong PaymentService hoặc tách util dùng chung với InvoiceService):
```ts
private resolveInvoiceStatus(params: {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: Date;
  now?: Date;
}): InvoiceStatus
```
Quy tắc (map mục 5 doc):
- `remainingAmount <= 0` → `PAID` *(BR-008)*
- `paidAmount > 0 && remainingAmount > 0` → `PARTIALLY_PAID` *(BR-009)*
- `paidAmount === 0 && now <= dueDate` → `PENDING`
- `remainingAmount > 0 && now > dueDate` → `OVERDUE` *(BR-010)*

> Thứ tự kiểm tra quan trọng: kiểm PAID trước, rồi PARTIALLY_PAID, rồi so dueDate cho phần còn nợ. Dùng so sánh theo ngày (bỏ giờ) để tránh lệch timezone.

---

## 5. Cộng dồn công nợ khi tạo hóa đơn kỳ sau (BR-011)

File: [src/modules/invoice/invoice.service.ts](../src/modules/invoice/invoice.service.ts) — sửa hàm `create()`.

Logic bổ sung (trong transaction hiện có):
1. Sau khi tìm `findPreInvoice` (đã có sẵn), kiểm tra:
   - Hợp đồng có `carryDebtToNextInvoice === true`, **và**
   - `preInvoice` tồn tại và còn nợ (`status ∈ {PENDING, PARTIALLY_PAID, OVERDUE}` và `Number(preInvoice.remainingAmount) > 0`).
2. Nếu thỏa:
   - `previousDebt = Number(preInvoice.remainingAmount)`
   - Cộng vào tổng hóa đơn mới:
     - `entity.totalAmount = Number(entity.totalAmount) + previousDebt`
     - `entity.remainingAmount = entity.totalAmount - Number(entity.paidAmount ?? 0)`
   - (Tùy chọn) tạo thêm 1 `InvoiceItem` loại `OTHER` với mô tả "Công nợ kỳ trước" = `previousDebt` để minh bạch trên hóa đơn. **Khuyến nghị làm** để tổng item khớp `totalAmount`.
3. **Không** thay đổi trạng thái hóa đơn cũ (theo doc mục 6 — hóa đơn cũ giữ nguyên).

> ⚠️ Hiện `InvoiceCreateDto.getEntity()` set `paidAmount = totalAmount` mặc định (dòng `this.paidAmount ?? this.totalAmount`). Đây có vẻ là **bug** cho hóa đơn mới (mới tạo mà coi như đã trả đủ). Cần rà soát: hóa đơn mới nên `paidAmount = 0`, `remainingAmount = totalAmount`, `status = PENDING`. Xác nhận trước khi cộng dồn công nợ, nếu không remainingAmount sẽ sai.

---

## 6. Controller

File: [src/modules/payment/payment.controller.ts](../src/modules/payment/payment.controller.ts)

- Vì override `create()` ở **service**, endpoint `POST /api/payment` (do `BaseController` cung cấp) sẽ tự chạy logic mới — **không cần thêm endpoint**.
- Bổ sung `@ApiOperation` mô tả rõ đây là thanh toán hóa đơn, và các `@ApiResponse` 400/404 cho các lỗi nghiệp vụ.
- Kiểm tra quyền: controller đã có `@AutoCrudPermissions('PAYMENT')` + `@Roles(...)`. Cân nhắc `TENANT` có được tạo payment không (hiện đang nằm trong danh sách Roles) — xác nhận với PO.

---

## 7. Ràng buộc bất biến của Payment (BR-014)

- Payment **không được sửa** sau khi tạo. Khuyến nghị:
  - Vô hiệu hóa `update()` / `delete()` cho Payment (override ném `MethodNotAllowedException`) **hoặc** giới hạn chỉ cho phép sửa `notes`.
  - Xác nhận với PO mức độ khóa. Nếu chưa cần, ghi chú lại như tech-debt.

---

## 8. Unit test (mục 11 doc)

Tạo file: `src/modules/payment/payment.service.spec.ts`

Mock `invoiceRepository`, `dataSource.createQueryRunner()` (manager.save trả về entity). Các case:

| Case | Input | Kỳ vọng |
|------|-------|---------|
| Thanh toán đủ | remaining=2.000.000, amount=2.000.000 | paidAmount=2.000.000, remaining=0, status=`PAID` |
| Thanh toán một phần | remaining=2.000.000, amount=500.000 | paidAmount=500.000, remaining=1.500.000, status=`PARTIALLY_PAID` |
| Vượt quá | remaining=2.000.000, amount=2.500.000 | Ném `PAYMENT_EXCEED_REMAINING_AMOUNT`, **không** tạo Payment (rollback) |
| Invoice PAID | status=`PAID` | Ném lỗi BR-003 |
| Invoice DRAFT | status=`DRAFT` | Ném lỗi BR-001 |
| Invoice CANCELLED | status=`CANCELLED` | Ném lỗi BR-002 |
| amount <= 0 | amount=0 | Ném `INVALID_PAYMENT_AMOUNT` |
| Invoice không tồn tại | invoiceId sai | Ném `NotFoundException` |
| Quá hạn | remaining>0, now>dueDate | status=`OVERDUE` |

Test cộng dồn công nợ (đặt trong `invoice.service.spec.ts`):
| Case | Kỳ vọng |
|------|---------|
| Contract carryDebt=true, preInvoice remaining=1.000.000, tiền kỳ mới=3.500.000 | totalAmount kỳ mới = 4.500.000 |
| Contract carryDebt=false | Không cộng, totalAmount=3.500.000 |

---

## 9. Thứ tự thực hiện đề xuất

1. [x] Sửa entity `Contracts` thêm cột `carryDebtToNextInvoice` (mục 1.1).
2. [x] Tạo migration [1784389629397-AddCarryDebtToContract.ts](../src/database/migrations/1784389629397-AddCarryDebtToContract.ts) (viết tay, chưa `migration:run` — cần chạy thủ công).
3. [x] Chuẩn hóa `PaymentCreateDto` (mục 3.1).
4. [x] `PaymentModule` đã sẵn `Invoice` + `DataSource` (không cần sửa).
5. [x] Viết helper `resolveInvoiceStatus` (export pure function) + override `create()` trong `PaymentService` (mục 4).
6. [x] Sửa bug `paidAmount` mặc định trong `InvoiceCreateDto` (nay mặc định `0` thay vì `totalAmount`); thêm logic cộng dồn công nợ trong `InvoiceService.create()` (mục 5), có tạo `InvoiceItem` "Công nợ kỳ trước".
7. [x] Bổ sung Swagger cho controller, gỡ endpoint `PATCH :id/status` cũ (xung đột với BR-014) (mục 6).
8. [x] Khóa `update()`/`delete()` Payment — luôn ném `BadRequestException` (mục 7).
9. [x] Viết unit test: [payment.service.spec.ts](../src/modules/payment/payment.service.spec.ts), [invoice.service.spec.ts](../src/modules/invoice/invoice.service.spec.ts) (mục 8).
10. [ ] Chạy `npm run migration:run`, `npm run build` + `npm test` để xác nhận (chưa chạy được trong phiên này — cần chạy thủ công).

### Ghi chú triển khai thực tế (đã code)

- Thêm `carryDebtToNextInvoice` vào `ContractCreateDto`/`ContractUpdateDto`/`ContractDetailDto` để cờ này có thể set/đọc qua API (không có trong plan gốc nhưng cần thiết để dùng được D1).
- `PaymentCreateDto.propertyId` là optional, service tự lấy từ `invoice.propertyId` nếu không truyền.
- Đã gỡ endpoint `PATCH /api/payment/:id/status` cũ vì xung đột với quy tắc bất biến Payment (BR-014).
- Thứ tự ưu tiên trạng thái hóa đơn đã chọn: `PAID` → `PARTIALLY_PAID` → (`PENDING`/`OVERDUE` theo hạn, chỉ khi `paidAmount == 0`). Nghĩa là sau khi có bất kỳ khoản thanh toán nào (`paidAmount > 0`), hóa đơn sẽ không tự chuyển `OVERDUE` qua luồng thanh toán này — cần một job riêng (ngoài phạm vi) nếu muốn đánh dấu `OVERDUE` cho hóa đơn đã thanh toán một phần nhưng quá hạn.

---

## 10. Câu hỏi còn mở (cần PO xác nhận)

1. Có cho phép **override per-payment** cờ cộng dồn công nợ không? (Hiện chốt: đọc từ contract.)
2. `TENANT` có được phép tạo payment (ghi nhận thanh toán) không, hay chỉ nhân sự quản lý?
3. Payment có được phép chỉnh sửa/hủy sau khi tạo không (BR-014)? Nếu có thì field nào?
4. Xác nhận `paidAmount` mặc định của hóa đơn mới phải là `0` (nghi vấn bug ở mục 5).
5. Có cần thêm `InvoiceItem` "Công nợ kỳ trước" khi cộng dồn để tổng item khớp không? (Khuyến nghị: có.)
