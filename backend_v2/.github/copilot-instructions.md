---
globs: *.controller.ts,*.service.ts,*dto*.ts
---

# API Development Guidelines

## Controller Patterns

- Extend [BaseController](mdc:src/common/base/crud/base.controller.ts) for standard CRUD operations
- Use proper HTTP decorators (`@Get()`, `@Post()`, `@Put()`, `@Delete()`)
- Implement Swagger documentation with `@ApiTags()`, `@ApiOperation()`, etc.
- Use DTOs for request/response validation

## Naming Conventions

- **Classes**: PascalCase (e.g., `PropertyService`, `UserEntity`)
- **Interfaces**: PascalCase with `I` prefix for service interfaces (e.g., `IBaseService`)
- **Enums**: PascalCase (e.g., `PropertyRoomsStatus`, `RoomStatus`)
- **Files**: kebab-case with descriptive suffixes (e.g., `property.service.ts`, `user.entity.ts`)
- **DTOs**: PascalCase ending with `Dto` (e.g., `PropertyCreateDto`, `UserDetailDto`)

## Service Layer

- Business logic belongs in service classes
- Services should extend [BaseService](mdc:src/common/base/crud/base.service.ts)
- Implement proper error handling and validation
- Use transactions for complex operations
- Extend `BaseService` for standard CRUD operations
- Implement `IBaseService` interface
- Use dependency injection with `@Injectable()` decorator
- Inject repositories with `@InjectRepository()` decorator

## Entity Patterns

- Extend `BaseEntity` for common fields (id, createdAt, updatedAt)
- Use TypeORM decorators (`@Entity`, `@Column`, `@ManyToOne`, etc.)
- Define relationships clearly with proper cascade options

## DTO Patterns

- Create separate DTOs for different operations:
  - `[Feature]CreateDto` for creation
  - `[Feature]UpdateDto` for updates
  - `[Feature]DetailDto` for detailed responses
  - `[Feature]ListDto` for list responses
- Use class-validator decorators for validation
- Use class-transformer decorators for serialization

## DTO Validation

- Use class-validator decorators:
  - `@IsString()`, `@IsNumber()`, `@IsEmail()` for type validation
  - `@IsOptional()` for optional fields
  - `@IsNotEmpty()` for required fields
  - `@Transform()` for data transformation
- Create separate DTOs for different operations (Create, Update, Detail, List)

## Response Formatting

- Use [BaseResponse](mdc:src/common/reponse/base.response.ts) for consistent API responses
- Apply [TransformInterceptor](mdc:src/common/interceptors/transform.interceptor.ts) globally
- Handle errors with [HttpExceptionFilter](mdc:src/common/filter/http-exception.filter.ts)

## API Endpoints Structure

```typescript
@Controller('api/v1/resource')
@ApiTags('Resource')
export class ResourceController extends BaseController<...> {
  @Get()
  @ApiOperation({ summary: 'Get all resources' })
  async findAll(@Query() query: ResourceListDto) {
    return this.service.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create resource' })
  async create(@Body() dto: ResourceCreateDto) {
    return this.service.create(dto);
  }
}
```

### Module Structure

Each feature module follows this pattern:

```
modules/[feature]/
├── dto/                    # Data Transfer Objects
├── entities/              # TypeORM entities
├── repositories/          # Custom repository classes
├── [feature].controller.ts # REST API endpoints
├── [feature].service.ts   # Business logic
└── [feature].module.ts    # Module configuration
```

## Common Utilities

- **Enums**: [property.enum.ts](mdc:src/common/enums/property.enum.ts), [room.enum.ts](mdc:src/common/enums/room.enum.ts)
- **Decorators**: [allow-anonymous.decorator.ts](mdc:src/common/decorators/allow-anonymous.decorator.ts)
- **Interceptors**: [transform.interceptor.ts](mdc:src/common/interceptors/transform.interceptor.ts)
- **Utils**: [src/common/utils/](mdc:src/common/utils/) - Date, string, object utilities



## Error Handling

- Use NestJS built-in exceptions (`NotFoundException`, `BadRequestException`, etc.)
- Throw meaningful error messages
- Use try-catch blocks for database operations

## Request Context

- Use [RequestContextService](mdc:src/common/base/context/request-context.service.ts) for request-scoped data
- Apply [RequestContextInterceptor](mdc:src/common/interceptors/request-context.interceptor.ts) for context management
