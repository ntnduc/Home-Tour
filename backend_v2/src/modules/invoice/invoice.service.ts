import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractStatus } from 'src/common/enums/contract.enum';
import {
  DATE_ALERT_THRESHOLD,
  DEBT_INVOICE_STATUSES,
  InvoiceItemType,
  InvoiceStatus,
} from 'src/common/enums/invoice.enum';
import { ServiceCalculationMethod } from 'src/common/enums/service.enum';
import {
  addDays,
  convertDateToString,
  diffDays,
  getCurrentDate,
  getDateWithoutTime,
  getDaysInMonth,
  getEndOfMonth,
} from 'src/common/utils';
import { roundMoney } from 'src/common/utils/number.utils';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { BaseService } from '../../common/base/crud/base.service';
import { IBaseService } from '../../common/base/crud/IService';
import { Contracts } from '../contract/entities/contracts.entity';
import { PaymentCreateDto } from '../payment/dto/payment-dto/payment.create.dto';
import { Payment } from '../payment/entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { InvoiceCreateDto } from './dto/invoice-dto/invoice.create.dto';
import { InvoiceDetailDto } from './dto/invoice-dto/invoice.detail.dto';
import { InvoiceListDto } from './dto/invoice-dto/invoice.list.dto';
import { InvoicePaymentDto } from './dto/invoice-dto/invoice.payment.dto';
import { InvoiceUpdateItemsDto } from './dto/invoice-dto/invoice.update-items.dto';
import { InvoiceUpdateDto } from './dto/invoice-dto/invoice.update.dto';
import { InvoiceItemCreateDto } from './dto/invoice-item-dto/invoice-item.create.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice.item.entity';
import { InvoiceItemRepository } from './repositories/invoice-item.repository';
import { calculateInvoicePayment } from './invoice-payment.util';
import { InvoiceRepository } from './repositories/invoice.repository';

