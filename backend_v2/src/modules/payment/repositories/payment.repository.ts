import { Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { RequestContextService } from '../../../common/base/context/request-context.service';
import { BaseRepository } from '../../../common/base/repositories/base.repository';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository extends BaseRepository<Payment> {
  constructor(dataSource: DataSource) {
    super(Payment, dataSource);
  }

  override globalQuery(
    query: SelectQueryBuilder<Payment>,
  ): SelectQueryBuilder<Payment> {
    const currentUserId = RequestContextService.getUserId();

    // Scope payments to properties owned by the current user
    query.leftJoinAndSelect(`${query.alias}.property`, 'property');
    query.andWhere('property.ownerId = :currentUserId', {
      currentUserId,
    });

    return query;
  }
}
