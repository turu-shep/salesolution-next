---
globs: ["components/subscription/**", "components/plan-configurator/**", "app/api/subscription/**", "app/api/billing/**", "app/api/hypercredits/**", "app/api/webhooks/stripe/**", "lib/subscription/**", "lib/stripe/**", "lib/hooks/useSubscription*", "lib/hooks/useFeatureAccess*", "lib/hooks/useBilling*", "app/settings/billing/**"]
---

Before modifying subscription or billing code, read `docs/modules/subscription-billing.md` for context on Stripe integration, tier gating, trials, and known gotchas.

After significant changes, update that module doc to reflect the new state.
