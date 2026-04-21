export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export type Plan = (typeof PLANS)[keyof typeof PLANS];
