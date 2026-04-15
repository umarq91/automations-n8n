# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite)
npm run build      # Production build
npm run lint       # ESLint
npm run typecheck  # TypeScript type-check (no emit)
npm run preview    # Preview production build
```

## Architecture

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase

**Routing:** No router library. Navigation is pure state — `activeSection` in `App.tsx` controls which section renders. `Sidebar.tsx` exports the `ActiveSection` union type; add new sections there and handle them in `Dashboard.tsx`.

**Auth flow:** `AuthContext.tsx` wraps the entire app. On login it upserts the user profile to `public.users` (syncing from `auth.users`), then loads the user's organizations. All components access auth state via `useAuth()`. The active organization (`activeOrg`) is org-scoped state used throughout.

**Supabase layer** (`src/lib/supabase/`):
- `client.ts` — singleton Supabase client
- `types.ts` — all shared TypeScript interfaces (`User`, `Organization`, `OrganizationWithRole`, `OrganizationMember`, etc.)
- `auth.ts`, `users.ts`, `organizations.ts`, `members.ts` — domain-specific DB helpers

**New sections:** Create a component in `src/components/`, add its `id` to the `navItems` array in `Sidebar.tsx` and the `ActiveSection` type, then render it in `Dashboard.tsx`.

## Design System

All UI must use the `ds-*` Tailwind tokens — never raw hex values.

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

**Shadows:** `shadow-card` (dark drop shadow), `shadow-accent-glow` (blue glow for accent elements).

**Semantic color conventions used across components:**
- Emerald (`emerald-400`, `emerald-500/10`) → active / success states
- Amber (`amber-400`, `amber-500/10`) → pending / warning states
- Red (`red-400`, `red-500/10`) → error states
- Violet (`violet-400`, `violet-500/10`) → enterprise plan
- `ds-accent` blue → pro plan, admin role, primary actions
