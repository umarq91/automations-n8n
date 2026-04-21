export const MEMBER_STATUS = {
  ACTIVE: 'active',
  INVITED: 'invited',
  DISABLED: 'disabled',
} as const;

export type MemberStatusValue = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS];
