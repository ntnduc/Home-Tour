# Home Tour

Rental / boarding-house management platform. Two independent projects, no root tooling:

- `backend_v2/` — NestJS 10 + TypeORM + PostgreSQL REST API → see `backend_v2/CLAUDE.md`
- `mobile/` — React Native (Expo) app consuming that API → see `mobile/CLAUDE.md`
- `history/` — shared change log (BE + FE) · `.github/ui-blueprints/` — UI pipeline blueprints

Run every command from inside the relevant project directory (`cd backend_v2 && …`, `cd mobile && …`).
Docs (`README.md`, most `mobile/*.md`) and all user-facing text / error messages are **Vietnamese**.

## Working efficiently

- Read only the files the task needs; prefer Grep/Glob over opening whole files. Never browse `node_modules/`, `dist/`, `.expo/`, lockfiles, or `backend_v2/src/database/migrations/` unless the task is about them.
- Mirror an existing implementation instead of inventing patterns (backend: `src/modules/property/`; mobile UI: `src/screens/dashboard/`).
- Validate with the narrowest command that proves the change (a single Jest spec, `tsc` filtered to touched files), not full builds.
- Keep replies short: what changed, validation results, open issues. Don't paste whole files back.

## Cross-project changes (backend ↔ mobile)

When a task touches the API contract, read both sides before editing:
backend DTOs/controller in `backend_v2/src/modules/<feature>/` ↔ `mobile/src/api/<feature>/*.api.ts` + `mobile/src/types/<feature>.ts`.

- Every response is wrapped by the global transform interceptor into `{ success, data, message, … }`; mobile API functions return that envelope (`ApiResponse<T>`), screens read `.data`.
- The generic `PUT /` update takes the `id` from the **body**, not the URL.
- Paginated lists: `BasePagingRequest` → `BasePagingResponse<T>` (`items`, `total`, …).
- Change backend first, then the mobile types/API function, then screens. Keep field names identical on both sides.

## History log (mandatory, shared BE + FE)

Only **after the code is done AND the user has accepted it**, record the change in `history/` using the `history-log` skill
(rules: `history/README.md`, template: `history/_TEMPLATE.md`). Never create it while planning or before acceptance;
a request touching both sides gets ONE file; follow-ups in the same session update that same file.
