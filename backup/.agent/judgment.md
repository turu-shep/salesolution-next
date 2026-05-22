# Judgment — 2026-04-02 (V2.0)

## Quadruple Validation

### Finding: Auth callback unsigned cookie [ADV-001]
- Source: Level 3, `app/auth/callback/route.ts:19-27`, Persona: Adversary + User
- Check 1 (multi-level): PASS — visible at L0 (middleware fails), L1 (auth module), L3 (function)
- Check 2 (milestone): PASS — M0 (core loop requires auth)
- Check 3 (effort/impact): PASS — XS effort, blocks all users post-verification
- Check 4 (business impact): Revenue Blocking — users cannot access platform after signup
- Cross-persona: 2 personas (Adversary + User) → auto-P0
- **Verdict: P0**

### Finding: Stripe price IDs unverified [ADV-030]
- Source: Level 2, subscription_plans table, Persona: Adversary
- Check 1 (multi-level): PASS — visible at L1 (subscription) and L2 (checkout function)
- Check 2 (milestone): PASS — M0 (subscription purchase is revenue entry point)
- Check 3 (effort/impact): PASS — XS effort (DB seed), blocks all subscription purchases
- Check 4 (business impact): Revenue Blocking — $0 subscriptions if price IDs NULL
- Cross-persona: Single persona but revenue-critical
- **Verdict: P0**

### Finding: CSRF coverage gap [ADV-002]
- Source: Level 0, codebase-wide, Persona: Adversary
- Check 1 (multi-level): PASS — visible at L0 (infrastructure) and L1 (all modules)
- Check 2 (milestone): PASS — M0 (security requirement for launch)
- Check 3 (effort/impact): PASS — M effort but systemic fix available
- Check 4 (business impact): Operational Risk — CSRF attacks possible on state-changing ops
- Cross-persona: Single persona
- **Verdict: P1**

### Finding: Rate limit fail-open [ADV-003]
- Source: Level 2, `lib/rate-limit/index.ts:73-75`, Persona: Adversary
- Check 1 (multi-level): PASS — visible at L1 (infrastructure) and L2 (function)
- Check 2 (milestone): PASS — M0 (brute force prevention for launch)
- Check 3 (effort/impact): PASS — XS effort (2-line env-check change)
- Check 4 (business impact): Operational Risk — brute force/abuse possible without Redis
- Cross-persona: Single persona
- **Verdict: P1**

### Finding: Stale security headers tests [ARCH-002]
- Source: Level 1, test files, Persona: Architect
- Check 1 (multi-level): FAIL — single level (tests only)
- Check 2 (milestone): PASS — M0 (CI health)
- Check 3 (effort/impact): PASS — XS effort (change header name in tests)
- Check 4 (business impact): Operational Risk — 52 failing tests mask real issues
- Cross-persona: Single persona
- **Verdict: P1** (elevated from P2 because failing tests block CI confidence)

### Finding: Daily webhook timing-unsafe comparison [ADV-004]
- Source: Level 3, `app/api/webhooks/daily/route.ts:58`, Persona: Adversary
- Check 1 (multi-level): FAIL — single level
- Check 2 (milestone): PASS — M0 (webhook integrity)
- Check 3 (effort/impact): PASS — XS effort
- Check 4 (business impact): Operational Risk — timing attack on webhook possible
- Cross-persona: Single persona
- **Verdict: P2** (timing attacks are theoretical, signature is HMAC-SHA256)

### Finding: Trial 90 vs 45 days [ARCH-030]
- Source: Level 2, `app/api/subscription/trial/start/route.ts:36`, Persona: Architect
- Check 1 (multi-level): FAIL — single level
- Check 2 (milestone): PASS — M0 (business policy)
- Check 3 (effort/impact): PASS — XS effort
- Check 4 (business impact): Revenue Degrading — longer trial delays first payment
- Cross-persona: Single persona
- **Verdict: P1** (business policy, not code quality)

### Finding: Documentation drift [DRIFT-001/002/004]
- Source: Cross-cut, docs vs code, Persona: Architect
- Check 1 (multi-level): PASS — visible across docs
- Check 2 (milestone): FAIL — not milestone-blocking
- Check 3 (effort/impact): PASS — XS effort
- Check 4 (business impact): Technical Debt
- **Verdict: P2**

### Finding: Search page missing error.tsx
- Source: Level 0, `app/search/`, Persona: User
- Check 1 (multi-level): FAIL — single level
- Check 2 (milestone): PASS — M0 (UX quality)
- Check 3 (effort/impact): PASS — XS effort
- Check 4 (business impact): Milestone Degrading — uncaught search errors show ugly default
- **Verdict: P2**

### Finding: SOP failure invisible to user [USER-060]
- Source: Level 1, SOP module, Persona: User
- Check 1 (multi-level): PASS — visible at L1 and L2
- Check 2 (milestone): PASS — M2
- Check 3 (effort/impact): PASS — M effort
- Check 4 (business impact): Milestone Degrading for M2
- **Verdict: P2** (M2, not M0)

### Finding: Hardcoded Claude model [ARCH-060]
- Source: Level 2, `lib/sop/sop-generator.ts`, Persona: Architect
- Check 1 (multi-level): FAIL — single level
- Check 2 (milestone): FAIL — M2 (not blocking)
- Check 3 (effort/impact): PASS — XS effort
- Check 4 (business impact): Technical Debt
- **Verdict: P3**

### Finding: Email in URL param [USER-001]
- Source: Level 3, `app/auth/callback/route.ts:40`, Persona: User
- Check 1 (multi-level): FAIL — single level
- Check 2 (milestone): FAIL — not blocking
- Check 3 (effort/impact): PASS — XS effort
- Check 4 (business impact): No Business Impact
- **Verdict: P3**

## Task Dependency Graph

### Foundation (must be done first)
- P0-001 (auth callback cookie fix) → enables: all auth flows, user onboarding
- P0-002 (Stripe price IDs) → enables: subscription purchases

### Independent (any order after P0)
- P1-001 (CSRF rollout)
- P1-002 (rate limit env promotion)
- P1-003 (stale tests fix)
- P1-004 (trial duration 45d)

### Critical Path
1. P0-001 — fix auth callback cookie (30min) — unblocks all user flows
2. P0-002 — verify/populate Stripe price IDs (30min) — unblocks revenue
3. P1-003 — fix stale tests (30min) — unblocks CI confidence
4. P1-002 — promote Upstash to production env (15min)
5. P1-004 — change trial to 45 days (15min)
6. P1-001 — CSRF rollout to remaining routes (2-4h)
