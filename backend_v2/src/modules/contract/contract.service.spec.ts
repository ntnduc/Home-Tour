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
  let invoiceService: { getPreInvoiceContract: jest.Mock };
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
    invoiceService = { getPreInvoiceContract: jest.fn().mockReturnValue(null) };
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

    it('marks the invoice PAID, records a payment and activates a started contract', async () => {
      mockLookups(waitingContract(isoDay(-1)));
      await service.confirmPayment('c-1', { paymentMethod: 'BANK' });

      expect(manager.save).toHaveBeenCalledWith(
        Payment,
        expect.objectContaining({
          invoiceId: 'inv-1',
          amount: 5000000,
          paymentMethod: 'BANK',
        }),
      );
      expect(manager.update).toHaveBeenCalledWith(Invoice, 'inv-1', {
        paidAmount: 5000000,
        remainingAmount: 0,
        status: InvoiceStatus.PAID,
      });
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
});
