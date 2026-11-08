import { ContractService } from './contract.service';

describe('ContractService.applyFilter - contract list', () => {
  let service: ContractService;
  let query: { andWhere: jest.Mock };

  beforeEach(() => {
    // applyFilter uses no dependencies, so skip the constructor
    service = Object.create(ContractService.prototype);
    query = { andWhere: jest.fn().mockReturnThis() };
  });

  const run = (filter: any) => service.applyFilter(query as any, filter);

  it('filters by roomId on the contract alias and strips it from filters', async () => {
    const filter: any = { filters: { roomId: 'r1' } };
    await run(filter);
    expect(query.andWhere).toHaveBeenCalledWith('contract.roomId = :roomId', {
      roomId: 'r1',
    });
    expect(filter.filters).toEqual({});
  });

  it('filters by status together with roomId', async () => {
    const filter: any = { filters: { roomId: 'r1', status: 'ACTIVE' } };
    await run(filter);
    expect(query.andWhere).toHaveBeenCalledTimes(2);
    expect(query.andWhere).toHaveBeenCalledWith('contract.status = :status', {
      status: 'ACTIVE',
    });
    expect(filter.filters).toEqual({});
  });

  it('leaves other filter keys untouched', async () => {
    const filter: any = { filters: { roomId: 'r1', foo: 'bar' } };
    await run(filter);
    expect(filter.filters).toEqual({ foo: 'bar' });
  });

  it('adds no conditions when filters are missing', async () => {
    const result = await run({});
    expect(query.andWhere).not.toHaveBeenCalled();
    expect(result.query).toBe(query);
  });
});
