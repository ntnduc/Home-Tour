export enum ContractStatus {
  /**
   * đợi bắt đầu
   */
  PENDING_START = 'PENDING_START',
  // đang chờ thanh toán hóa đơn đầu tiên
  WAITING_PAYMENT_INVOICE = 'WAITING_PAYMENT_INVOICE',
  // đang thực hiện
  ACTIVE = 'ACTIVE',
  // đã kết thúc
  ENDED = 'ENDED',
  // đã kết thúc sớm
  TERMINATED_EARLY = 'TERMINATED_EARLY',
  // kết thúc nhưng chưa thanh toán hết
  EXPIRED = 'EXPIRED',
  // nháp
  DRAFT = 'DRAFT',
}
