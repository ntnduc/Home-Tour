import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '../../common/enums/invoice.enum';
import { Invoice } from '../invoice/entities/invoice.entity';
import { PaymentCreateDto } from './dto/payment-dto/payment.create.dto';
import { PaymentService, resolveInvoiceStatus } from './payment.service';

describe('resolveInvoiceStatus (pure function)', () => {
  it('BR-008: remainingAmount <= 0 => PAID', () => {
    const status = resolveInvoiceStatus({
      paidAmount: 2_000_000,
      remainingAmount: 0,
      dueDate: new Date('2026-08-01'),
    });
    expect(status).toBe(InvoiceStatus.PAID);
  });

  it('BR-009: paidAmount > 0 và remainingAmount > 0 => PARTIALLY_PAID', () => {
    const status = resolveInvoiceStatus({
      paidAmount: 500_000,
      remainingAmount: 1_500_000,
      dueDate: new Date('2026-08-01'),
    });
    expect(status).toBe(InvoiceStatus.PARTIALLY_PAID);
  });

  it('BR-010: chưa thanh toán và đã quá hạn => OVERDUE', () => {
    const status = resolveInvoiceStatus({
      paidAmount: 0,
      remainingAmount: 2_000_000,
      dueDate: new Date('2000-01-01'),
      now: new Date('2026-07-18'),
    });
    expect(status).toBe(InvoiceStatus.OVERDUE);
  });

  it('chưa thanh toán và chưa quá hạn => PENDING', () => {
    const status = resolveInvoiceStatus({
      paidAmount: 0,
      remainingAmount: 2_000_000,
      dueDate: new Date('2026-12-31'),
      now: new Date('2026-07-18'),
    });
    expect(status).toBe(InvoiceStatus.PENDING);
  });
});

describe('PaymentService.create', () => {
  let service: PaymentService;
  let queryRunnerMock: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
    manager: { findOne: jest.Mock; save: jest.Mock };
  };
  let dataSourceMock: { createQueryRunner: jest.Mock };

  const buildInvoice = (overrides: Partial<Invoice> = {}): Invoice =>
    ({
      id: 'invoice-1',
      propertyId: 'property-1',
      totalAmount: '2000000',
      paidAmount: '0',
      remainingAmount: '2000000',
      status: InvoiceStatus.PENDING,
      dueDate: new Date('2026-12-31'),
      ...overrides,
    }) as Invoice;

  const buildDto = (
    amount: number,
    extra: Partial<PaymentCreateDto> = {},
  ): PaymentCreateDto => {
    const dto = new PaymentCreateDto();
    dto.invoiceId = 'invoice-1';
    dto.amount = amount;
    Object.assign(dto, extra);
    return dto;
  };

  beforeEach(() => {
    queryRunnerMock = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn((_entityClass: unknown, entity: unknown) =>
          Promise.resolve(entity),
        ),
      },
    };

    dataSourceMock = {
      createQueryRunner: jest.fn(() => queryRunnerMock),
    };

    const paymentRepositoryMock = { createQueryBuilder: jest.fn() } as any;
    const invoiceRepositoryMock = {} as any;

    service = new PaymentService(
      paymentRepositoryMock,
      invoiceRepositoryMock,
      dataSourceMock as any,
    );
  });

  it('thanh toán đủ: paidAmount=remaining => paidAmount=amount, remaining=0, status=PAID', async () => {
    const invoice = buildInvoice({
      totalAmount: 2000000,
      paidAmount: 0,
      remainingAmount: 2000000,
    });
    queryRunnerMock.manager.findOne.mockResolvedValue(invoice);

    await service.create(buildDto(2_000_000));

    expect(invoice.paidAmount).toBe(2_000_000);
    expect(invoice.remainingAmount).toBe(0);
    expect(invoice.status).toBe(InvoiceStatus.PAID);
    expect(queryRunnerMock.commitTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunnerMock.rollbackTransaction).not.toHaveBeenCalled();
  });

  it('thanh toán một phần: amount=500.000 trên remaining=2.000.000 => PARTIALLY_PAID', async () => {
    const invoice = buildInvoice({
      totalAmount: 2000000,
      paidAmount: 0,
      remainingAmount: 2000000,
    });
    queryRunnerMock.manager.findOne.mockResolvedValue(invoice);

    await service.create(buildDto(500_000));

    expect(invoice.paidAmount).toBe(500_000);
    expect(invoice.remainingAmount).toBe(1_500_000);
    expect(invoice.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    expect(queryRunnerMock.commitTransaction).toHaveBeenCalledTimes(1);
  });

  it('thanh toán vượt quá remainingAmount => BadRequestException và rollback, không lưu Payment', async () => {
    const invoice = buildInvoice({
      totalAmount: 2000000,
      paidAmount: 0,
      remainingAmount: 2000000,
    });
    queryRunnerMock.manager.findOne.mockResolvedValue(invoice);

    await expect(service.create(buildDto(2_500_000))).rejects.toThrow(
      BadRequestException,
    );

    expect(queryRunnerMock.manager.save).not.toHaveBeenCalled();
    expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunnerMock.commitTransaction).not.toHaveBeenCalled();
  });

  it('amount <= 0 => BadRequestException (BR-004)', async () => {
    const invoice = buildInvoice();
    queryRunnerMock.manager.findOne.mockResolvedValue(invoice);

    await expect(service.create(buildDto(0))).rejects.toThrow(
      BadRequestException,
    );
    expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(1);
  });

  it('hóa đơn không tồn tại => NotFoundException (BR-013)', async () => {
    queryRunnerMock.manager.findOne.mockResolvedValue(null);

    await expect(service.create(buildDto(1_000))).rejects.toThrow(
      NotFoundException,
    );
    expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalledTimes(1);
  });

  it('hóa đơn DRAFT => BadRequestException (BR-001)', async () => {
    const invoice = buildInvoice({ status: InvoiceStatus.DRAFT });
    queryRunnerMock.manager.findOne.mockResolvedValue(invoice);

    await expect(service.create(buildDto(1_000_000))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('hóa đơn CANCELLED => BadRequestException (BR-002)', async () => {
    const invoice = buildInvoice({ status: InvoiceStatus.CANCELLED });
    queryRunnerMock.manager.findOne.mockResolvedValue(invoice);

    await expect(service.create(buildDto(1_000_000))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('hóa đơn đã PAID => BadRequestException (BR-003)', async () => {
    const invoice = buildInvoice({ status: InvoiceStatus.PAID });
    queryRunnerMock.manager.findOne.mockResolvedValue(invoice);

    await expect(service.create(buildDto(1_000_000))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('update() luôn bị chặn (BR-014)', async () => {
    await expect(service.update({ id: 'payment-1' } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('delete() luôn bị chặn (BR-014)', async () => {
    await expect(service.delete('payment-1')).rejects.toThrow(
      BadRequestException,
    );
  });
});
