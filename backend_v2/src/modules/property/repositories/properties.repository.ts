import { Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { RequestContextService } from '../../../common/base/context/request-context.service';
import { BaseRepository } from '../../../common/base/repositories/base.repository';
import { Properties } from '../entities/properties.entity';

@Injectable()
export class PropertiesRepository extends BaseRepository<Properties> {
  constructor(dataSource: DataSource) {
    super(Properties, dataSource);
  }

  override globalQuery(
    query: SelectQueryBuilder<Properties>,
  ): SelectQueryBuilder<Properties> {
    const currentUserId = RequestContextService.getUserId();
    // Owner or any member (user_roles) of the property
    query.andWhere(
      `(${query.alias}.ownerId = :currentUserId OR ${query.alias}.id IN (SELECT ur."propertyId" FROM user_roles ur WHERE ur."userId" = :currentUserId))`,
      { currentUserId },
    );

    return query;
  }
}
