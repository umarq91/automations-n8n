export const PROVIDERS = {
  shopify: {
    label: 'Shopify',
    description: 'Connect your Shopify store to sync orders, products, and customers via OAuth.',
    logo: '/shopify.png',
    logoSize: 'w-11 h-11',
    gradient: 'gradient-emerald',
    category: 'ecommerce',
    auth_type: 'oauth2',
    comingSoon: false,
  },
  reamaze: {
    label: 'Reamaze',
    description: 'Connect Reamaze to manage customer support conversations.',
    logo: '/reamaze.png',
    logoSize: 'w-8 h-8',
    gradient: 'gradient-violet',
    category: 'support',
    auth_type: 'basic',
    comingSoon: false,
  },
  monday: {
    label: 'Monday.com',
    description: 'Sync tasks, boards, and project data with your Monday.com workspace.',
    logo: '/monday.png',
    logoSize: 'w-8 h-8',
    gradient: 'gradient-rose',
    category: 'project-management',
    auth_type: 'oauth2',
    comingSoon: true,
  },
} as const;

export type Provider = keyof typeof PROVIDERS;
