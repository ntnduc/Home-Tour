# Home Tour — Copilot Instructions

Home Tour is a rental/boarding-house management platform. This is a two-project monorepo:

- [backend_v2/](../backend_v2) — NestJS + TypeORM + PostgreSQL REST API
- [mobile/](../mobile) — React Native (Expo) app that consumes the API

There is no root-level tooling; run all commands from inside the relevant project directory. The primary docs ([README.md](../README.md), most of the `*.md` files under `mobile/`) are written in Vietnamese.

## History Logging (bắt buộc với mọi agent)

Sau khi hoàn thành một yêu cầu, agent phải ghi lại thay đổi vào folder [history/](../history) (dùng chung cho cả Backend và Frontend).

- **Khi nào tạo:** chỉ tạo file history khi **đã code xong** VÀ **người dùng đã xác nhận/chấp nhận** kết quả. Không tạo khi mới lên kế hoạch hoặc code chưa được chấp nhận.
- **Tên file:** `YYYYMMDDHHmmss-<slug-title>.md` — `YYYYMMDDHHmmss` là ngày giờ local lúc tạo, `<slug-title>` là tiêu đề change request đã bỏ dấu tiếng Việt, viết thường, thay khoảng trắng/ký tự đặc biệt bằng `-` (vd: `20261003112738-cap-nhat-config-history.md`).
- **Nội dung:** bám theo mẫu [history/_TEMPLATE.md](../history/_TEMPLATE.md) (tiếng Việt). Phần nào không áp dụng thì ghi "Không có".
- **Phạm vi BE + FE:** nếu một yêu cầu đụng cả Backend và Frontend thì **mô tả chung trong MỘT file**, đánh dấu "Phạm vi: Cả hai" và liệt kê thay đổi từng bên.
- **Cập nhật trong cùng session:** nếu người dùng yêu cầu chỉnh sửa tiếp cho cùng change request trong cùng session, **cập nhật lại chính file history đã tạo** (thêm vào mục "Nhật ký cập nhật"), **không tạo file mới**.
- File `history/_TEMPLATE.md` và `history/README.md` không phải bản ghi thật; đừng ghi đè chúng. Quy ước đầy đủ xem [history/README.md](../history/README.md).

## backend_v2

### Commands (run from `backend_v2/`)

- `npm run start:dev` — dev server with watch (default port 3000; Swagger at `/api`)
- `npm run build` / `npm run start:prod` — production build/run
- `npm run lint` — ESLint with `--fix`; `npm run format` — Prettier
- `npm test` — Jest unit tests; `npm run test:e2e` — e2e tests
- Run a single test file: `npx jest src/modules/property/property.service.spec.ts`
- Run tests matching a name: `npx jest -t "should create property"`
- Migrations: `npm run migration:generate`, `npm run migration:run`, `npm run migration:revert` (config in [typeorm.config.ts](../backend_v2/typeorm.config.ts); copy `.env.example` to `.env` first)

### Architecture

Every feature lives under `src/modules/[feature]/` with this layout:

```
modules/[feature]/
├── dto/            # *.create.dto.ts, *.update.dto.ts, *.detail.dto.ts, *.list.dto.ts
├── entities/       # TypeORM entities (extend BaseEntity)
├── repositories/   # custom repositories (extend BaseRepository)
├── [feature].controller.ts
├── [feature].service.ts
└── [feature].module.ts
```

The generic CRUD stack in [src/common/base/crud/](../backend_v2/src/common/base/crud) is the backbone: controllers extend [BaseController](../backend_v2/src/common/base/crud/base.controller.ts) and services extend `BaseService`/implement `IBaseService`, both parameterized over `<Entity, DetailDto, ListDto, CreateDto, UpdateDto>`. `BaseController` already provides `create`/`getAll`/`get`/`update`/`delete`, so subclasses only add extra endpoints (see [property.controller.ts](../backend_v2/src/modules/property/property.controller.ts)). Note the base `update` takes the id from the DTO body (`@Put()` with no `:id` param), not the URL.

Cross-cutting behavior is wired globally in [main.ts](../backend_v2/src/main.ts): a global `ValidationPipe` (`whitelist: true`, `transform: true`), the `AllExceptionFilter`, and four stacked global guards. Responses are normalized by a transform interceptor into a `{ data, ... }` envelope — the mobile client reads `response.data.data`.

### Auth & RBAC (central concept)

