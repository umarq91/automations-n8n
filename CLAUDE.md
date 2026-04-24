# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm run dev        # Start dev server (Vite)
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript type-check (no emit)
npm run preview    # Preview production build
```

---

## Stack

React 18 + TypeScript + Vite + Tailwind CSS + Supabase + shadcn/ui

---

## File & Folder Structure

```
src/
├── components/          # Reusable UI components only (no business logic)
│   ├── ui/              # shadcn/ui components — never modify directly
│   ├── layout/          # Sidebar, Topbar, PageShell, etc.
│   └── shared/          # App-wide shared components (Avatar, Badge, EmptyState, etc.)
│
├── sections/            # Top-level page sections rendered by Dashboard.tsx
│   └── [SectionName]/
│       ├── index.tsx    # Section root — thin, composes sub-components
│       └── components/  # Sub-components private to this section only
│
├── lib/                 # All utility/helper functions (pure, no React)
│   ├── supabase/
│   │   ├── client.ts    # Singleton Supabase client
│   │   └── types.ts     # All shared TypeScript interfaces
│   ├── utils.ts         # General helpers (formatting, dates, strings, etc.)
│   ├── [domain]Validation.ts  # Zod schemas + FieldErrors types for each domain
│   └── [domain].ts      # Domain-specific helpers (e.g., permissions.ts)
│
├── models/              # All Supabase queries — class-based, grouped by domain
│   ├── UserModel.ts
│   ├── OrganizationModel.ts
│   └── MemberModel.ts
│
├── constants/           # All app-wide constants, each domain in its own file
│   ├── roles.ts
│   ├── plans.ts
│   ├── routes.ts
│   └── [domain].ts
│
├── hooks/               # Custom React hooks only
│   └── use[Name].ts
│
├── context/             # React context providers
│   └── AuthContext.tsx
│
├── types/               # Global TypeScript types and enums (non-Supabase)
│   └── index.ts
│
├── App.tsx
├── Dashboard.tsx        # Renders active section by activeSection state
└── main.tsx
```

### Rules

- **One component per file.** If a file exports more than one component, split it.
- **No barrel files** (`index.ts` re-exporting everything) inside `components/` — import directly.
- **Section sub-components** live in `sections/[Name]/components/` and are never imported outside that section.
- **Shared components** in `components/shared/` must have zero section-specific logic.
- **`lib/`** is for pure functions only — no hooks, no JSX, no Supabase calls.
- **Zod validation schemas** live in `src/lib/[domain]Validation.ts` — one file per domain (e.g. `productValidation.ts`). Export the schema and the `FieldErrors` type together. Never define schemas inline inside components or forms.
- **`models/`** is for all Supabase interactions — never call Supabase directly inside components or hooks.
- **`constants/`** holds every magic string, number, or enum used in more than one place. Never inline them.

---

## Routing

No router library. Navigation is pure state — `activeSection` in `App.tsx` controls which section renders. `Sidebar.tsx` exports the `ActiveSection` union type. To add a new section:

1. Create `src/sections/[SectionName]/index.tsx`
2. Add its `id` to `navItems` in `Sidebar.tsx` and the `ActiveSection` type
3. Render it in `Dashboard.tsx`

---

## Auth Flow

`AuthContext.tsx` wraps the entire app. On login it upserts the user profile to `public.users` (syncing from `auth.users`), then loads the user's organizations. All components access auth state via `useAuth()`. Active organization (`activeOrg`) is org-scoped state used throughout.

---

## Models (Supabase Query Layer)

All database queries live in `src/models/` as **static class methods**. Components and hooks never import from `src/lib/supabase/client.ts` directly.

```ts
// src/models/OrganizationModel.ts
import { supabase } from '@/lib/supabase/client'
import type { Organization } from '@/lib/supabase/types'

export class OrganizationModel {
  static async getById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  static async listByUser(userId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select('organizations(*)')
      .eq('user_id', userId)
    if (error) throw error
    return data.map((r) => r.organizations) as Organization[]
  }

