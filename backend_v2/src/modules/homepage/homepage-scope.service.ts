import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrentUserService } from '../current.user';
import { Properties } from '../property/entities/properties.entity';
import { UserRole } from '../rbac/entities/user-role.entity';

export type HomepageScope = {
  /** Mọi tài sản user được truy cập (dùng cho chip lọc). */
  accessibleIds: string[];
  /** Tài sản dùng để tính số liệu (đã áp dụng bộ lọc propertyId nếu có). */
  targetIds: string[];
};

/**
 * Xác định phạm vi dữ liệu trang chủ cho user hiện tại.
 * Quyền truy cập theo tài sản = tài sản user sở hữu (ownerId) ∪ tài sản được gán role (user_roles).
 */
@Injectable()
export class HomepageScopeService {
  constructor(
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async resolve(propertyId?: string): Promise<HomepageScope> {
    const userId = this.currentUserService.getCurrentUserId();

    const [owned, assigned] = await Promise.all([
      this.propertiesRepository.find({
        where: { ownerId: userId },
        select: { id: true },
      }),
      this.userRoleRepository.find({
        where: { userId },
        select: { propertyId: true },
      }),
    ]);

    const accessibleIds = Array.from(
      new Set([
        ...owned.map((p) => p.id),
        ...assigned.map((r) => r.propertyId),
      ]),
    );

    if (!propertyId) {
      return { accessibleIds, targetIds: accessibleIds };
    }

    if (!accessibleIds.includes(propertyId)) {
      throw new ForbiddenException('Bạn không có quyền truy cập tài sản này');
    }

    return { accessibleIds, targetIds: [propertyId] };
  }
}
