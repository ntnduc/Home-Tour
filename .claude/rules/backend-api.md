---
paths:
  - "backend_v2/src/**/*.controller.ts"
  - "backend_v2/src/**/*.service.ts"
  - "backend_v2/src/**/*dto*.ts"
  - "backend_v2/src/**/*.entity.ts"
  - "backend_v2/src/**/*.repository.ts"
  - "backend_v2/src/**/*.module.ts"
---

# Backend CRUD layer (backend_v2/src/common/base)

Copy the shape of `src/modules/property/` (DTOs live in `dto/properties-dto/`) rather than writing from scratch.

## Controller — `common/base/crud/base.controller.ts`
- `extends BaseController<TService, TEntity, TDetailDto, TListDto, TCreateDto, TUpdateDto>`; it already exposes
  `POST /`, `GET /`, `GET /:id`, `PUT /` (id in body), `DELETE /:id`. Add only endpoints beyond CRUD.
- Class decorators: `@ApiTags`, `@ApiBearerAuth()`, `@Controller('api/<feature>')`, `@Roles(...)`, `@AutoCrudPermissions('<NODE>')`.
  Custom endpoints get `@ApiOperation({ summary })`.

## Service — `common/base/crud/base.service.ts` / `IService.ts`
- `extends BaseService<Entity, DetailDto, ListDto, CreateDto, UpdateDto> implements IBaseService<…>`; constructor passes the
  repository + the four DTO classes to `super`.
- Base provides create/getAll/get/update/delete, paging, `globalKey` ILIKE search on `entity.name`, filter and sort.
- Override `specQuery()` to join relations the DTOs need (avoid N+1), `applyFilter()` for custom filters, `beautifyResult()` to post-process.

## DTOs — `common/base/dto/` (the base classes call these methods; always implement them)
- `<Feature>CreateDto extends BaseCreateDto<E>` → `getEntity(): E`
- `<Feature>UpdateDto extends BaseUpdateDto<E>` (already has `id`) → `getEntity(entity: E): QueryDeepPartialEntity<E>`
- `<Feature>DetailDto extends BaseDetailDto<E>` / `<Feature>ListDto extends BaseListDto<E>` → `fromEntity(entity: E): void`
- List DTOs return only what the list UI needs (may derive counts from relations).
- Validate inputs with class-validator (`@IsString`, `@IsNumber`, `@IsOptional`, `@IsNotEmpty`, …) with Vietnamese `message`s;
  `@Transform` for coercion. Never trust request bodies.

## Entity — `common/base/Entity/base.entity.ts`
- `extends BaseEntity` → uuid `id`, `createdAt/updatedAt`, `createdBy/updatedBy` are auto-filled; never set them manually.
- Relations default `eager: false`; load explicitly in `specQuery()`. Set `cascade` deliberately.

## Repository — `common/base/repositories/base.repository.ts`
- `extends BaseRepository<E>`, `constructor(dataSource: DataSource) { super(E, dataSource) }`, `@Injectable()`.
- **Row-level scoping**: override `globalQuery(query)` to restrict rows to the current user/property, using
  `RequestContextService.getUserId()` (`common/base/context/request-context.service.ts`). See `PropertiesRepository`.

## Module
- `TypeOrmModule.forFeature([E])`, import `CurrentUserModule` + `RbacModule` when guards/permissions need them,
  provide service + repository, export what other modules use.
