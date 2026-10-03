import { ContractStatus } from '../../common/enums/contract.enum';
import {
  InvoiceItemType,
  InvoiceStatus,
} from '../../common/enums/invoice.enum';
import { Contracts } from '../contract/entities/contracts.entity';
import { InvoiceCreateDto } from './dto/invoice-dto/invoice.create.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoiceService } from './invoice.service';

describe('InvoiceService.create - cộng dồn công nợ (BR-011)', () => {
  let service: InvoiceService;
  let queryRunnerMock: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
    manager: { save: jest.Mock };
  };
  let invoiceRepositoryMock: { findOne: jest.Mock; create: jest.Mock };
  let invoiceItemRepositoryMock: { create: jest.Mock };
  let contractRepositoryMock: { findOne: jest.Mock };
  let dataSourceMock: { createQueryRunner: jest.Mock };

  const buildContract = (overrides: Partial<Contracts> = {}): Contracts =>
    ({
      id: 'contract-1',
      roomId: 'room-1',
      status: ContractStatus.ACTIVE,
      carryDebtToNextInvoice: false,
      ...overrides,
    }) as Contracts;

  const buildPreInvoice = (overrides: Partial<Invoice> = {}): Invoice =>
    ({
      id: 'invoice-pre',
      contractId: 'contract-1',
      roomId: 'room-1',
      remainingAmount: '1000000',
      status: InvoiceStatus.PARTIALLY_PAID,
      ...overrides,
    }) as Invoice;

  const buildDto = (): InvoiceCreateDto => {
    const dto = new InvoiceCreateDto();
    dto.contractId = 'contract-1';
    dto.roomId = 'room-1';
    dto.propertyId = 'property-1';
    dto.billingPeriodStart = '2026-08-01';
    dto.billingPeriodEnd = '2026-08-31';
    dto.dueDate = '2026-08-10';
    dto.totalAmount = 3_500_000;
    dto.invoiceItems = [];
    return dto;
  };

  beforeEach(() => {
    queryRunnerMock = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: { save: jest.fn().mockResolvedValue(undefined) },
    };

    invoiceRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn((entity: unknown) => entity),
    };
    invoiceItemRepositoryMock = {
      create: jest.fn((items: unknown) => items),
    };
    contractRepositoryMock = { findOne: jest.fn() };
    dataSourceMock = { createQueryRunner: jest.fn(() => queryRunnerMock) };

    service = new InvoiceService(
      invoiceRepositoryMock as any,
      invoiceItemRepositoryMock as any,
      contractRepositoryMock as any,
      dataSourceMock as any,
    );
  });

  it('carryDebtToNextInvoice=true và hóa đơn trước còn nợ => cộng dồn vào totalAmount/remainingAmount kỳ mới', async () => {
    contractRepositoryMock.findOne.mockResolvedValue(
      buildContract({ carryDebtToNextInvoice: true }),
    );
    invoiceRepositoryMock.findOne.mockResolvedValue(
      buildPreInvoice({ remainingAmount: '1000000' }),
    );

    const dto = buildDto();
    const result = await service.create(dto);

    expect(result.totalAmount).toBe(4_500_000);
    expect(result.remainingAmount).toBe(4_500_000);

    const debtItem = result.invoiceItems?.find(
      (item) => item.type === InvoiceItemType.OTHER,
    );
    expect(debtItem).toBeDefined();
    expect(debtItem?.amount).toBe(1_000_000);
    expect(queryRunnerMock.commitTransaction).toHaveBeenCalledTimes(1);
  });

  it('carryDebtToNextInvoice=false => không cộng dồn, totalAmount giữ nguyên', async () => {
    contractRepositoryMock.findOne.mockResolvedValue(
      buildContract({ carryDebtToNextInvoice: false }),
    );
    invoiceRepositoryMock.findOne.mockResolvedValue(
      buildPreInvoice({ remainingAmount: '1000000' }),
    );

    const dto = buildDto();
    const result = await service.create(dto);

    expect(result.totalAmount).toBe(3_500_000);
    expect(
      result.invoiceItems?.some((item) => item.type === InvoiceItemType.OTHER),
    ).toBe(false);
  });

  it('hóa đơn trước đã PAID (không còn nợ) => không cộng dồn dù carryDebtToNextInvoice=true', async () => {
    contractRepositoryMock.findOne.mockResolvedValue(
      buildContract({ carryDebtToNextInvoice: true }),
    );
    invoiceRepositoryMock.findOne.mockResolvedValue(
      buildPreInvoice({ remainingAmount: '0', status: InvoiceStatus.PAID }),
    );

    const dto = buildDto();
    const result = await service.create(dto);

    expect(result.totalAmount).toBe(3_500_000);
  });
});
