# mobile — React Native (Expo) app

React Native 0.86 · Expo SDK 57 · React 19 · TypeScript ~6 (`strict`) · React Navigation (native-stack, bottom-tabs, drawer) ·
TanStack Query v5 · react-hook-form · NativeWind · axios · Toast / bottom-sheet / keyboard-aware-scroll-view.

## Commands (run here)

- `npm start` (Expo) · `npm run ios` / `npm run android` / `npm run web`
- Type-check: `npx tsc --noEmit` — the repo has pre-existing errors; judge only the files you touched.
- `npm run check:colors` — fails on new hard-coded hex colors (`--update` rewrites the baseline; only when asked).
- No test or lint script. `npm run clean` deletes `node_modules` — don't run it unasked.
- EAS builds/submits (`npm run build:*`, `submit:*`) use the paid cloud — only when explicitly asked.

## Architecture (`src/`)

- **API**: all HTTP goes through `src/services/api/index.ts`: `publicApi` (no auth), `privateApi` (bearer + auto-refresh on 401),
  `filePrivateApi` (multipart `FormData`). Feature functions live in `src/api/<feature>/<feature>.api.ts` and return
  `ApiResponse<T>` (`src/types/api.ts`); never call axios from screens. Base URL = `API_URL + PREFIX_URL` in `src/config.ts`
  (`API_URL` is a hard-coded LAN IP). Normalize errors with `handleApiError` (`src/utils/apiUtil.ts`); tokens via `src/utils/storage.ts`.
- **Server state**: React Query directly in screens/hooks, array keys (e.g. `["properties", page, size, search]`),
  refetch on focus with `useFocusEffect`. Mutations: check `response.success`, Toast `response.message`, invalidate the list key;
  prefer `useMutation` for new code but stay consistent with the surrounding screen.
- **Navigation**: native-stack in `App.tsx` + `src/navigation/TabNavigator.tsx`; all routes typed in `src/navigation/types.ts`
  (`RootStackParamList`, `TabParamList`). Add new routes there; pass IDs, fetch details on the target screen.
- **Forms**: `react-hook-form` + `Controller` (`useFieldArray` for lists) inside `KeyboardAwareScrollView`; disable submit while pending.
- Feature layout: `src/api/<feature>/`, `src/types/<feature>.ts`, `src/screens/<feature>/` (+ `components/`, `hooks/`).

## Conventions

- Import alias `@/` → `src/` (babel + tsconfig); prefer it over deep relative paths.
- Strict types for props, route params, API responses, form values; no `any`, no `@ts-nocheck`.
- Screens orchestrate; reusable logic goes to `src/components/`, `src/api/`, `src/utils/` (`appUtil.ts`: `formatCurrency`, …).
- Reuse `src/components/` before building UI (Input, ComboBox, SelectList, DatePicker, Loading, ActionButtonBottom, CardContent,
  Uploadfile, AppSheet/GlobalAppSheet, Status, ProgressBar, PressableScale, SkeletonBlock, SectionError, SearchField, EmptyState, …).
- Styling: legacy screens use NativeWind `className` (or `useTheme()`+StyleSheet) — stay consistent with the file.
  **New screens, sections and redesigns** follow the Modern Minimalist design system (`.claude/rules/mobile-ui-design.md`,
  loads automatically when you open a `.tsx`). For a full new screen/redesign, suggest `/ui-pipeline`.
- Handle loading / empty / error states; safe-area and keyboard-safe; works on iOS and Android. UI copy in **Vietnamese**.
- File/camera flows: request permissions with fallback UI, validate type/size, upload via `filePrivateApi`.
