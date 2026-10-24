import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceItemType, InvoiceStatus } from 'src/common/enums/invoice.enum';
import { Payment } from '../payment/entities/payment.entity';
import { InvoicePaymentDto } from './dto/invoice-dto/invoice.payment.dto';
import { Invoice } from './entities/invoice.entity';
import { calculateInvoicePayment } from './invoice-payment.util';
import { InvoiceService } from './invoice.service';

describe('calculateInvoicePayment', () => {
  const base = {
    paidAmount: 0,
    remainingAmount: 2_000_000,
    dueDate: new Date('2099-01-01'),
  };

  it('full payment -> PAID', () => {
    expect(calculateInvoicePayment(base, { amount: 2_000_000 })).toEqual({
      paidAmount: 2_000_000,
      remainingAmount: 0,
      carriedOverAmount: 0,
      status: InvoiceStatus.PAID,
    });
  });

  it('full payment with isCarryOver carries nothing', () => {
    const r = calculateInvoicePayment(base, {
      amount: 2_000_000,
      isCarryOver: true,
    });
    expect(r.status).toBe(InvoiceStatus.PAID);
    expect(r.carriedOverAmount).toBe(0);
  });

  it('partial payment + isCarryOver -> settled, shortfall carried forward', () => {
    expect(
      calculateInvoicePayment(base, { amount: 500_000, isCarryOver: true }),
    ).toEqual({
      paidAmount: 500_000,
      remainingAmount: 0,
      carriedOverAmount: 1_500_000,
      status: InvoiceStatus.PAID,
    });
  });

  it('partial payment without isCarryOver -> PARTIALLY_PAID, debt stays', () => {
    expect(calculateInvoicePayment(base, { amount: 500_000 })).toEqual({
      paidAmount: 500_000,
      remainingAmount: 1_500_000,
      carriedOverAmount: 0,
      status: InvoiceStatus.PARTIALLY_PAID,
    });
  });

  it('accumulates previous payments', () => {
    const r = calculateInvoicePayment(
      { ...base, paidAmount: 500_000, remainingAmount: 1_500_000 },
      { amount: 1_500_000 },
    );
    expect(r.paidAmount).toBe(2_000_000);
    expect(r.status).toBe(InvoiceStatus.PAID);
  });
});