Security is enforced by four global guards in order: `StickAuthGaurd` (JWT), `RolesGuard`, `PropertyAccessGuard`, `PermissionsGuard`. See [src/modules/rbac/](../backend_v2/src/modules/rbac) and its [README.md](../backend_v2/src/modules/rbac/README.md).

- Endpoints are protected by default; use `@AllowAnonymous()` to opt out.
- Restrict by role with `@Roles(Role.OWNER, ...)` (roles: Admin, Owner, Property Manager, Accountant, Tenant — see [role.enum.ts](../backend_v2/src/common/enums/role.enum.ts)).
- `@AutoCrudPermissions('PROPERTY')` maps CRUD methods to fine-grained permissions.
- Access is scoped **per property**, not just per role — permissions/roles are assigned relative to a property (`UserRole` links user↔role↔property).

### Conventions

- Files: kebab-case with suffixes (`*.service.ts`, `*.entity.ts`, `*.create.dto.ts`). Classes: PascalCase; service interfaces prefixed `I`; DTOs end in `Dto`.
- Import order: `@nestjs/*` → third-party → `src/*` (absolute, alias configured in tsconfig) → relative.
- Entities extend `BaseEntity` (uuid pk + timestamps); relations default `eager: false`, load explicitly. Set `cascade` deliberately.
- Prettier: single quotes, trailing commas. Note `noImplicitAny` is off in [tsconfig.json](../backend_v2/tsconfig.json) but `strictNullChecks` is on.
- More detail lives in [.cursor/rules/](../backend_v2/.cursor/rules) (`nestjs-architecture`, `database-patterns`, `api-development`, etc.) and [backend_v2/.github/copilot-instructions.md](../backend_v2/.github/copilot-instructions.md).

## mobile

### Commands (run from `mobile/`)

- `npm start` (or `expo start`), `npm run android`, `npm run ios`, `npm run web`
- `npm run clean` — wipe `node_modules`/`.expo` and restart with cache clear
- Builds go through EAS: `npm run build:android`, `build:ios`, `build:production`, `build:testflight` (config in [eas.json](../mobile/eas.json)). There is no test or lint script.

### Architecture

`src/` is organized by concern: `api/` (typed endpoint functions), `services/api/` (axios instances), `screens/` (grouped by feature), `navigation/`, `components/`, `types/`, `utils/`, `constant/`, `theme/`.

- **API layer**: all HTTP goes through the axios instances in [src/services/api/index.ts](../mobile/src/services/api/index.ts): `publicApi` (no auth), `privateApi` (injects bearer token + auto-refreshes on 401), and `filePrivateApi` (multipart uploads). Feature modules under `src/api/[feature]/*.api.ts` wrap these and return `ApiResponse<T>` (payload is under `.data`). `API_URL` is a hardcoded LAN IP in [src/config.ts](../mobile/src/config.ts) — update it to match your dev machine.
- **Server state**: TanStack React Query (`QueryClientProvider` in [App.tsx](../mobile/App.tsx)). Use `useQuery`/`useInfiniteQuery`/`useMutation` directly in screens with array query keys (e.g. `["properties", page, size, search]`); there is no shared hooks or store layer. Refetch on focus with `useFocusEffect` (see [PropertyListScreen.tsx](../mobile/src/screens/property/PropertyListScreen.tsx)).
- **Navigation**: a single native-stack in `App.tsx` plus [TabNavigator](../mobile/src/navigation/TabNavigator.tsx); route params are typed via `RootStackParamList` in [src/navigation/types.ts](../mobile/src/navigation/types.ts).
- **Forms**: `react-hook-form`.

### Conventions

- Import alias: `@/` → `src/` (configured in both [babel.config.js](../mobile/babel.config.js) module-resolver and [tsconfig.json](../mobile/tsconfig.json)). Prefer `@/...` imports.
- **Styling is NativeWind** (Tailwind classes via `className`), configured in [tailwind.config.js](../mobile/tailwind.config.js) with `global.css` imported in `App.tsx`.
- `tsconfig` `strict` is on — type props, API responses, and form data; avoid `any`.
- Screen files stay focused on layout/orchestration; put reusable logic in `src/components/`, `src/api/`, or `src/utils/`.
- Agent-oriented guidance for this project: [.cursor/agents/react-native-developer.md](../mobile/.cursor/agents/react-native-developer.md).