  static async update(id: string, patch: Partial<Organization>): Promise<void> {
    const { error } = await supabase.from('organizations').update(patch).eq('id', id)
    if (error) throw error
  }
}
```

### Model Rules

- One file per domain (`UserModel`, `OrganizationModel`, `MemberModel`, etc.)
- All methods are `static async`
- Always throw on error — let the caller handle it
- Never transform or format data inside models — return raw DB shape
- Selects must be explicit — never use `select('*')` in production code once schema is stable

---

## Constants

Every constant used in more than one place goes in `src/constants/`.

```ts
// src/constants/roles.ts
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
```

```ts
// src/constants/plans.ts
export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const
```

Never inline role strings, plan names, or status values in components. Always import from `constants/`.

---

## Helpers (`src/lib/`)

Pure utility functions grouped by domain. No hooks, no JSX, no side effects.

```ts
// src/lib/utils.ts
export function formatDate(iso: string): string { ... }
export function truncate(str: string, max: number): string { ... }

// src/lib/permissions.ts
export function canManageMembers(role: Role): boolean { ... }
```

---

## Component Rules

- **One component per file.**
- Components receive data via props — they do not call models or Supabase directly.
- Data fetching belongs in hooks (`src/hooks/`), which call models.
- Keep components focused: if a component handles layout, it doesn't handle data. If it handles data display, it doesn't handle forms.
- Avoid optional props chains deeper than one level — refactor into separate components instead.
- No `useEffect` for derived state — compute inline or use `useMemo`.
- Prefer early returns over nested ternaries.

```tsx
// ✅ Good
if (isLoading) return <Spinner />
if (!data) return <EmptyState />
return <MemberList members={data} />

// ❌ Bad
return isLoading ? <Spinner /> : !data ? <EmptyState /> : <MemberList members={data} />
```

---

## Hooks (`src/hooks/`)

Custom hooks wrap model calls and expose clean loading/error/data state.

```ts
// src/hooks/useOrganization.ts
export function useOrganization(id: string) {
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    OrganizationModel.getById(id)
      .then(setOrg)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])

  return { org, loading, error }
}
```

---

## Design System

All UI must use `ds-*` Tailwind tokens — never raw hex values.

| Token | Value | Usage |
|---|---|---|
| `ds-bg` | `#0B0F14` | Page background |
| `ds-surface` | `#111823` | Cards (`.card` class) |
| `ds-surface2` | `#182230` | Nested surfaces, stat chips |
| `ds-hover` | `#202C3D` | Hover states |
| `ds-border` | `#263244` | Standard borders |
| `ds-borderSoft` | `#1B2533` | Subtle dividers |
| `ds-text` | `#E6EDF3` | Primary text |
| `ds-text2` | `#9AA4B2` | Secondary text |
| `ds-muted` | `#6B7686` | Labels, placeholders |
| `ds-accent` | `#4DA3FF` | Primary accent / links |
| `ds-accentHover` | `#6BB6FF` | Accent hover |
| `ds-accentGlow` | `#2B6FFF` | Accent active / glow |

**Utility classes** (defined in `index.css`):
- `.card` / `.card-elevated` — standard card surfaces with border + shadow
- `.btn-primary` / `.btn-secondary` / `.btn-ghost` — button variants
- `.input` / `.label` — form field styles
- `.badge` — inline pill chip
- `.gradient-indigo/emerald/amber/rose/violet` — icon blob gradients
- `.animate-fade-in` — entrance animation (use on section root)
- `.chip-up` / `.chip-warn` — stat delta chips (green / amber)

**Shadows:** `shadow-card`, `shadow-accent-glow`

**Semantic color conventions:**
- Emerald → active / success
- Amber → pending / warning
- Red → error
- Violet → enterprise plan
- `ds-accent` blue → pro plan, admin role, primary actions

---

## Code Quality Rules

- **Never use `any`** — no exceptions. Use `unknown` and narrow it, or define a proper type in `src/types/`. If you feel you need `any`, stop and model the type correctly instead.
- No unused imports — run `npm run lint` before committing
- No commented-out code — delete it
- No magic numbers or strings inline — use `constants/`
- No direct `console.log` in components — use a logger utility if needed
- Keep files under ~150 lines — if longer, split into smaller focused units
- Prefer `const` arrow functions for components: `const MyComponent = () => {}`



Additional Component Structure Rule
Avoid defining multiple components inside a single file.
If a component is not reused outside, do not extract it — keep the JSX inline instead of creating a separate component.
If a small component is used only once within the same file, prefer inlining it unless it significantly improves readability.
Only extract a component when:
It is reused, or
It meaningfully improves clarity and separation of concerns
// ❌ Avoid (unnecessary extraction)
const Parent = () => {
  return <Child />
}

const Child = () => {
  return <div>Content</div>
}

// ✅ Prefer (inline if used once)
const Parent = () => {
  return <div>Content</div>
}