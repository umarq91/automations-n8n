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

export type MemberRole = 'owner' | 'admin' | 'member' | 'supplier';
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

export type ProductStatus = 'NOT_IMPORTED' | 'READY_TO_IMPORT' | 'ALREADY_IMPORTED' | 'IMPORTING';

export interface ProductCurrency {
  base_currency: string;
  converted_currency: string;
}

export interface Product {
  id: string;
  organization_id: string;
  title: string;
  status: ProductStatus;
  date: string | null;
  photo_url: string | null;
  colors: string[];
  sizes: string[];
  material: string | null;
  purchase_price: number | null;
  currency: ProductCurrency | string | null;
  discount: number | null;
  competitor_link: string | null;
  supplier_link: string | null;
  note: string | null;
  season: string | null;
  gender: string | null;
  shopify_product_url: string | null;
  shopify_admin_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifyProductImage {
  src: string;
  alt: string | null;
  position: number;
}

export interface ShopifyProductOption {
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyProductVariant {
  id: number;
  title: string;
  sku: string | null;
  price: number | null;
  compare_at_price: number | null;
  inventory_quantity: number | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
}

export interface ShopifyProduct {
  id: string;
  organization_id: string;
  shopify_product_id: number;
  title: string;
  handle: string | null;
  status: string | null;
  vendor: string | null;
  product_type: string | null;
  tags: string[];
  image_url: string | null;
  images: ShopifyProductImage[];
  options: ShopifyProductOption[];
  variants: ShopifyProductVariant[];
  sku: string | null;
  price: number | null;
  compare_at_price: number | null;
  price_min: number | null;
  price_max: number | null;
  total_inventory: number | null;
  currency: string | null;
  variants_count: number;
  admin_url: string | null;
  storefront_url: string | null;
  shopify_created_at: string | null;
  shopify_updated_at: string | null;
  published_at: string | null;
  body_html: string | null;
  description: string | null;
  synced_at: string;
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