@Injectable()
export class InvoiceService
  extends BaseService<
    Invoice,
    InvoiceDetailDto,
    InvoiceListDto,
    InvoiceCreateDto,
    InvoiceUpdateDto
  >
  implements
    IBaseService<
      Invoice,
      InvoiceDetailDto,
      InvoiceListDto,
      InvoiceCreateDto,
      InvoiceUpdateDto
    >
{
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly invoiceItemRepository: InvoiceItemRepository,
    @InjectRepository(Contracts)
    private readonly contractRepository: Repository<Contracts>,
    private readonly dataSource: DataSource,

    private readonly paymentService: PaymentService,
  ) {
    super(
      invoiceRepository,
      InvoiceDetailDto,
      InvoiceListDto,
      InvoiceCreateDto,
      InvoiceUpdateDto,
    );
  }

  async create(dto: InvoiceCreateDto): Promise<InvoiceDetailDto> {
    const entity = dto.getEntity();
    if (entity.totalAmount !== dto.totalAmount) {
      throw new BadRequestException('Tổng tiền hóa đơn không khớp');
    }
    entity.status = InvoiceStatus.PENDING;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findContract = await this.contractRepository.findOne({
        where: { id: dto.contractId, roomId: dto.roomId },
      });
      if (!findContract) {
        throw new NotFoundException('Hợp đồng không tồn tại');
      }

      if (findContract.status !== ContractStatus.ACTIVE) {
        throw new BadRequestException('Hợp đồng không hoạt động');
      }

      const findPreInvoice = await queryRunner.manager
        .createQueryBuilder(Invoice, 'invoice')
        .where('invoice.contractId = :contractId', {
          contractId: dto.contractId,
        })
        .andWhere('invoice.roomId = :roomId', { roomId: dto.roomId })
        .andWhere('invoice.status IN (:...statuses)', {
          statuses: [
            InvoiceStatus.PENDING,
            InvoiceStatus.OVERDUE,
            InvoiceStatus.PARTIALLY_PAID,
            InvoiceStatus.PAID,
          ],
        })
        .orderBy('invoice.createdAt', 'DESC')
        .getOne();

      // const findPreInvoice = await this.invoiceRepository.findOne({
      //   where: {
      //     contractId: dto.contractId,
      //     roomId: dto.roomId,
      //     status: {
      //       $in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE],
      //     }
      //   },
      //   order: {
      //     createdAt: 'DESC',
      //   },
      // });

      if (findPreInvoice && dto.isPassPreInvoice != true) {
        entity.preInvoiceId = findPreInvoice.id;

        // BR-011: nếu hợp đồng bật cộng dồn công nợ và hóa đơn trước còn nợ,
        // cộng phần còn nợ đó vào tổng tiền của hóa đơn mới.
        const preInvoiceRemaining = Number(findPreInvoice.remainingAmount);
        const preInvoiceHasDebt =
          DEBT_INVOICE_STATUSES.includes(findPreInvoice.status) &&
          preInvoiceRemaining > 0;

        // Balance the client explicitly carried forward when paying (isCarryOver)
        // is always added, regardless of the contract-level flag.
        const carriedOverAmount = Number(findPreInvoice.carriedOverAmount ?? 0);
        if (carriedOverAmount > 0) {
          entity.totalAmount = Number(entity.totalAmount) + carriedOverAmount;
          entity.remainingAmount =
            Number(entity.remainingAmount) + carriedOverAmount;

          const carriedItem = new InvoiceItem();
          carriedItem.amount = carriedOverAmount;
          carriedItem.type = InvoiceItemType.OTHER;
          carriedItem.propertyId = entity.propertyId;
          carriedItem.name = `Nợ hóa đơn: ${findPreInvoice.code}`;
          carriedItem.metadata = {
            reason: 'CARRY_OVER_DEBT',
            preInvoiceId: findPreInvoice.id,
          };
          entity.invoiceItems.push(carriedItem);
        } else if (findContract.carryDebtToNextInvoice && preInvoiceHasDebt) {
          entity.totalAmount = Number(entity.totalAmount) + preInvoiceRemaining;
          entity.remainingAmount =
            Number(entity.remainingAmount) + preInvoiceRemaining;

          const debtItem = new InvoiceItem();
          debtItem.amount = preInvoiceRemaining;
          debtItem.type = InvoiceItemType.OTHER;
          debtItem.propertyId = entity.propertyId;
          debtItem.name = `Nợ hóa đơn: ${findPreInvoice.code}`;
          debtItem.metadata = {
            reason: 'CARRY_OVER_DEBT',
            preInvoiceId: findPreInvoice.id,
          };
          entity.invoiceItems.push(debtItem);
        }
      }

      const createdEntity = this.invoiceRepository.create(entity);
      await queryRunner.manager.save(createdEntity);
      entity.invoiceItems.forEach((item) => {
        item.invoiceId = createdEntity.id;
        item.propertyId = createdEntity.propertyId;
      });

      const createdInvoiceItems = this.invoiceItemRepository.create(
        entity.invoiceItems,
      );
      await queryRunner.manager.save(createdInvoiceItems);
      createdEntity.invoiceItems = createdInvoiceItems;
      await queryRunner.commitTransaction();

      const detailDto = new InvoiceDetailDto();
      detailDto.fromEntity(createdEntity);
      return detailDto;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadGatewayException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async get(id: string): Promise<InvoiceDetailDto> {
    const entity = await this.invoiceRepository.findOne({
      where: {
        id: id,
      },
      relations: [
        'contract',
        'contract.contractClient',
        'room',
        'property',
        'invoiceItems',
      ],
    });

    if (!entity) {
      throw new NotFoundException('Không tìm thấy dữ liệu!');
    }
    const detailDto = new InvoiceDetailDto();
    detailDto.fromEntity(entity);
    return detailDto;
  }

  async update(dto: InvoiceUpdateDto): Promise<InvoiceDetailDto> {
    throw new NotFoundException('Method not implemented yet');
  }

  async paymentInvoice(dto: InvoicePaymentDto): Promise<InvoiceDetailDto> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: dto.id },
      relations: ['invoiceItems'],
    });
    if (!invoice) {
      throw new NotFoundException('Hóa đơn không tồn tại');
    }

    // Validate before opening a transaction: nothing is written on failure
    const invoiceDetailDto = new InvoiceDetailDto();
    invoiceDetailDto.fromEntity(invoice);

    const validateStatus = this.getValidInvoiceStatusPayment(invoiceDetailDto);
    if (!validateStatus.status) {
      throw new BadRequestException(validateStatus.error);
    }
    const validateAmount = this.getValidInvoiceAmountPayment(
      invoiceDetailDto,
      dto,
    );
    if (!validateAmount.status) {
      throw new BadRequestException(validateAmount.error);
    }

    // A partial payment is only accepted as "settled" when the client carries the balance over
    const result = calculateInvoicePayment(
      {
        paidAmount: invoiceDetailDto.paidAmount,
        remainingAmount: invoiceDetailDto.remainingAmount,
        dueDate: invoice.dueDate,
      },
      { amount: dto.paidAmount, isCarryOver: dto.isCarryOver },
      getCurrentDate(),
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(Invoice, invoice.id, {
        paidAmount: result.paidAmount,
        remainingAmount: result.remainingAmount,
        carriedOverAmount: result.carriedOverAmount,
        status: result.status,
      });

      const paymentCreateDto = new PaymentCreateDto();
      paymentCreateDto.amount = dto.paidAmount;
      paymentCreateDto.invoiceId = invoice.id;
      paymentCreateDto.propertyId = invoice.propertyId;
      paymentCreateDto.paymentMethod = dto.paymentMethod;
      paymentCreateDto.notes = dto.notes;
      await queryRunner.manager.save(Payment, paymentCreateDto.getEntity());

      // Close the previous invoice debt that was rolled into this one
      if (invoice.preInvoiceId) {
        const preInvoice = await queryRunner.manager.findOne(Invoice, {
          where: { id: invoice.preInvoiceId },
        });

        if (preInvoice && DEBT_INVOICE_STATUSES.includes(preInvoice.status)) {
          await queryRunner.manager.update(Invoice, preInvoice.id, {
            remainingAmount: 0,
            status: InvoiceStatus.PAID,
          });
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadGatewayException(error.message);
    } finally {
      await queryRunner.release();
    }

    return this.get(invoice.id);
  }

  async confirmInvoice(id: string): Promise<InvoiceDetailDto> {
    const invoice = await this.invoiceRepository.findOne({ where: { id: id } });
    if (!invoice) {
      throw new NotFoundException('Không tìm thấy hóa đơn');
    }
    // Already published: nothing to write
    if (invoice.status === InvoiceStatus.PENDING) {
      return this.get(invoice.id);
    }
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Chỉ hóa đơn ở trạng thái nháp mới có thể xác nhận',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(Invoice, invoice.id, {
        status: InvoiceStatus.PENDING,
      });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadGatewayException(error.message);
    } finally {
      await queryRunner.release();
    }

    return this.get(invoice.id);
  }

  async updateInvoiceItems(
    dto: InvoiceUpdateItemsDto,
  ): Promise<InvoiceDetailDto> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: dto.id },
      relations: ['invoiceItems'],
    });
    if (!invoice) {
      throw new NotFoundException('Không tìm thấy hóa đơn');
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(
        'Chỉ hóa đơn ở trạng thái nháp mới có thể cập nhật khoản mục',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const nonEditableInvoiceItemTypes: InvoiceItemType[] = [
        InvoiceItemType.DESPOSIT_CONTRACT,
      ];

      for (const itemDto of dto.invoiceItems) {
        const invoiceItem = invoice.invoiceItems.find(
          (item) =>
            item.id === itemDto.id &&
            nonEditableInvoiceItemTypes.includes(item.type),
        );
        if (!invoiceItem) {
          continue;
        }

        // this.validateInvoiceItemTypeEditable(invoiceItem);

        invoiceItem.amount = itemDto.amount;
        await queryRunner.manager.update(InvoiceItem, invoiceItem.id, {
          amount: itemDto.amount,
        });
      }

      const totalAmount = roundMoney(
        invoice.invoiceItems.reduce(
          (sum, item) => sum + Number(item.amount),
          0,
        ),
      );
      const remainingAmount = Math.max(
        0,
        roundMoney(totalAmount - Number(invoice.paidAmount ?? 0)),
      );

      await queryRunner.manager.update(Invoice, invoice.id, {
        totalAmount,
        remainingAmount,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadGatewayException(error.message);
    } finally {
      await queryRunner.release();
    }

    return this.get(invoice.id);
  }

  // TODO: Bổ sung danh sách/điều kiện các loại khoản mục (InvoiceItemType) không được phép
  // cập nhật giá khi có yêu cầu nghiệp vụ cụ thể (ví dụ: không cho sửa tiền cọc, nợ chuyển kỳ...).
  private validateInvoiceItemTypeEditable(invoiceItem: InvoiceItem): void {
    const nonEditableInvoiceItemTypes: InvoiceItemType[] = [
      InvoiceItemType.DESPOSIT_CONTRACT,
    ];

    if (nonEditableInvoiceItemTypes.includes(invoiceItem.type)) {
      throw new BadRequestException(
        `Khoản mục "${invoiceItem.name ?? invoiceItem.type}" không được phép cập nhật giá`,
      );
    }
  }

  getPreInvoiceContract(contract: Contracts): InvoiceCreateDto | null {
    if (contract.isPrepaidRoom && contract.depositAmountPaid == 0) {
      return null;
    }

    const invoiceCreateDto = new InvoiceCreateDto();
    invoiceCreateDto.contractId = contract.id;
    invoiceCreateDto.roomId = contract.roomId;
    invoiceCreateDto.propertyId = contract.propertyId;
    invoiceCreateDto.billingPeriodStart = convertDateToString(
      contract.startDate,
    );
    const endOfMonth = getEndOfMonth(contract.startDate);
    invoiceCreateDto.billingPeriodEnd = convertDateToString(endOfMonth);
    invoiceCreateDto.dueDate = convertDateToString(
      addDays(getCurrentDate(), 1),
    );
    invoiceCreateDto.contractId = contract.id;
    invoiceCreateDto.status = InvoiceStatus.DRAFT;
    const invoiceItemCreateDtos: InvoiceItemCreateDto[] = [];
    const breakDayAmount = this.calculateBreakDayRoom(
      contract,
      contract.startDate,
      endOfMonth,
    );
    if (contract.isPrepaidRoom) {
      const invoiceItemCreateDto = new InvoiceItemCreateDto();
      invoiceItemCreateDto.amount = breakDayAmount;
      invoiceItemCreateDto.type = InvoiceItemType.ROOM_RENT;
      invoiceItemCreateDto.name = `Tiền thuê`;
      invoiceItemCreateDto.propertyId = contract.propertyId;
      invoiceItemCreateDto.calculationMethod =
        ServiceCalculationMethod.FIXED_PER_ROOM;
      invoiceItemCreateDtos.push(invoiceItemCreateDto);
    }

    if (contract.depositAmountPaid > 0) {
      const invoiceItemCreateDto = new InvoiceItemCreateDto();
      invoiceItemCreateDto.amount = Number(contract.depositAmountPaid);
      invoiceItemCreateDto.type = InvoiceItemType.DESPOSIT_CONTRACT;
      invoiceItemCreateDto.name = `Tiền cọc`;
      invoiceItemCreateDto.propertyId = contract.propertyId;
      invoiceItemCreateDto.calculationMethod =
        ServiceCalculationMethod.FIXED_PER_ROOM;
      invoiceItemCreateDtos.push(invoiceItemCreateDto);
    }

    // Nothing to collect up front -> contract needs no payment confirmation
    if (invoiceItemCreateDtos.length === 0) {
      return null;
    }

    invoiceCreateDto.invoiceItems = invoiceItemCreateDtos;
    const totalAmount = invoiceItemCreateDtos.reduce(
      (sum, item) => Number(sum) + Number(item.amount),
      0,
    );
    invoiceCreateDto.totalAmount = roundMoney(totalAmount);

    return invoiceCreateDto;
  }

  async specQuery(): Promise<SelectQueryBuilder<Invoice>> {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.contract', 'contract')
      .leftJoinAndSelect('invoice.room', 'room')
      .leftJoinAndSelect('invoice.invoiceItems', 'invoiceItems')
      .leftJoinAndSelect('invoiceItems.contractService', 'contractService');

    return query;
  }

  //#region Support Functions

  private calculateBreakDayRoom(
    contract: Contracts,
    start: Date,
    end: Date,
  ): number {
    const roomRentAmount = contract.rentAmountAgreed;
    const isEndOfMonth = getEndOfMonth(start);
    if (start > end) {
      return 0;
    }

    if (end === isEndOfMonth) {
      return roomRentAmount;
    }

    const occupiedDays = diffDays(
      getDateWithoutTime(start),
      getDateWithoutTime(end),
    );
    const daysInMonth = getDaysInMonth(start);
    const dailyRentAmount = (roomRentAmount / daysInMonth) * occupiedDays;

    return dailyRentAmount < 0 ? 0 : roundMoney(dailyRentAmount);
  }

  private createInvoiceWithContractStartNow(
    contract: Contracts,
  ): InvoiceCreateDto {
    const invoiceCreateDto = new InvoiceCreateDto();
    invoiceCreateDto.contractId = contract.id;
    invoiceCreateDto.roomId = contract.roomId;
    const invoiceItemsCreateDto: InvoiceItemCreateDto[] = [];
    const invoiceItemDraf = new InvoiceItemCreateDto();
    invoiceItemDraf.amount = contract.rentAmountAgreed;
    invoiceItemDraf.type = InvoiceItemType.ROOM_RENT;
    invoiceItemDraf.propertyId = contract.propertyId;

    // const invoiceItems: InvoiceItemCreateDto[] = [];

    // Trường hợp hợp đồng có đặt cọc, tạo hóa đơn ngay lập tức với khoản tiền đặt cọc.
    if (contract.depositAmountPaid > 0) {
      const invoiceItem = invoiceItemDraf.deptClone();
      invoiceItem.amount = contract.depositAmountPaid;
      invoiceItem.type = InvoiceItemType.DESPOSIT_CONTRACT;
      invoiceItemsCreateDto.push(invoiceItem);
    }

    // Trường hợp hợp đồng trả trước, tạo hóa đơn ngay lập tức với khoản tiền thuê phòng.
    if (contract.isPrepaidRoom) {
      // Trường hợp hợp đồng bắt đầu từ ngày 1 của tháng, tạo hóa đơn ngay lập tức với khoản tiền thuê phòng.
      if (contract.startDate.getDate() === 1) {
        const invoiceItem = invoiceItemDraf.deptClone();
        invoiceItem.amount = contract.rentAmountAgreed;
        invoiceItem.type = InvoiceItemType.ROOM_RENT;
        invoiceItemsCreateDto.push(invoiceItem);
      }
    }

    return invoiceCreateDto;
  }

  private isDateAlertCreateInvoice(
    contract: Contracts,
    date?: Date,
  ): Date | null {
    if (contract.status === ContractStatus.ENDED) {
      return null;
    }

    const currentDate = getCurrentDate(true);
    const paymentDueDate = new Date(
      contract.paymentDueDay,
      currentDate.getMonth(),
      currentDate.getFullYear(),
    );
    const alertDate = addDays(paymentDueDate, DATE_ALERT_THRESHOLD * -1);

    return null;
  }

  private getValidInvoiceStatusPayment(invoice: InvoiceDetailDto): {
    error: string;
    status: boolean;
  } {
    if (invoice.status === InvoiceStatus.PAID) {
      return { error: 'Hóa đơn đã được thanh toán', status: false };
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      return { error: 'Hóa đơn đã bị hủy', status: false };
    }

    if (invoice.status === InvoiceStatus.DRAFT) {
      return { error: 'Hóa đơn chưa được phát hành', status: false };
    }

    return { error: '', status: true };
  }

  private getValidInvoiceAmountPayment(
    invoice: InvoiceDetailDto,
    payment: InvoicePaymentDto,
  ): {
    error: string;
    status: boolean;
  } {
    if (!(payment.paidAmount > 0)) {
      return { error: 'Số tiền thanh toán phải lớn hơn 0', status: false };
    }

    // if (payment.contractId !== invoice.contractId) {
    //   return { error: 'Mã hợp đồng không khớp với hóa đơn', status: false };
    // }

    if (payment.paidAmount > invoice.remainingAmount) {
      return {
        error: 'Số tiền thanh toán vượt quá số tiền cần thanh toán',
        status: false,
      };
    }

    return { error: '', status: true };
  }

  //#endregion
}
