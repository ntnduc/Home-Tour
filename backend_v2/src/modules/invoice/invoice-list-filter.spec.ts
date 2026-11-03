import { InvoiceStatus } from '../../common/enums/invoice.enum';
import { InvoiceService } from './invoice.service';

describe('InvoiceService.applyFilter - invoice list', () => {
  let service: InvoiceService;
  let query: { andWhere: jest.Mock; orderBy: jest.Mock; addOrderBy: jest.Mock };

  beforeEach(() => {
    service = new InvoiceService({} as any, {} as any, {} as any, {} as any, {} as any);
    query = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
    };
  });

  const run = (filter: any) => service.applyFilter(query as any, filter);

  it('applies contract/room equality filters and strips them from filters', async () => {
    const filter: any = { filters: { contractId: 'c1', roomId: 'r1' } };
    await run(filter);
    expect(query.andWhere).toHaveBeenCalledWith('entity.contractId = :contractId', {
      contractId: 'c1',
    });
    expect(query.andWhere).toHaveBeenCalledWith('entity.roomId = :roomId', {
      roomId: 'r1',
    });
    expect(filter.filters).toEqual({});
  });

  it('filters by multiple statuses and ignores unknown values', async () => {
    const filter: any = {
      filters: { statuses: [InvoiceStatus.PAID, 'BOGUS', InvoiceStatus.OVERDUE] },
    };
    await run(filter);
    expect(query.andWhere).toHaveBeenCalledWith(
      'entity.status IN (:...statusList)',
      { statusList: [InvoiceStatus.PAID, InvoiceStatus.OVERDUE] },
    );
    expect(filter.filters.statuses).toBeUndefined();
  });

  it('applies an inclusive created date range', async () => {
    await run({ filters: { createdFrom: '2026-01-01', createdTo: '2026-01-31' } });
    const sqls = query.andWhere.mock.calls.map((c) => c[0]);
    expect(sqls).toContain('entity.createdAt >= :createdFrom');
    expect(sqls).toContain('entity.createdAt < :createdToExclusive');
  });

  it('consumes globalKey so BaseService does not filter on entity.name', async () => {
    const filter: any = { globalKey: 'P101' };
    await run(filter);
    expect(query.andWhere.mock.calls[0][1]).toEqual({ globalKey: '%P101%' });
    expect(filter.globalKey).toBeUndefined();
  });

  it('defaults to createdAt DESC when no sort is given', async () => {
    await run({});
    expect(query.orderBy).toHaveBeenCalledWith('entity.createdAt', 'DESC');
  });

  it('keeps the caller sort when provided', async () => {
    await run({ sort: { dueDate: 'ASC' } });
    expect(query.orderBy).not.toHaveBeenCalled();
  });
});
