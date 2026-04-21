export const CREDIT_TYPES = {
  LISTING: 'listing',
  SUPPORT: 'support',
  OPTIMIZATION: 'optimization',
} as const;

export const PLAN_CREDIT_DEFAULTS = {
  free: {
    listing_credits_total: 10,
    support_credits_total: 5,
    optimization_credits_total: 3,
  },
  pro: {
    listing_credits_total: 100,
    support_credits_total: 50,
    optimization_credits_total: 30,
  },
  enterprise: {
    listing_credits_total: 1000,
    support_credits_total: 500,
    optimization_credits_total: 300,
  },
} as const;
