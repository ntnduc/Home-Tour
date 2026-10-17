# History — agent change log

Records changes the agent made at the user's request: what was asked, which side was touched
(Backend / Frontend), and the result. Backend (`backend_v2/`) and Frontend (`mobile/`) **share** this folder.

## When to create an entry

Only when **both** hold:

1. The agent has **finished the code** for the request.
2. The user has **confirmed / accepted** the result.

> Never create an entry while planning or before acceptance.

## File naming

```
YYYYMMDDHHmmss-<slug-title>.md
```

- `YYYYMMDDHHmmss`: local date-time at creation, e.g. `20261003112738` = 2026-10-03 11:27:38.
- `<slug-title>`: change-request title, ASCII only (strip diacritics), lowercase, spaces/special chars → `-`.

**Example:** "Update history config" at 2026-10-03 11:27:38 → `20261003112738-update-history-config.md`

## Updates in the same session

Follow-up changes to the same request in the **same session** → update that same file (append to "Update log"),
**don't create a new file**. A new session or a different request → new file.

## Requests touching Backend and Frontend

One file only, marked "Scope: Both (Backend + Frontend)", listing changes per side.

## Template

Use [`_TEMPLATE.md`](./_TEMPLATE.md). The `_` prefix means it is **not** a real entry. The user may edit it anytime;
the agent must read the current template and follow its structure. Entries are written in English.
Older entries may be in Vietnamese — leave them as-is.
