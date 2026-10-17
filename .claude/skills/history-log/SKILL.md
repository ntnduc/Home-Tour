---
name: history-log
description: Create or update the shared history/ change-log entry (English) for a completed change. Use only after the code is done AND the user has accepted it, or when the user asks to "ghi history" / "write history".
argument-hint: "[change-request title]"
allowed-tools: Bash(date *)
---

# Write history (shared Backend + Frontend)

1. Preconditions: code finished **and** the user accepted it. Otherwise stop and say so.
2. If a history file for this same change request was already created in this session, **update it**: append a line to
   "Update log" and adjust the affected sections. Do not create a new file.
3. Otherwise create `history/YYYYMMDDHHmmss-<slug>.md`:
   - timestamp from `date +%Y%m%d%H%M%S` (local time);
   - slug = change-request title (`$ARGUMENTS` if given), ASCII only (strip diacritics), lowercase, non-alphanumerics → `-`
     (e.g. "Update history config" → `update-history-config`).
4. Read the **current** `history/_TEMPLATE.md` and follow its structure exactly (the user may change it). Write in English,
   concise; sections that don't apply say "None".
5. Request touching both sides → one file, "Scope: Both (Backend + Frontend)", list changes per side.
6. Never overwrite `history/_TEMPLATE.md` or `history/README.md`. Reply with the file path only.
