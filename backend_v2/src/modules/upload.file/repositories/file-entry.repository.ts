import { Injectable } from '@nestjs/common';
import { getCurrentDate } from 'src/common/utils';
import { DataSource, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { BaseRepository } from '../../../common/base/repositories/base.repository';
import { FileEntry } from '../entities/file-entry.entity';

@Injectable()
export class FileEntryRepository extends BaseRepository<FileEntry> {
  constructor(dataSource: DataSource) {
    super(FileEntry, dataSource);
  }

  override globalQuery(
    query: SelectQueryBuilder<FileEntry>,
  ): SelectQueryBuilder<FileEntry> {
    return query.andWhere(`${query.alias}.isDeleted = false`);
  }

  override async softDelete(id: string): Promise<UpdateResult> {
    return this.update(id, { isDeleted: true, deletedAt: getCurrentDate() });
  }
}
