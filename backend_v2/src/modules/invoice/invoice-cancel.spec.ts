import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from 'src/common/enums/invoice.enum';
import { Contracts } from '../contract/entities/contracts.entity';
import { ContractStatus } from 'src/common/enums/contract.enum';
import { Invoice } from './entities/invoice.entity';
import { InvoiceService } from './invoice.service';

describe('InvoiceService.cancel', () => {
  let service: InvoiceService;
  let manager: { findOne: jest.Mock; update: jest.Mock };
  let queryRunner: any;

  const withInvoice = (inv: any, contract: any = { status: 'ACTIVE' }) =>
    manager.findOne.mockImplementation(async (entity) =>
      entity === Contracts ? contract : inv,
    );

  beforeEach(() => {
    manager = { findOne: jest.fn(), update: jest.fn() };
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager,
    };
    const dataSource = { createQueryRunner: () => queryRunner };
    service = new InvoiceService(
      {} as any,
      {} as any,
      {} as any,
      dataSource as any,
      {} as any,
    );
    jest.spyOn(service, 'get').mockResolvedValue({ id: 'inv-1' } as any);
  });

  it('rejects a blank reason before touching the db', async () => {
    await expect(
      service.cancel({ id: 'inv-1', reason: '  ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(queryRunner.startTransaction).not.toHaveBeenCalled();
  });

  it('rejects an unknown invoice', async () => {
    withInvoice(null);
    await expect(
      service.cancel({ id: 'inv-1', reason: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
  });

  it.each([
    InvoiceStatus.PAID,
    InvoiceStatus.PARTIALLY_PAID,
    InvoiceStatus.OVERDUE,
    InvoiceStatus.CANCELLED,
  ])('rejects status %s', async (status) => {
    withInvoice({ id: 'inv-1', status, paidAmount: 0 });
    await expect(
      service.cancel({ id: 'inv-1', reason: 'x' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.update).not.toHaveBeenCalled();
  });

  it('rejects an invoice that already has a payment', async () => {
    withInvoice({
      id: 'inv-1',
      status: InvoiceStatus.PENDING,
      paidAmount: 100,
    });
    await expect(service.cancel({ id: 'inv-1', reason: 'x' })).rejects.toThrow(
      'Hóa đơn đã có thanh toán, không thể hủy',
    );
  });

  it('cancels a pending invoice in its own transaction and appends the reason', async () => {
    withInvoice({
      id: 'inv-1',
      status: InvoiceStatus.PENDING,
      paidAmount: 0,
      notes: 'ghi chú',
    });
    await service.cancel({ id: 'inv-1', reason: ' Khách hủy ' });
    expect(manager.update).toHaveBeenCalledWith(Invoice, 'inv-1', {
      status: InvoiceStatus.CANCELLED,
      notes: 'ghi chú\nLý do hủy: Khách hủy',
    });
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('refuses the first invoice of a contract waiting for payment', async () => {
    withInvoice(
      { id: 'inv-1', status: InvoiceStatus.PENDING, paidAmount: 0 },
      { status: ContractStatus.WAITING_PAYMENT_INVOICE },
    );
    await expect(
      service.cancel({ id: 'inv-1', reason: 'x' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.update).not.toHaveBeenCalled();
  });

  it('joins the caller transaction when a manager is passed', async () => {
    const external = {
      findOne: jest.fn().mockResolvedValue({
        id: 'inv-1',
        status: InvoiceStatus.DRAFT,
        paidAmount: 0,
      }),
      update: jest.fn(),
    };
    await service.cancel({ id: 'inv-1', reason: 'x' }, external as any);
    expect(external.update).toHaveBeenCalled();
    expect(queryRunner.startTransaction).not.toHaveBeenCalled();
  });
});
