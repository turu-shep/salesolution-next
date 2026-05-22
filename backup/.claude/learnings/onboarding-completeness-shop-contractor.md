---
files: ["lib/hooks/useOnboardingCheck.ts", "app/onboarding/layout.tsx", "lib/auth/context.tsx", "app/api/cron/onboarding-nudge/route.ts"]
type: gotcha
added: 2026-05-07
---

## What happened
After FA-443 / FA-444 (mig 117), four call sites checked shop/contractor onboarding completeness by querying `professional_profiles` for a row with `role='shop'`/`role='contractor'` and required `extensions.shop_type` + `extensions.inventory_types[]` (or `extensions.services_offered[]` for contractor). Those extension keys are **never written** by any code path today — set-role only writes `extensions.shop_name` / `extensions.company_name`, and the unified onboarding endpoint `/api/onboarding/consultant` writes the consultant-shape fields (`bio`, `specialties`, `hourly_rate`) to a separate user_id-linked row with `organization_id IS NULL`. Result: shop and contractor users could never satisfy the completeness check, so `useOnboardingCheck` bounced them from the dashboard back to onboarding indefinitely. Combined with `handleFinish`'s `clearProgress()` before redirect, the form re-mounted with empty fields each iteration.

## Why
The U-5 work that wires role-specific extension fields into the onboarding flow has not shipped (see `docs/audit/post-unification-shop/PLAN.md` finding #3.2). The completeness checks were written ahead of U-5 against the eventual data shape, leaving production in a state where the check could never pass.

## What to do about it
Until U-5 lands, completeness for shop/contractor mirrors consultant: a `professional_profiles` row keyed on `user_id` with `organization_id IS NULL` that has `bio`, `specialties[]`, and `hourly_rate` filled. That's what walking the unified flow actually persists. When U-5 ships and onboarding starts writing role-specific extensions, tighten the check then — and update all four call sites in lockstep (search for `inventory_types` / `services_offered` to find them).
