import type { ActiveSection } from '../components/layout/Sidebar';
import type { MemberRole } from './supabase/types';

// ─── Permission table ────────────────────────────────────────────────────────
// Add a section here to grant access. Removing it denies access everywhere.

const ROLE_SECTIONS: Record<MemberRole, ActiveSection[]> = {
  owner: [
    'overview',
    'organization',
    'email',
    'ai-config',
    'integrations',
    'products-list',
    'products-add-item',
    'products-edit-item',
    'members-add',
    'credits',
    'logs',
  ],
  admin: [
    'overview',
    'organization',
    'email',
    'ai-config',
    'integrations',
    'products-list',
    'products-add-item',
    'products-edit-item',
    'members-add',
    'credits',
    'logs',
  ],
  member: [
    'overview',
    'organization',
    'email',
    'ai-config',
    'integrations',
    'products-list',
    'products-add-item',
    'products-edit-item',
    'logs',
  ],
  supplier: [
    'products-list',
    'products-edit-item',
  ],
};

// Where each role lands on first load or after an access violation
const DEFAULT_SECTION: Record<MemberRole, ActiveSection> = {
  owner:    'organization',
  admin:    'organization',
  member:   'organization',
  supplier: 'products-list',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function canAccess(role: MemberRole | undefined, section: ActiveSection): boolean {
  if (!role) return false;
  return ROLE_SECTIONS[role]?.includes(section) ?? false;
}

export function getDefaultSection(role: MemberRole | undefined): ActiveSection {
  if (!role) return 'organization';
  return DEFAULT_SECTION[role] ?? 'organization';
}

export function getAllowedSections(role: MemberRole | undefined): ActiveSection[] {
  if (!role) return [];
  return ROLE_SECTIONS[role] ?? [];
}
