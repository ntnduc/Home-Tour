<!--
  UI BLUEPRINT TEMPLATE — not a real blueprint (prefix "_").
  Pipeline artifact shared by the 3 stages, ONE file per feature:
    Stage A  UI Planner   → creates the file from this template (sections 0–10). No implementation code.
    Stage B  UI Coder     → implements it, then fills "Implementation notes" and sets Status.
    Stage C  UI Reviewer  → appends a "Round n" entry to "Review log" with the verdict.
  File name: .github/ui-blueprints/YYYYMMDD-<kebab-feature>.md  (e.g. 20261006-invoice-list.md)
  Agents exchange the PATH of this file instead of re-sending context → keeps every stage's context small.
  Allowed in a blueprint: ASCII wireframes, tables, TypeScript *type/interface/signature* contracts.
  Not allowed: JSX, StyleSheet objects, function bodies.
-->

# Blueprint — <Feature name>

| Field | Value |
| --- | --- |
| Status | `PLANNED` → `IMPLEMENTED` → `REVISION_NEEDED (round n)` → `APPROVED` |
| Request | <one-sentence summary of the user request> |
| Scope | Frontend / Backend / Both |
| Screen route | `<RouteName>` in `RootStackParamList` / `TabParamList` |
| Design system | [mobile-ui-design.instructions.md](../instructions/mobile-ui-design.instructions.md) |

## 1. Goal & UX narrative
<2–4 sentences: who uses this screen, the top question it answers, the reading order.>

## 2. Layout blueprint
```
┌───────────────────────────────┐
│ <ASCII wireframe, top → bottom>│
└───────────────────────────────┘
```

| # | Section | Card size | Shadow | Radius | Data source | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | Header | full | none | — | local | |
| S2 | Hero | full | hero | 28 | `summary` | |
| S3 | Bento | split 1.25 : 1 | medium/soft | 24 | `summary` | |

## 3. Component tree
```
screens/<feature>/<Feature>Screen.tsx            NEW   orchestrator (ScrollView + RefreshControl)
├── components/<Section>.tsx                     NEW   props: { … }
├── components/ui/PressableScale.tsx             MOVE  from screens/dashboard (promotion rule)
└── hooks/use<Feature>Data.ts                    NEW
```
Markers: `NEW` · `REUSE <path>` · `MOVE <from> → <to>` · `EDIT <path>`.

## 4. Data contracts
### 4.1 Types (`src/types/<feature>.ts`)
```ts
export interface <Feature>Summary { /* fields with units/ranges in comments */ }
```
### 4.2 Endpoints
| Method | Path | Query | Response `data` | Backend status |
| --- | --- | --- | --- | --- |
| GET | `/<feature>/summary` | `propertyId?` | `<Feature>Summary` | NEW / EXISTS |

### 4.3 Hook contract
```ts
export const use<Feature>Data: () => {
  summary: Section<<Feature>Summary>; // { data, isLoading, isFetching, isError, retry }
  isRefreshing: boolean;
  refresh: () => Promise<void>;
};
```
Query keys: `["<feature>", "<section>", filterKey]` · Parallelization: `useQueries` (client) + `Promise.all` (service).

## 5. States & micro-interactions
| Section | Loading | Fetching | Error | Empty | Touch (`scaleTo`) → action |
| --- | --- | --- | --- | --- | --- |
| S2 | skeleton shapes | dim 0.6 | `SectionError` | — | 0.985 → `InvoiceHistory` |

## 6. Navigation map
| Element | Route | Params |
| --- | --- | --- |

## 7. Implementation steps
1. <small, verifiable step> — files: `…`
2. …

## 8. Acceptance criteria (Reviewer checks every ID)
- **AC-1** <observable, testable criterion>
- **AC-2** …

## 9. Validation
- `cd mobile && npx tsc --noEmit` (no new errors in touched files)
- `cd mobile && npm run check:colors`
- `cd mobile && npx expo export --platform ios --output-dir /tmp/<feature>-export` (then delete it)
- Backend (if any): `cd backend_v2 && npx tsc --noEmit -p tsconfig.json` + module spec

## 10. Assumptions & open questions
- …

---

## Implementation notes
<!-- Filled by UI Coder. -->
- Files changed:
- Deviations from blueprint (with reason):
- Validation results:

## Review log
<!-- Appended by UI Reviewer, newest round last. -->
