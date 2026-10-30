import { BadRequestException } from '@nestjs/common';
import { ContractStatus } from 'src/common/enums/contract.enum';
import { InvoiceStatus } from 'src/common/enums/invoice.enum';
import { RoomStatus } from 'src/common/enums/room.enum';
import { Invoice } from '../invoice/entities/invoice.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Rooms } from '../property/entities/rooms.entity';
import { ContractService } from './contract.service';
import { Contracts } from './entities/contracts.entity';

const isoDay = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

describe('ContractService workflows', () => {
  let service: ContractService;
  let manager: {
    findOne: jest.Mock;
    find: jest.Mock;
    count: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let queryRunner: any;
  let invoiceService: {
    getPreInvoiceContract: jest.Mock;
    cancel: jest.Mock;
    applyPayment: jest.Mock;
  };
  let contractsRepository: { findOne: jest.Mock };

  const buildService = () => {
    manager = {
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      save: jest.fn().mockImplementation(async (a, b) => b ?? a),
      update: jest.fn(),
    };
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager,
    };
    invoiceService = {
      getPreInvoiceContract: jest.fn().mockReturnValue(null),
      cancel: jest.fn().mockResolvedValue(undefined),
      applyPayment: jest.fn().mockResolvedValue(InvoiceStatus.PAID),
    };
    contractsRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 'c-1' }),
    };
    service = new ContractService(
      contractsRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { find: jest.fn().mockResolvedValue([]) } as any,
      { createQueryRunner: () => queryRunner } as any,
      invoiceService as any,
    );
    // Persisted contract returned by the repository after commit is irrelevant here
    jest
      .spyOn(service as any, 'createContractClient')
      .mockResolvedValue(undefined);
  };

  const createDto = (overrides: Record<string, any> = {}): any => ({
    roomId: 'room-1',
    startDate: isoDay(-1),
    contractClient: [{ isLandlordClient: true }],
    getEntity: () => ({
      id: 'c-1',
      roomId: 'room-1',
      startDate: new Date(overrides.startDate ?? isoDay(-1)),
    }),
    ...overrides,
  });

  const setRoom = (status: RoomStatus) =>
    manager.findOne.mockImplementation(async (entity) =>
      entity === Rooms ? { id: 'room-1', status } : null,
    );

  beforeEach(buildService);

  describe('create', () => {
    it.each([RoomStatus.MAINTENANCE, RoomStatus.UNAVAILABLE])(
      'rejects a %s room',
      async (status) => {
        setRoom(status);
        await expect(service.create(createDto())).rejects.toBeInstanceOf(
          BadRequestException,
        );
        expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      },
    );

    it('rejects when the period overlaps a reserving contract', async () => {
      setRoom(RoomStatus.OCCUPIED);
      manager.find.mockResolvedValue([
        { startDate: new Date('2020-01-01'), endDate: null },
      ]);
      await expect(service.create(createDto())).rejects.toThrow(
        'Phòng đã có hợp đồng trong khoảng thời gian này',
      );
    });

    it('allows an OCCUPIED room when the new period starts after the current contract ends', async () => {
      setRoom(RoomStatus.OCCUPIED);
      manager.find.mockResolvedValue([
        { startDate: new Date('2020-01-01'), endDate: new Date(isoDay(30)) },
      ]);
      const dto = createDto({ startDate: isoDay(60) });
      await service.create(dto).catch(() => undefined);

      expect(manager.update).toHaveBeenCalledWith(
        'contracts',
        { id: 'c-1' },
        { status: ContractStatus.PENDING_START },
      );
      // Future start: room status is not touched
      expect(manager.update).not.toHaveBeenCalledWith(
        'rooms',
        expect.anything(),
        expect.anything(),
      );
    });

    it('no invoice + started -> ACTIVE and room OCCUPIED', async () => {
      setRoom(RoomStatus.AVAILABLE);
      await service.create(createDto()).catch(() => undefined);

      expect(manager.update).toHaveBeenCalledWith(
        'contracts',
        { id: 'c-1' },
        { status: ContractStatus.ACTIVE },
      );
      expect(manager.update).toHaveBeenCalledWith(
        'rooms',
        { id: 'room-1' },
        { status: RoomStatus.OCCUPIED },
      );
    });

    it('payment required + started -> WAITING_PAYMENT_INVOICE and room PENDING_DEPOSIT', async () => {
      setRoom(RoomStatus.AVAILABLE);
      invoiceService.getPreInvoiceContract.mockReturnValue({
        getEntity: () => ({ id: 'inv-1', invoiceItems: [] }),
      });
      await service.create(createDto()).catch(() => undefined);

      expect(manager.update).toHaveBeenCalledWith(
        'contracts',
        { id: 'c-1' },
        { status: ContractStatus.WAITING_PAYMENT_INVOICE },
      );
      expect(manager.update).toHaveBeenCalledWith(
        'rooms',
        { id: 'room-1' },
        { status: RoomStatus.PENDING_DEPOSIT },
      );
    });
  });

  describe('confirmPayment', () => {
    const waitingContract = (startDate: string) => ({
      id: 'c-1',
      roomId: 'room-1',
      propertyId: 'p-1',
      startDate: new Date(startDate),
      status: ContractStatus.WAITING_PAYMENT_INVOICE,
    });
    const invoice = {
      id: 'inv-1',
      propertyId: 'p-1',
      totalAmount: 5000000,
      paidAmount: 0,
      remainingAmount: 5000000,
      status: InvoiceStatus.DRAFT,
    };

    const mockLookups = (contract: any, inv: any = invoice) =>
      manager.findOne.mockImplementation(async (entity) => {
        if (entity === Contracts) return contract;
        if (entity === Invoice) return inv;
        return null;
      });

    beforeEach(() => {
      jest.spyOn(service, 'get').mockResolvedValue({ id: 'c-1' } as any);
    });

    it('rejects a contract that is not waiting for payment', async () => {
      mockLookups({
        ...waitingContract(isoDay(-1)),
        status: ContractStatus.ACTIVE,
      });
      await expect(service.confirmPayment('c-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('records the payment via InvoiceService and activates a started contract', async () => {
      mockLookups(waitingContract(isoDay(-1)), {
        ...invoice,
        status: InvoiceStatus.PENDING,
      });
      await service.confirmPayment('c-1', {
        paymentMethod: 'BANK',
        paidAmount: 5000000,
      });

      expect(invoiceService.applyPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'inv-1',
          paidAmount: 5000000,
          paymentMethod: 'BANK',
        }),
        manager,
      );
      expect(manager.update).toHaveBeenCalledWith(Contracts, 'c-1', {
        status: ContractStatus.ACTIVE,
      });
      expect(manager.update).toHaveBeenCalledWith(Rooms, 'room-1', {
        status: RoomStatus.OCCUPIED,
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('keeps the contract PENDING_START when the start date is in the future', async () => {
      mockLookups(waitingContract(isoDay(20)));
      await service.confirmPayment('c-1');

      expect(manager.update).toHaveBeenCalledWith(Contracts, 'c-1', {
        status: ContractStatus.PENDING_START,
      });
      expect(manager.update).not.toHaveBeenCalledWith(
        Rooms,
        expect.anything(),
        expect.anything(),
      );
    });

    it('keeps the contract waiting when the invoice is only partially paid', async () => {
      mockLookups(waitingContract(isoDay(-1)), {
        ...invoice,
        status: InvoiceStatus.PENDING,
      });
      invoiceService.applyPayment.mockResolvedValue(
        InvoiceStatus.PARTIALLY_PAID,
      );
      await service.confirmPayment('c-1', { paidAmount: 1000000 });

      expect(manager.update).not.toHaveBeenCalledWith(
        Contracts,
        expect.anything(),
        expect.anything(),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('publishes a draft pre-invoice before taking its payment', async () => {
      mockLookups(waitingContract(isoDay(-1)));
      await service.confirmPayment('c-1');
      expect(manager.update).toHaveBeenCalledWith(Invoice, 'inv-1', {
        status: InvoiceStatus.PENDING,
      });
      expect(invoiceService.applyPayment).toHaveBeenCalled();
    });

    it('refuses to activate when another ACTIVE contract exists in the room', async () => {
      mockLookups(waitingContract(isoDay(-1)));
      manager.count.mockResolvedValue(1);
      await expect(service.confirmPayment('c-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    });

    it('fails when there is no unpaid invoice', async () => {
      mockLookups(waitingContract(isoDay(-1)), null);
      await expect(service.confirmPayment('c-1')).rejects.toThrow(
        'Không tìm thấy hóa đơn cần thanh toán',
      );
    });
  });

  describe('cancelPreInvoice', () => {
    const waiting = (
      startDate: string,
      status = ContractStatus.WAITING_PAYMENT_INVOICE,
    ) => ({
      id: 'c-1',
      roomId: 'room-1',
      propertyId: 'p-1',
      startDate: new Date(startDate),
      status,
    });
    const draft = { id: 'inv-1', status: InvoiceStatus.DRAFT };

    const mockLookups = (contract: any, inv: any = draft) =>
      manager.findOne.mockImplementation(async (entity) => {
        if (entity === Contracts) return contract;
        if (entity === Invoice) return inv;
        return null;
      });

    beforeEach(() => {
      jest.spyOn(service, 'get').mockResolvedValue({ id: 'c-1' } as any);
    });

    it('rejects a blank reason before opening a transaction', async () => {
      await expect(
        service.cancelPreInvoice('c-1', { reason: '   ' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(queryRunner.startTransaction).not.toHaveBeenCalled();
    });

    it('rejects a contract that is not waiting for payment (duplicate submit)', async () => {
      mockLookups(waiting(isoDay(-1), ContractStatus.ACTIVE));
      await expect(
        service.cancelPreInvoice('c-1', { reason: 'Khách hủy' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(invoiceService.cancel).not.toHaveBeenCalled();
    });

    it('cancels the draft, activates the contract and logs INVOICE_CANCEL', async () => {
      mockLookups(waiting(isoDay(-1)));
      await service.cancelPreInvoice('c-1', { reason: ' Khách hủy ' });

      expect(invoiceService.cancel).toHaveBeenCalledWith(
        { id: 'inv-1', reason: 'Khách hủy' },
        manager,
      );
      expect(manager.update).toHaveBeenCalledWith(Contracts, 'c-1', {
        status: ContractStatus.ACTIVE,
      });
      expect(manager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          changeType: 'INVOICE_CANCEL',
          changeReason: 'Khách hủy',
          metadata: { contractId: 'c-1' },
        }),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('rolls back when no draft pre-invoice exists', async () => {
      mockLookups(waiting(isoDay(-1)), null);
      await expect(
        service.cancelPreInvoice('c-1', { reason: 'Khách hủy' }),
      ).rejects.toThrow('Không tìm thấy hóa đơn nháp để hủy');
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    });
  });
});
