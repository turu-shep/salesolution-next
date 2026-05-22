# Documentation Drift Report — 2026-04-02

## Summary
- Documents analyzed: 5
- Assertions checked: 15
- Confirmed (code matches): 10 (67%)
- Drifted (code disagrees): 4 (27%)
- Unverifiable: 1

## Drift Findings

### Document: docs/conventions/API.md

#### DRIFT-001: API route count
- Document says: "195 route files across 36 domains"
- Document location: API.md, line 10
- Code reality: 387 route files across ~40 domains (`find app/api -name "route.ts" | wc -l`)
- Severity: Medium
- Fix direction: Fix Doc
- Milestone impact: None (docs accuracy)
- Recommended action: Update API.md endpoint inventory. Add new domains (csrf, email, cron/*) to the inventory.

### Document: CLAUDE.md

#### DRIFT-002: Migration count
- Document says: "47+ migrations" in Database Rules
- Document location: CLAUDE.md, database rules section
- Code reality: 110+ migration files in `supabase/migrations/` (up to 110_fix_sop_access_rls_recursion.sql)
- Severity: Low
- Fix direction: Fix Doc
- Recommended action: Update CLAUDE.md to "110+ migrations" and update database.md rule about sequential numbering

#### DRIFT-003: Test file count
- Document says: "33 test files" in Stack Summary of prior analysis-params
- Document location: .agent/analysis-params.md (prior version)
- Code reality: 81 test files, 928 tests (746 passing, 52 failing)
- Severity: Low
- Fix direction: Already fixed in this session's analysis-params.md

### Document: docs/conventions/DATABASE.md

#### DRIFT-004: Migration highest number
- Document says: "Current highest: 047 (+ 999 utility)"
- Document location: .claude/rules/database.md, line 1
- Code reality: Current highest is 110 (not counting 999)
- Severity: Medium
- Fix direction: Fix Doc (.claude/rules/database.md)
- Recommended action: Update "Current highest: 047" to "Current highest: 110"

### Confirmed Assertions (no drift)
1. ✅ Server Components by default (CLAUDE.md) — verified in codebase
2. ✅ PascalCase components, camelCase utilities — consistent across new code
3. ✅ API response format `{ success, data, error }` — verified in reviewed routes
4. ✅ 3 Supabase clients (server/browser/admin) — all exist and used correctly
5. ✅ Booking availability uses `is_time_slot_available()` DB function
6. ✅ Auth verification on all API routes — verified on all analyzed routes
7. ✅ No `select('*')` in production code — zero instances found
8. ✅ Commit format `type(scope): description` — verified in git log
9. ✅ Feature gating via `useFeatureAccess()` — exists and fail-closed
10. ✅ Off-limits files respected — no unauthorized modifications detected
