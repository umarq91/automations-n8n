export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type MemberRole = 'owner' | 'admin' | 'member';
export type MemberStatus = 'active' | 'invited' | 'disabled';

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  created_at: string;
}

export interface OrganizationMemberWithUser extends OrganizationMember {
  user: User;
}

export interface OrganizationWithRole extends Organization {
  role: MemberRole;
}

export type IntegrationProvider = 'shopify' | 'reamaze';

export interface ShopifyCredentials {
  shop_domain: string;
  access_token: string;
}

export interface ReamazeCredentials {
  subdomain: string;
  email: string;
  api_key: string;
}

export type IntegrationCredentials = ShopifyCredentials | ReamazeCredentials;

export interface Integration {
  id: string;
  organization_id: string;
  provider: IntegrationProvider;
  category: string;
  auth_type: string;
  credentials: IntegrationCredentials;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

