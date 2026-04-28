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

export type ProductStatus = 'NOT_IMPORTED' | 'READY_TO_IMPORT' | 'ALREADY_IMPORTED' | 'IMPORTING' | 'IMPORTED' | 'NOT_OPTIMIZED' | 'OPTIMIZED';

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
  use_competitor_title: boolean;
  supplier_link: string | null;
  note: string | null;
  season: string | null;
  gender: string | null;
  stock_quantity: number | null;
  shopify_product_url: string | null;
  shopify_admin_url: string | null;
  to_optimize: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // shopify merge fields
  source?: 'manual' | 'shopify';
  shopify_id?: number | null;
  shopify_status?: string | null;
  optimized_at?: string | null;
  metadata?: ShopifyProductMeta | null;
}

export type CreditType = 'listing' | 'support' | 'optimization';

export interface OrganizationCredits {
  id: string;
  organization_id: string;
  listing_credits_total: number;
  listing_credits_used: number;
  support_credits_total: number;
  support_credits_used: number;
  optimization_credits_total: number;
  optimization_credits_used: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface CreditUsageLog {
  id: string;
  organization_id: string;
  credit_type: CreditType;
  amount: number;
  reference_id: string | null;
  note: string | null;
  product_id: string | null;
  product_admin_url: string | null;
  created_at: string;
}

export interface CreditUsageLogWithProduct extends CreditUsageLog {
  product: Pick<Product, 'id' | 'title' | 'shopify_admin_url' | 'shopify_product_url' | 'photo_url'> | null;
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

export interface ShopifyProductMeta {
  handle: string | null;
  vendor: string | null;
  product_type: string | null;
  tags: string[];
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
  body_html: string | null;
  description: string | null;
  published_at: string | null;
  shopify_created_at: string | null;
  shopify_updated_at: string | null;
  synced_at: string | null;
}

export interface WorkflowLog {
  id: string;
  organization_id: string | null;
  workflow_id: string | null;
  workflow_name: string | null;
  execution_id: string | null;
  execution_url: string | null;
  type: 'error' | 'success' | string | null;
  error_description: string | null;
  last_node_executed: string | null;
  message: string | null;
  product_id: string | null;
  product_title: string | null;
  product_link: string | null;
  created_at: string;
}

export interface AiConfig {
  id: string;
  organization_id: string;
  general_prompt: string | null;
  tone: string | null;
  rules: string[];
  vector_namespace: string | null;
  vector_id: string | null;
  bannable_words_vector_id: string | null;
  bannable_words_vector_namespace: string | null;
  seo_vector_id: string | null;
  seo_vector_namespace: string | null;
  created_at: string;
  updated_at: string;
}

