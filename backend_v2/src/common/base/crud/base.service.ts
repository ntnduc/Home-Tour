import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getMetadataArgsStorage, SelectQueryBuilder } from 'typeorm';
import { isMethodOverridden } from '../../utils';
import { BaseCreateDto } from '../dto/create.dto';
import { BaseDetailDto } from '../dto/detail.dto';
import { BaseFilterDto } from '../dto/filter.dto';
import { BaseListDto } from '../dto/list.dto';
import { BaseUpdateDto } from '../dto/update.dto';
import { BaseEntity } from '../Entity/base.entity';
import { BaseRepository } from '../repositories/base.repository';
import { IBaseService } from './IService';
import { PaginateResult } from './search.crud';

@Injectable()
export class BaseService<
  TEntity extends BaseEntity,
  TDetailDto extends BaseDetailDto<TEntity>,
  TListDto extends BaseListDto<TEntity>,
  TCreateDto extends BaseCreateDto<TEntity>,
  TUpdateDto extends BaseUpdateDto<TEntity>,
> implements IBaseService<TEntity, TDetailDto, TListDto, TCreateDto, TUpdateDto>
{
  constructor(
    protected readonly genericRepository: BaseRepository<TEntity>,
    protected readonly detailDto: new () => TDetailDto,
    protected readonly listDto: new () => TListDto,
    protected readonly createDto: new () => TCreateDto,
    protected readonly updateDto: new () => TUpdateDto,
  ) {}

  protected getServiceName(): string {
    return this.constructor.name;
  }

  async specQuery(): Promise<SelectQueryBuilder<TEntity>> {
    const query = this.genericRepository.createQueryBuilder('entity');
    return query;
  }

  async beautifyResult(items: TEntity[]): Promise<TListDto[]> {
    return items.map((item) => {
      const listDto = new this.listDto();
      listDto.fromEntity(item);
      return listDto as TListDto;
    });
  }

  async applyFilter(
    query: SelectQueryBuilder<TEntity>,
    filter: BaseFilterDto<TEntity>,
  ) {
    const metadata = getMetadataArgsStorage().filterColumns(
      this.genericRepository.target as Function,
    );
    const entityColumns = metadata.map((column) => column.propertyName);

    if (filter && filter.filters) {
      const filterObj = filter.filters;
      Object.keys(filterObj).forEach((key) => {
        if (entityColumns.includes(key)) {
          query.andWhere(`entity.${key} = :${key}`, { [key]: filterObj[key] });
        }
      });
    }

    return { query, filter };
  }

  async getAll(
    filter: BaseFilterDto<TEntity>,
  ): Promise<PaginateResult<TListDto>> {
    try {
      const { globalKey, filters: filterDto, sort, limit, offset } = filter;
      let query = await this.specQuery();

      query.skip(offset);
      query.take(limit);

      const isApplyFilterOverridden = isMethodOverridden(
        this,
        'applyFilter',
        BaseService,
      );

      if (isApplyFilterOverridden) {
        ({ query, filter } = await this.applyFilter(query, filter));
      } else {
        ({ query, filter } = await this.applyFilter(query, filter));
      }
      if (globalKey) {
        query.andWhere('entity.name ILIKE :globalKey', {
          globalKey: `%${globalKey}%`,
        });
      }

      if (filterDto) {
        Object.keys(filterDto).forEach((key) => {
          query.andWhere(`entity.${key} = :${key}`, { [key]: filterDto[key] });
        });
      }

      if (sort) {
        Object.keys(sort).forEach((key) => {
          query.orderBy(`entity.${key}`, sort[key]);
        });
      }

      const [items, total] = await query.getManyAndCount();

      const listDto = await this.beautifyResult(items);
      return new PaginateResult(listDto, total, limit, offset);
    } catch (error) {
      console.error('Error getAll:', error);
      throw new BadRequestException('Lỗi khi lấy dữ liệu!');
    }
  }

  async get(id: string): Promise<TDetailDto> {
    const entity = await this.genericRepository.findOne({
      where: {
        id: id as any,
      },
    });

    if (!entity) {
      throw new NotFoundException('Không tìm thấy dữ liệu!');
    }
    const detailDto = new this.detailDto();
    detailDto.fromEntity(entity);
    return detailDto;
  }

  async update(dto: TUpdateDto): Promise<TDetailDto> {
    try {
      const entity = await this.genericRepository.findOne({
        where: {
          id: dto.id as any,
        },
      });
      if (!entity) {
        throw new NotFoundException('Không tìm thấy dữ liệu!');
      }
      const updatedEntity = dto.getEntity(entity);
      const newEntity = await this.genericRepository.update(
        entity.id,
        updatedEntity,
      );
      const result = new this.detailDto();
      result.fromEntity(newEntity.raw);
      return result;
    } catch (error) {
      console.error('Error update:', error);
      throw new BadRequestException('Lỗi khi cập nhật dữ liệu!');
    }
  }

  delete(id: string): Promise<void> {
    try {
      this.genericRepository.delete(id);
      return Promise.resolve();
    } catch (error) {
      console.error('Error delete:', error);
      throw new BadRequestException('Lỗi khi xóa dữ liệu!');
    }
  }

  async create(dto: TCreateDto): Promise<TDetailDto> {
    try {
      const entity = dto.getEntity();
      const createdEntity = await this.genericRepository.save(entity);
      const detailDto = new this.detailDto();
      detailDto.fromEntity(createdEntity);
      return detailDto;
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
}
