# backend_v2 — NestJS API

NestJS 10 (Express) · TypeScript 5 (`strictNullChecks` on, `noImplicitAny` off) · TypeORM 0.3 + PostgreSQL ·
JWT (phone + OTP) · class-validator/transformer · Swagger at `/api` · Jest + supertest.

## Commands (run here)

- Dev: `npm run start:dev` (port 3000). Needs `.env` (copy `.env.example`) + running PostgreSQL.
- Type-check (fast, preferred): `npx tsc --noEmit -p tsconfig.json`
- Lint/format: `npm run lint` (ESLint **with --fix**, rewrites files) · `npx prettier --write <files>` (single quotes, trailing commas)
- Tests: `npm test` / `npm run test:e2e`. **Known issue:** `npx jest <file>` fails here (duplicate config in `jest.config.js`
  + `package.json`, and a `moduleNameMapping` typo). Run a single spec with an inline config:
  `npx jest --config '{"rootDir":"src","testRegex":".*\\.spec\\.ts$","transform":{"^.+\\.(t|j)s$":"ts-jest"},"testEnvironment":"node","moduleNameMapper":{"^src/(.*)$":"<rootDir>/$1"}}' <spec path>`
- Migrations (touch the DB — ask first): `npm run migration:generate` → review → `npm run migration:run` (`migration:revert` to undo).
  Config: `typeorm.config.ts`; files in `src/database/migrations/`. Never hand-edit the schema at runtime.

## Architecture

- One folder per feature in `src/modules/<feature>/`: `dto/`, `entities/`, `repositories/`, `<feature>.controller.ts`,
  `<feature>.service.ts`, `<feature>.module.ts` (register in `src/app.module.ts`). Reference module: `src/modules/property/`.
- Generic CRUD stack in `src/common/base/` is the backbone — reuse it, don't hand-write CRUD (details load from
  `.claude/rules/backend-api.md` when you open controllers/services/DTOs/entities/repositories).
- Global in `main.ts` / `app.module.ts` (don't re-add): `ValidationPipe({ whitelist, transform })`, `AllExceptionFilter`,
  `TransformInterceptor` (response envelope `{ code, success, message, data }`), `RequestContextInterceptor`.

## Auth & RBAC (every endpoint is protected by default)

Four global guards, in order: `StickAuthGaurd` (JWT) → `RolesGuard` → `PropertyAccessGuard` → `PermissionsGuard`
(see `src/modules/rbac/README.md` only when changing RBAC).

- `@Roles(Role.ADMIN, Role.OWNER, …)` — roles in `src/common/enums/role.enum.ts` (Admin, Owner, Property Manager, Accountant, Tenant).
- `@AutoCrudPermissions('<NODE>')` maps create→CREATE, get/getAll→VIEW, update→EDIT, delete→DELETE.
- `@AllowAnonymous()` opts out of auth — rare and intentional only.
- Access is scoped **per property** (`UserRole` = user ↔ role ↔ property), not just per role.

## Conventions

- Files kebab-case with suffix (`*.service.ts`, `*.entity.ts`, `*.create.dto.ts`); classes PascalCase; service interfaces `I…`; DTOs end in `Dto`.
- Imports: `@nestjs/*` → third-party → `src/*` (absolute alias) → relative.
- Business logic in services; controllers thin. Throw NestJS exceptions with **Vietnamese** messages (e.g. `'Không tìm thấy dữ liệu!'`).
- Before writing date/string/number/validation logic, reuse `src/common/utils/` (date handling is mandatory via `date.utils.ts`;
  money via `roundMoney` in `number.utils.ts`). New helper → add to the right utils file + `index.ts` + `utils/README.md`.
- Multi-entity writes use a `DataSource`/QueryRunner transaction. New/changed pure logic gets a `*.spec.ts`.

## Done when

`npx tsc --noEmit -p tsconfig.json` clean for touched files · touched spec green · correct `@Roles` + permission node ·
row-level scoping where data is owner/property-isolated · migration generated if the schema changed.
