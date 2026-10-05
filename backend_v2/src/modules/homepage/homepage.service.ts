import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractStatus } from 'src/common/enums/contract.enum';
import {
  DATE_ALERT_THRESHOLD,
  DEBT_INVOICE_STATUSES,
  InvoiceStatus,
} from 'src/common/enums/invoice.enum';
import { getCurrentDate } from 'src/common/utils';
import { In, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { ContractClient } from '../contract/entities/contract-client.entity';
import { Contracts } from '../contract/entities/contracts.entity';
import { Invoice } from '../invoice/entities/invoice.entity';
import { Properties } from '../property/entities/properties.entity';
import { RoomActionSignal } from '../property/entities/room-action-signal.view';
import { Rooms } from '../property/entities/rooms.entity';
import { RoomActionService } from '../property/room-action.service';
import {
  HomepageAlertDto,
  HomepageAlertListDto,
  HomepageAlertSeverity,
  HomepageAlertType,
} from './dto/homepage-alert.dto';
import { HomepageRoomFeedItemDto } from './dto/homepage-room-feed.dto';
import { HomepageSummaryDto } from './dto/homepage-summary.dto';
import { HomepageScopeService } from './homepage-scope.service';
import {
  addDaysTo,
  buildRevenue,
  buildRoomStats,
  CONTRACT_EXPIRING_DAYS,
  DEFAULT_ALERT_LIMIT,
  DEFAULT_FEED_LIMIT,
  diffInDays,
  getMonthRange,
  normalizeDate,
  sortAlerts,
  sortRoomFeed,
  toDateOnly,
  toNumber,
} from './homepage.utils';

/** Hóa đơn không tính vào doanh thu tháng. */
const EXCLUDED_REVENUE_STATUSES = [
  InvoiceStatus.DRAFT,
  InvoiceStatus.CANCELLED,
];

const PENDING_CONTRACT_STATUSES = [
  ContractStatus.PENDING_START,
  ContractStatus.WAITING_PAYMENT_INVOICE,
];

/**
 * Dữ liệu trang chủ được tách thành 3 phần độc lập để app gọi song song:
 *  - summary   : số liệu header + bento (nhẹ, chỉ COUNT/SUM)
 *  - room-feed : carousel trạng thái phòng (tái dùng RoomActionService)
 *  - alerts    : danh sách việc cần xử lý gấp
 * Trong từng phần, các truy vấn độc lập cũng chạy song song bằng Promise.all.
 */
@Injectable()
export class HomepageService {
  constructor(
    private readonly scopeService: HomepageScopeService,
    private readonly roomActionService: RoomActionService,
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
    @InjectRepository(RoomActionSignal)
    private readonly roomActionSignalRepository: Repository<RoomActionSignal>,
    @InjectRepository(Contracts)
    private readonly contractsRepository: Repository<Contracts>,
    @InjectRepository(ContractClient)
    private readonly contractClientRepository: Repository<ContractClient>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  //#region Summary
  async getSummary(propertyId?: string): Promise<HomepageSummaryDto> {
    const { accessibleIds, targetIds } =
      await this.scopeService.resolve(propertyId);
    const now = getCurrentDate();
    const period = { month: now.getMonth() + 1, year: now.getFullYear() };

    if (targetIds.length === 0) {
      return {
        properties: [],
        period,
        rooms: buildRoomStats([]),
        tenantsCount: 0,
        revenue: buildRevenue(),
        overdueInvoiceCount: 0,
        expiringContractCount: 0,
      };
    }

    const today = toDateOnly(now);
    const { start, nextStart } = getMonthRange(now);

    const [
      properties,
      roomRows,
      tenantsRaw,
      revenueRaw,
      overdueInvoiceCount,
      expiringContractCount,
    ] = await Promise.all([
      this.propertiesRepository.find({
        where: { id: In(accessibleIds) },
        select: { id: true, name: true },
        order: { name: 'ASC' },
      }),
      this.roomsRepository
        .createQueryBuilder('room')
        .select('room.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('room.propertyId IN (:...ids)', { ids: targetIds })
        .groupBy('room.status')
        .getRawMany<{ status: string; count: string }>(),
      this.contractClientRepository
        .createQueryBuilder('cc')
        .innerJoin('cc.contract', 'contract')
        .select('COUNT(DISTINCT cc.clientId)', 'count')
        .where('contract.propertyId IN (:...ids)', { ids: targetIds })
        .andWhere('contract.status = :active', {
          active: ContractStatus.ACTIVE,
        })
        .andWhere('cc.isActiveInContract = true')
        .getRawOne<{ count: string }>(),
      this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('COALESCE(SUM(invoice.totalAmount), 0)', 'expected')
        .addSelect('COALESCE(SUM(invoice.paidAmount), 0)', 'collected')
        .addSelect('COALESCE(SUM(invoice.remainingAmount), 0)', 'outstanding')
        .where('invoice.propertyId IN (:...ids)', { ids: targetIds })
        .andWhere('invoice.status NOT IN (:...excluded)', {
          excluded: EXCLUDED_REVENUE_STATUSES,
        })
        .andWhere('invoice.billingPeriodStart >= :start', {
          start: toDateOnly(start),
        })
        .andWhere('invoice.billingPeriodStart < :nextStart', {
          nextStart: toDateOnly(nextStart),
        })
        .getRawOne<{
          expected: string;
          collected: string;
          outstanding: string;
        }>(),
      this.buildOverdueInvoiceQuery(targetIds, today).getCount(),
      this.buildExpiringContractQuery(targetIds, now).getCount(),
    ]);

    return {
      properties: properties.map((p) => ({ id: p.id, name: p.name })),
      period,
      rooms: buildRoomStats(roomRows),
      tenantsCount: toNumber(tenantsRaw?.count),
      revenue: buildRevenue(revenueRaw),
      overdueInvoiceCount,
      expiringContractCount,
    };
  }
  //#endregion

  //#region Room feed
  async getRoomFeed(
    propertyId?: string,
    limit = DEFAULT_FEED_LIMIT,
  ): Promise<HomepageRoomFeedItemDto[]> {
    const { targetIds } = await this.scopeService.resolve(propertyId);
    if (targetIds.length === 0) return [];

    const [rooms, signals] = await Promise.all([
      this.roomsRepository
        .createQueryBuilder('room')
        .leftJoin('room.property', 'property')
        .addSelect(['property.id', 'property.name'])
        .leftJoinAndSelect(
          'room.contracts',
          'contract',
          'contract.status = :active',
          { active: ContractStatus.ACTIVE },
        )
        .leftJoinAndSelect(
          'contract.contractClient',
          'cc',
          'cc.isActiveInContract = true',
        )
        .where('room.propertyId IN (:...ids)', { ids: targetIds })
        .getMany(),
      this.roomActionSignalRepository
        .createQueryBuilder('signal')
        .innerJoin(Rooms, 'room', 'room.id = signal.roomId')
        .where('room.propertyId IN (:...ids)', { ids: targetIds })
        .getMany(),
    ]);

    const now = getCurrentDate();
    const signalMap = new Map(signals.map((s) => [s.roomId, s]));

    const items = rooms.map((room): HomepageRoomFeedItemDto => {
      const result = this.roomActionService.computeRoomActions(
        signalMap.get(room.id) ?? { roomId: room.id, roomStatus: room.status },
        now,
      );
      const top =
        result.actions.find((a) => a.urgent) ??
        result.actions.find((a) => a.primary);
      const clients = room.contracts?.[0]?.contractClient ?? [];
      const mainClient = clients.find((c) => c.isLandlordClient) ?? clients[0];

      return {
        roomId: room.id,
        roomName: room.name,
        propertyId: room.propertyId,
        propertyName: room.property?.name ?? '',
        status: room.status,
        rentAmount: toNumber(room.rentAmount),
        tenantName: mainClient?.name || undefined,
        topAction: top
          ? {
              type: top.type,
              label: top.label,
              severity: top.severity,
              payload: top.payload,
            }
          : undefined,
        pendingTaskCount: result.pendingTaskCount,
        hasOverdueAlert: result.hasOverdueAlert,
      };
    });

    return sortRoomFeed(items).slice(0, limit);
  }
  //#endregion

  //#region Alerts
  async getAlerts(
    propertyId?: string,
    limit = DEFAULT_ALERT_LIMIT,
  ): Promise<HomepageAlertListDto> {
    const { targetIds } = await this.scopeService.resolve(propertyId);
    if (targetIds.length === 0) return { items: [], total: 0 };

    const now = getCurrentDate();
    const today = toDateOnly(now);
    const dueSoonEnd = toDateOnly(addDaysTo(now, DATE_ALERT_THRESHOLD));

    const withRoom = <E extends ObjectLiteral>(
      qb: SelectQueryBuilder<E>,
      alias: string,
    ): SelectQueryBuilder<E> =>
      qb
        .leftJoin(`${alias}.room`, 'room')
        .leftJoin(`${alias}.property`, 'property')
        .addSelect(['room.id', 'room.name', 'property.id', 'property.name']);

    // Mỗi nhóm lấy tối đa `limit` bản ghi + tổng số; ghép lại rồi sắp xếp theo mức độ.
    const [
      [overdue, overdueTotal],
      [dueSoon, dueSoonTotal],
      [expiring, expiringTotal],
      [pending, pendingTotal],
    ] = await Promise.all([
      withRoom(this.buildOverdueInvoiceQuery(targetIds, today), 'invoice')
        .orderBy('invoice.dueDate', 'ASC')
        .take(limit)
        .getManyAndCount(),
      withRoom(
        this.invoiceRepository
          .createQueryBuilder('invoice')
          .where('invoice.propertyId IN (:...ids)', { ids: targetIds })
          .andWhere('invoice.status IN (:...debt)', {
            debt: DEBT_INVOICE_STATUSES,
          })
          .andWhere('invoice.dueDate BETWEEN :today AND :dueSoonEnd', {
            today,
            dueSoonEnd,
          }),
        'invoice',
      )
        .orderBy('invoice.dueDate', 'ASC')
        .take(limit)
        .getManyAndCount(),
      withRoom(this.buildExpiringContractQuery(targetIds, now), 'contract')
        .orderBy('contract.endDate', 'ASC')
        .take(limit)
        .getManyAndCount(),
      withRoom(
        this.contractsRepository
          .createQueryBuilder('contract')
          .where('contract.propertyId IN (:...ids)', { ids: targetIds })
          .andWhere('contract.status IN (:...pending)', {
            pending: PENDING_CONTRACT_STATUSES,
          }),
        'contract',
      )
        .orderBy('contract.startDate', 'ASC')
        .take(limit)
        .getManyAndCount(),
    ]);

    const items: HomepageAlertDto[] = [
      ...overdue.map((invoice) => {
        const days = Math.abs(diffInDays(now, invoice.dueDate));
        return this.invoiceAlert(
          invoice,
          HomepageAlertType.INVOICE_OVERDUE,
          HomepageAlertSeverity.CRITICAL,
          'Hóa đơn quá hạn',
          days > 0 ? `Quá hạn ${days} ngày` : 'Đến hạn hôm nay',
        );
      }),
      ...dueSoon.map((invoice) => {
        const days = diffInDays(now, invoice.dueDate);
        return this.invoiceAlert(
          invoice,
          HomepageAlertType.INVOICE_DUE_SOON,
          HomepageAlertSeverity.WARNING,
          'Hóa đơn sắp đến hạn',
          days === 0 ? 'Đến hạn hôm nay' : `Còn ${days} ngày`,
        );
      }),
      ...expiring.map((contract) => {
        const days = diffInDays(now, contract.endDate as Date);
        return this.contractAlert(
          contract,
          HomepageAlertType.CONTRACT_EXPIRING,
          HomepageAlertSeverity.WARNING,
          'Hợp đồng sắp hết hạn',
          days === 0 ? 'Hết hạn hôm nay' : `Còn ${days} ngày`,
          contract.endDate,
        );
      }),
      ...pending.map((contract) =>
        this.contractAlert(
          contract,
          HomepageAlertType.CONTRACT_PENDING,
          HomepageAlertSeverity.INFO,
          'Hợp đồng chờ xác nhận',
          contract.status === ContractStatus.WAITING_PAYMENT_INVOICE
            ? 'Chờ thanh toán hóa đơn đầu tiên'
            : 'Chờ bắt đầu hợp đồng',
          contract.startDate,
        ),
      ),
    ];

    return {
      items: sortAlerts(items).slice(0, limit),
      total: overdueTotal + dueSoonTotal + expiringTotal + pendingTotal,
    };
  }
  //#endregion

  //#region Helpers
  /** Quá hạn = trạng thái OVERDUE, hoặc còn nợ mà đã qua hạn thanh toán. */
  private buildOverdueInvoiceQuery(propertyIds: string[], today: string) {
    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.propertyId IN (:...ids)', { ids: propertyIds })
      .andWhere(
        '(invoice.status = :overdue OR (invoice.status IN (:...debt) AND invoice.dueDate < :today))',
        {
          overdue: InvoiceStatus.OVERDUE,
          debt: DEBT_INVOICE_STATUSES,
          today,
        },
      );
  }

  private buildExpiringContractQuery(propertyIds: string[], now: Date) {
    return this.contractsRepository
      .createQueryBuilder('contract')
      .where('contract.propertyId IN (:...ids)', { ids: propertyIds })
      .andWhere('contract.status = :active', { active: ContractStatus.ACTIVE })
      .andWhere('contract.endDate IS NOT NULL')
      .andWhere('contract.endDate BETWEEN :today AND :end', {
        today: toDateOnly(now),
        end: toDateOnly(addDaysTo(now, CONTRACT_EXPIRING_DAYS)),
      });
  }

  private invoiceAlert(
    invoice: Invoice,
    type: HomepageAlertType,
    severity: HomepageAlertSeverity,
    title: string,
    message: string,
  ): HomepageAlertDto {
    return {
      id: `${type}:${invoice.id}`,
      type,
      severity,
      title,
      message,
      roomId: invoice.roomId,
      roomName: invoice.room?.name ?? '',
      propertyName: invoice.property?.name ?? '',
      amount: toNumber(invoice.remainingAmount),
      date: normalizeDate(invoice.dueDate),
      target: { invoiceId: invoice.id },
    };
  }

  private contractAlert(
    contract: Contracts,
    type: HomepageAlertType,
    severity: HomepageAlertSeverity,
    title: string,
    message: string,
    date: Date | string | null | undefined,
  ): HomepageAlertDto {
    return {
      id: `${type}:${contract.id}`,
      type,
      severity,
      title,
      message,
      roomId: contract.roomId,
      roomName: contract.room?.name ?? '',
      propertyName: contract.property?.name ?? '',
      amount: toNumber(contract.rentAmountAgreed),
      date: normalizeDate(date),
      target: { contractId: contract.id },
    };
  }
  //#endregion
}