describe('InvoiceService payment / confirm workflows', () => {
  let service: InvoiceService;
  let manager: { update: jest.Mock; save: jest.Mock; findOne: jest.Mock };
  let queryRunner: any;
  let invoiceRepo: { findOne: jest.Mock; update: jest.Mock };

  const invoice = (o: Partial<Invoice> = {}): Invoice =>
    ({
      id: 'inv-1',
      propertyId: 'p-1',
      status: InvoiceStatus.PENDING,
      totalAmount: 2_000_000,
      paidAmount: 0,
      remainingAmount: 2_000_000,
      dueDate: new Date('2099-01-01'),
      invoiceItems: [],
      ...o,
    }) as Invoice;

  const payDto = (o: Partial<InvoicePaymentDto> = {}): InvoicePaymentDto =>
    Object.assign(new InvoicePaymentDto(), {
      id: 'inv-1',
      paidAmount: 500_000,
      remainingAmount: 1_500_000,
      paymentMethod: 'CASH',
      ...o,
    });

  beforeEach(() => {
    manager = {
      update: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn().mockResolvedValue(null),
    };
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager,
    };
    invoiceRepo = { findOne: jest.fn(), update: jest.fn() };
    service = new InvoiceService(
      invoiceRepo as any,
      {} as any,
      {} as any,
      { createQueryRunner: () => queryRunner } as any,
      {} as any,
    );
    jest.spyOn(service, 'get').mockResolvedValue({ id: 'inv-1' } as any);
  });

  describe('confirmInvoice', () => {
    it('DRAFT -> PENDING inside an awaited, committed transaction', async () => {
      invoiceRepo.findOne.mockResolvedValue(
        invoice({ status: InvoiceStatus.DRAFT }),
      );
      await service.confirmInvoice('inv-1');

      expect(manager.update).toHaveBeenCalledWith(Invoice, 'inv-1', {
        status: InvoiceStatus.PENDING,
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(invoiceRepo.update).not.toHaveBeenCalled();
    });

    it('already PENDING: nothing written, no transaction, no rollback', async () => {
      invoiceRepo.findOne.mockResolvedValue(invoice());
      await service.confirmInvoice('inv-1');

      expect(queryRunner.connect).not.toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });

    it('invalid status / missing invoice fail without a transaction', async () => {
      invoiceRepo.findOne.mockResolvedValue(
        invoice({ status: InvoiceStatus.PAID }),
      );
      await expect(service.confirmInvoice('inv-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      invoiceRepo.findOne.mockResolvedValue(null);
      await expect(service.confirmInvoice('inv-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(queryRunner.connect).not.toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });
  });

  describe('paymentInvoice', () => {
    beforeEach(() => invoiceRepo.findOne.mockResolvedValue(invoice()));

    it('partial payment + isCarryOver: settles invoice and stores the carried balance', async () => {
      await service.paymentInvoice(payDto({ isCarryOver: true }));

      expect(manager.update).toHaveBeenCalledWith(Invoice, 'inv-1', {
        paidAmount: 500_000,
        remainingAmount: 0,
        carriedOverAmount: 1_500_000,
        status: InvoiceStatus.PAID,
      });
      expect(manager.save).toHaveBeenCalledWith(
        Payment,
        expect.objectContaining({ invoiceId: 'inv-1', amount: 500_000 }),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('partial payment without isCarryOver -> PARTIALLY_PAID', async () => {
      await service.paymentInvoice(payDto());
      expect(manager.update).toHaveBeenCalledWith(
        Invoice,
        'inv-1',
        expect.objectContaining({
          status: InvoiceStatus.PARTIALLY_PAID,
          remainingAmount: 1_500_000,
          carriedOverAmount: 0,
        }),
      );
    });

    it('rejects overpayment, zero amount and DRAFT invoices before any write', async () => {
      await expect(
        service.paymentInvoice(payDto({ paidAmount: 3_000_000 })),
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.paymentInvoice(payDto({ paidAmount: 0 })),
      ).rejects.toBeInstanceOf(BadRequestException);
      invoiceRepo.findOne.mockResolvedValue(
        invoice({ status: InvoiceStatus.DRAFT }),
      );
      await expect(service.paymentInvoice(payDto())).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(queryRunner.connect).not.toHaveBeenCalled();
      expect(manager.update).not.toHaveBeenCalled();
    });

    it('rolls back when a write fails', async () => {
      manager.save.mockRejectedValue(new Error('db down'));
      await expect(service.paymentInvoice(payDto())).rejects.toThrow('db down');
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    });
  });

  describe('create – carried-over balance', () => {
    it('adds the previous invoice carriedOverAmount even when the contract flag is off', async () => {
      const pre = invoice({
        id: 'inv-pre',
        status: InvoiceStatus.PAID,
        remainingAmount: 0,
        carriedOverAmount: 1_500_000,
        code: 'INV-1',
      });
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(pre),
      };
      queryRunner.manager = { save: jest.fn(), createQueryBuilder: () => qb };
      const itemRepo = { create: jest.fn((x: unknown) => x) };
      const contractRepo = {
        findOne: jest.fn().mockResolvedValue({
          id: 'c-1',
          status: 'ACTIVE',
          carryDebtToNextInvoice: false,
        }),
      };
      invoiceRepo = { findOne: jest.fn(), update: jest.fn() };
      (invoiceRepo as any).create = jest.fn((x: unknown) => x);
      service = new InvoiceService(
        invoiceRepo as any,
        itemRepo as any,
        contractRepo as any,
        { createQueryRunner: () => queryRunner } as any,
        {} as any,
      );

      const { InvoiceCreateDto } = await import(
        './dto/invoice-dto/invoice.create.dto'
      );
      const { InvoiceItemCreateDto } = await import(
        './dto/invoice-item-dto/invoice-item.create.dto'
      );
      const rent = new InvoiceItemCreateDto();
      Object.assign(rent, {
        amount: 3_500_000,
        type: InvoiceItemType.ROOM_RENT,
        propertyId: 'p-1',
      });
      const dto = new InvoiceCreateDto();
      Object.assign(dto, {
        contractId: 'c-1',
        roomId: 'r-1',
        propertyId: 'p-1',
        billingPeriodStart: '2026-08-01',
        billingPeriodEnd: '2026-08-31',
        dueDate: '2026-08-10',
        totalAmount: 3_500_000,
        invoiceItems: [rent],
      });
      const result = await service.create(dto);

      expect(result.totalAmount).toBe(5_000_000);
      expect(
        result.invoiceItems?.find((i) => i.type === InvoiceItemType.OTHER)
          ?.amount,
      ).toBe(1_500_000);
      expect(qb.andWhere).toHaveBeenCalledTimes(2);
    });
  });
});
