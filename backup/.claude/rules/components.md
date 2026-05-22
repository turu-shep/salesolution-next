---
globs: components/**/*.tsx
---

# Component Rules

1. **Server Components by default.** Only add `'use client'` when the component needs:
   - useState, useEffect, or other React hooks
   - Event handlers (onClick, onChange, etc.)
   - Browser APIs or Redux state (`useAppSelector`, `useAppDispatch`)

2. **Props interface** defined above the component, named after it:
```typescript
interface BookingCardProps {
  bookingId: string
  status: string
  onCancel?: () => void
}
```

3. **Use `cn()` from `@/lib/utils`** for conditional classes — never string concatenation:
```typescript
className={cn(
  'p-4 border-2 rounded-lg transition-all',
  isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
)}
```

4. **Check `/components/ui/` first** before creating new base UI elements. Existing primitives use CVA variants + forwardRef — extend via `variant` prop, not custom components.

5. **Feature components go in `/components/{feature}/`** — never in `/components/ui/`. Flat file structure with optional `index.ts` barrel export.

6. **Loading states** — use `Loader2` spinner from lucide-react:
```typescript
import { Loader2 } from 'lucide-react'

if (loading) {
  return (
    <Card>
      <CardContent className="py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
      </CardContent>
    </Card>
  )
}
```

7. **Error states** — inline red error blocks:
```typescript
if (error) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-800">{error}</p>
    </div>
  )
}
```

8. **Subscription gating** — check feature access before rendering tier-locked UI:
```typescript
const { hasAccess } = useFeatureAccess('feature_name')
if (!hasAccess) return <UpgradePrompt />
```
