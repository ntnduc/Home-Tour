---
name: ui-planner
description: 'Stage A · UI/UX Architect & Planner — produce a Technical Design Blueprint for a Modern Minimalist screen (no implementation code).'
argument-hint: 'Screen to create or UI to refactor, e.g. "Invoice list screen with a monthly filter"'
agent: 'UI Planner'
model: 'Claude Opus 5 (copilot)'
---

# Stage A — UI/UX Architect & Planner

Act as the **UI Planner** defined in [ui-planner.agent.md](../agents/ui-planner.agent.md) for the request written after this command.

**Execution steps**
1. Read the request (new screen or refactor). If it is ambiguous, ask one focused question first.
2. Apply [copilot-instructions.md](../copilot-instructions.md) and the design system [mobile-ui-design.instructions.md](../instructions/mobile-ui-design.instructions.md); inspect only the workspace files needed for consistency (navigation types, related types/api, dashboard reference components).
3. Create `.github/ui-blueprints/YYYYMMDD-<feature>.md` from [_TEMPLATE.md](../ui-blueprints/_TEMPLATE.md) containing the **Technical Design Blueprint**:
   - asymmetric "Modern Minimalist" layout (ASCII wireframe + card groupings: full-width vs split ratios, shadow tier, radius);
   - component tree (parent/child, `NEW` / `REUSE` / `MOVE`);
   - custom hook + TypeScript interface contracts (parallel `useQueries` / `Promise.all` per section, query keys, endpoints);
   - micro-interactions & states (`activeOpacity={0.6}` + `scaleTo`, skeletons, error/empty, `RefreshControl`);
   - ordered implementation steps and numbered acceptance criteria `AC-n`.

**CRITICAL:** do **not** generate implementation code (no JSX, no StyleSheet, no function bodies). Planning only — reply with the short summary and the blueprint path.

Next: click **▶ Stage B · Implement with UI Coder**, or for minimum tokens open a new chat and run `/ui-coder <blueprint path>`.
