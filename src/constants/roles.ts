export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  SUPPLIER: 'supplier',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
