export enum InvoiceStatus {
  // Đã tạo hóa đơn nhưng chưa thanh toán
  PENDING = 'PENDING',
  // Đã thanh toán
  PAID = 'PAID',
  // Đã thanh toán một phần
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  // Quá hạn thanh toán
  OVERDUE = 'OVERDUE',
  // Đã hủy
  CANCELLED = 'CANCELLED',
  // Bản nháp
  DRAFT = 'DRAFT',
}

export enum InvoiceItemType {
  // Tiền thuê phòng
  ROOM_RENT = 'ROOM_RENT',
  // Tiền cọc hợp đồng
  DESPOSIT_CONTRACT = 'DESPOSIT_CONTRACT',
  SERVICE_FEE = 'SERVICE_FEE',
  OTHER = 'OTHER',
}

export const InvoiceTrackingStatusList = [
  InvoiceStatus.PENDING,
  InvoiceStatus.OVERDUE,
];

// Các trạng thái hóa đơn được xem là "còn công nợ" khi xét cộng dồn sang kỳ tiếp theo (BR-011).
export const DEBT_INVOICE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.PENDING,
  InvoiceStatus.PARTIALLY_PAID,
];

export const DATE_ALERT_THRESHOLD = 5; // Số ngày còn lại trước khi cảnh báo quá hạn thanh toán hóa đơn
