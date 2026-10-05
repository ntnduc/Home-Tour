import { ForbiddenException } from '@nestjs/common';
import { RoomStatus } from 'src/common/enums/room.enum';
import {
  HomepageAlertDto,
  HomepageAlertSeverity,
  HomepageAlertType,
} from './dto/homepage-alert.dto';
import { HomepageRoomFeedItemDto } from './dto/homepage-room-feed.dto';
import { HomepageScopeService } from './homepage-scope.service';
import {
  buildRevenue,
  buildRoomStats,
  diffInDays,
  normalizeDate,
  sortAlerts,
  sortRoomFeed,
  toDateOnly,
} from './homepage.utils';

describe('homepage utils', () => {
  it('buildRoomStats tính tổng và tỷ lệ lấp đầy từ COUNT theo trạng thái', () => {
    const stats = buildRoomStats([
      { status: RoomStatus.OCCUPIED, count: '3' },
      { status: RoomStatus.AVAILABLE, count: '2' },
      { status: RoomStatus.MAINTENANCE, count: 1 },
    ]);
    expect(stats).toEqual({
      total: 6,
      occupied: 3,
      available: 2,
      maintenance: 1,
      pendingDeposit: 0,
      unavailable: 0,
      occupancyRate: 50,
    });
  });

  it('buildRoomStats trả về 0 khi không có phòng', () => {
    expect(buildRoomStats([]).occupancyRate).toBe(0);
  });

  it('buildRevenue ép decimal string, làm tròn và chặn tỷ lệ tối đa 100', () => {
    expect(
      buildRevenue({
        expected: '3000000.00',
        collected: '1000000',
        outstanding: '2000000',
      }),
    ).toEqual({
      expected: 3000000,
      collected: 1000000,
      outstanding: 2000000,
      collectionRate: 33.3,
    });
    expect(
      buildRevenue({ expected: '100', collected: '150' }).collectionRate,
    ).toBe(100);
    expect(buildRevenue().collectionRate).toBe(0);
  });

  it('sortRoomFeed ưu tiên quá hạn rồi số việc tồn', () => {
    const item = (
      roomName: string,
      overrides: Partial<HomepageRoomFeedItemDto> = {},
    ): HomepageRoomFeedItemDto => ({
      roomId: roomName,
      roomName,
      propertyId: 'p',
      propertyName: 'A',
      status: RoomStatus.OCCUPIED,
      rentAmount: 0,
      pendingTaskCount: 0,
      hasOverdueAlert: false,
      ...overrides,
    });
    const sorted = sortRoomFeed([
      item('101'),
      item('102', { pendingTaskCount: 2 }),
      item('103', { hasOverdueAlert: true }),
    ]);
    expect(sorted.map((r) => r.roomName)).toEqual(['103', '102', '101']);
  });

  it('sortAlerts theo mức độ rồi theo ngày', () => {
    const alert = (
      id: string,
      severity: HomepageAlertSeverity,
      date: string,
    ): HomepageAlertDto => ({
      id,
      type: HomepageAlertType.INVOICE_OVERDUE,
      severity,
      title: '',
      message: '',
      roomId: '',
      roomName: '',
      propertyName: '',
      date,
      target: {},
    });
    const sorted = sortAlerts([
      alert('info', HomepageAlertSeverity.INFO, '2026-01-01'),
      alert('warn-late', HomepageAlertSeverity.WARNING, '2026-02-10'),
      alert('crit', HomepageAlertSeverity.CRITICAL, '2026-03-01'),
      alert('warn-early', HomepageAlertSeverity.WARNING, '2026-02-01'),
    ]);
    expect(sorted.map((a) => a.id)).toEqual([
      'crit',
      'warn-early',
      'warn-late',
      'info',
    ]);
  });

  it('xử lý ngày dạng date-only', () => {
    const now = new Date(2026, 9, 5, 22, 0);
    expect(toDateOnly(now)).toBe('2026-10-05');
    expect(diffInDays(now, '2026-10-08')).toBe(3);
    expect(diffInDays(now, '2026-10-01')).toBe(-4);
    expect(normalizeDate('2026-10-05T00:00:00.000Z')).toBe('2026-10-05');
    expect(normalizeDate(undefined)).toBe('');
  });
});

describe('HomepageScopeService', () => {
  const build = (owned: string[], assigned: string[]) => {
    const propertiesRepository = {
      find: jest.fn().mockResolvedValue(owned.map((id) => ({ id }))),
    };
    const userRoleRepository = {
      find: jest
        .fn()
        .mockResolvedValue(assigned.map((propertyId) => ({ propertyId }))),
    };
    const currentUserService = { getCurrentUserId: () => 'user-1' };
    return new HomepageScopeService(
      propertiesRepository as any,
      userRoleRepository as any,
      currentUserService as any,
    );
  };

  it('hợp nhất tài sản sở hữu và tài sản được gán role (không trùng)', async () => {
    const scope = await build(['p1', 'p2'], ['p2', 'p3']).resolve();
    expect(scope.accessibleIds).toEqual(['p1', 'p2', 'p3']);
    expect(scope.targetIds).toEqual(['p1', 'p2', 'p3']);
  });

  it('lọc theo propertyId hợp lệ', async () => {
    const scope = await build(['p1'], ['p2']).resolve('p2');
    expect(scope.targetIds).toEqual(['p2']);
    expect(scope.accessibleIds).toEqual(['p1', 'p2']);
  });

  it('chặn propertyId ngoài phạm vi', async () => {
    await expect(build(['p1'], []).resolve('p9')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
