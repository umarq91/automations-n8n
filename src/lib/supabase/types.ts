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
  is_under_maintenance: boolean;
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
  client_id: string;
  client_secret: string;
  access_token?: string;
  scope?: string;
}

export interface ReamazeCredentials {
  subdomain: string;
  email: string;
  api_key: string;
}

export type IntegrationCredentials = ShopifyCredentials | ReamazeCredentials;

export interface DbEmailTemplate {
  id: string;
  organization_id: string | null;
  name: string;
  category: string;
  subject: string;
  description: string;
  html_body: string;
  variables: string[];
  tags: string[];
  is_default: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

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

export interface AiConfig {
  id: string;
  organization_id: string;
  general_prompt: string | null;
  tone: string | null;
  rules: string[];
  vector_namespace: string | null;
  vector_id: string | null;
  created_at: string;
  updated_at: string;
}

