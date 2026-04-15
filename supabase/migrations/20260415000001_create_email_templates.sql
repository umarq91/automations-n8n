-- ─────────────────────────────────────────────────────────────────────────────
-- email_templates
--   organization_id IS NULL  → global pre-made defaults (read-only from client)
--   organization_id = <id>   → org-custom templates (CRUD by org admin/owner)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.email_templates (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid references public.organizations(id) on delete cascade,
  name             text          not null,
  category         text          not null,
  subject          text          not null,
  description      text          not null default '',
  html_body        text          not null,
  variables        text[]        not null default '{}',
  tags             text[]        not null default '{}',
  is_default       boolean       not null default false,
  created_by       uuid          references auth.users(id) on delete set null,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);

comment on column public.email_templates.organization_id is
  'NULL = global default visible to all orgs; non-null = org-scoped custom template.';

comment on column public.email_templates.html_body is
  'Full HTML email body. n8n reads this field along with subject and category.';

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists email_templates_org_idx
  on public.email_templates(organization_id);

create index if not exists email_templates_category_idx
  on public.email_templates(category);

-- ── Row-level security ────────────────────────────────────────────────────────

alter table public.email_templates enable row level security;

-- Any authenticated user can read global defaults (organization_id IS NULL)
create policy "read global defaults"
  on public.email_templates for select
  to authenticated
  using (organization_id is null);

-- Org members can read their org's custom templates
create policy "read org templates"
  on public.email_templates for select
  to authenticated
  using (
    organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = email_templates.organization_id
        and om.user_id = auth.uid()
        and om.status = 'active'
    )
  );

-- Only org admin/owner can create custom templates
create policy "insert org templates"
  on public.email_templates for insert
  to authenticated
  with check (
    organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = email_templates.organization_id
        and om.user_id = auth.uid()
        and om.status = 'active'
        and om.role in ('owner', 'admin')
    )
  );

-- Only org admin/owner can update their org's custom templates
create policy "update org templates"
  on public.email_templates for update
  to authenticated
  using (
    organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = email_templates.organization_id
        and om.user_id = auth.uid()
        and om.status = 'active'
        and om.role in ('owner', 'admin')
    )
  );

-- Only org admin/owner can delete their org's custom templates
create policy "delete org templates"
  on public.email_templates for delete
  to authenticated
  using (
    organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = email_templates.organization_id
        and om.user_id = auth.uid()
        and om.status = 'active'
        and om.role in ('owner', 'admin')
    )
  );

-- ── Auto-update updated_at ────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger email_templates_updated_at
  before update on public.email_templates
  for each row execute function public.set_updated_at();

-- ── Seed global default templates ────────────────────────────────────────────
-- These are the pre-made templates n8n can query.
-- organization_id = NULL  →  visible to every org, never editable from client.

insert into public.email_templates
  (organization_id, name, category, subject, description, html_body, variables, tags, is_default)
values

-- 1. Order Confirmation
(null, 'Order Confirmation', 'Transactional',
 'Order Confirmed ✓ — #{{order_id}}',
 'Sent immediately after a customer completes a purchase.',
$$<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:40px 20px;">
<table role="presentation" width="600" align="center" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
  <tr><td style="background:#4f46e5;padding:32px 40px;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-.3px;">{{store_name}}</h1>
  </td></tr>
  <tr><td style="padding:40px 40px 32px;">
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Order Confirmed ✓</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Thank you for your purchase, {{customer_name}}!</p>

    <table role="presentation" width="100%" style="background:#f9fafb;border-radius:6px;padding:20px;" cellpadding="0" cellspacing="0">
      <tr><td style="color:#374151;font-size:13px;line-height:2;">
        <strong>Order ID:</strong> #{{order_id}}<br>
        <strong>Order Date:</strong> {{order_date}}<br>
        <strong>Total:</strong> {{total_amount}}<br>
        <strong>Payment:</strong> {{payment_method}}<br>
        <strong>Estimated Delivery:</strong> {{estimated_delivery}}
      </td></tr>
    </table>

    <p style="margin:24px 0 8px;color:#111827;font-size:14px;font-weight:600;">Items Ordered</p>
    <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.7;">{{order_items}}</p>

    <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">Shipping To</p>
    <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.7;">{{shipping_address}}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:8px 0 24px;">
      <a href="{{tracking_url}}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:6px;">Track Your Order</a>
    </td></tr></table>

    <p style="margin:0;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6;padding-top:20px;">Questions? Contact us at <a href="mailto:{{support_email}}" style="color:#4f46e5;">{{support_email}}</a></p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>$$,
ARRAY['customer_name','order_id','order_date','total_amount','payment_method','order_items','shipping_address','estimated_delivery','tracking_url','support_email','store_name'],
ARRAY['order','confirmation','purchase'], true),

-- 2. Order Shipped
(null, 'Order Shipped', 'Transactional',
 'Your Order is On the Way! 🚚 — #{{order_id}}',
 'Notifies customer their order has been dispatched with tracking info.',
$$<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order Shipped</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:40px 20px;">
<table role="presentation" width="600" align="center" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
  <tr><td style="background:#0891b2;padding:32px 40px;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">{{store_name}}</h1>
  </td></tr>
  <tr><td style="padding:40px 40px 32px;">
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Your order is on its way! 🚚</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Hi {{customer_name}}, your package has left our warehouse.</p>

    <table role="presentation" width="100%" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:20px;" cellpadding="0" cellspacing="0">
      <tr><td style="color:#0c4a6e;font-size:13px;line-height:2;">
        <strong>Order ID:</strong> #{{order_id}}<br>
        <strong>Carrier:</strong> {{carrier_name}}<br>
        <strong>Tracking Number:</strong> {{tracking_number}}<br>
        <strong>Estimated Arrival:</strong> {{estimated_delivery}}
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 0;">
      <a href="{{tracking_url}}" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:6px;">Track Package</a>
    </td></tr></table>

    <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">Items in this shipment</p>
    <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.7;">{{order_items}}</p>

    <p style="margin:0;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6;padding-top:20px;">Questions? Contact us at <a href="mailto:{{support_email}}" style="color:#0891b2;">{{support_email}}</a></p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>$$,
ARRAY['customer_name','order_id','carrier_name','tracking_number','estimated_delivery','tracking_url','order_items','support_email','store_name'],
ARRAY['shipping','tracking','dispatch'], true),

-- 3. Refund Processed
(null, 'Refund Processed', 'Returns & Refunds',
 'Your Refund of {{refund_amount}} Has Been Processed',
 'Confirms that a refund has been approved and is on its way.',
$$<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Refund Processed</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:40px 20px;">
<table role="presentation" width="600" align="center" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
  <tr><td style="background:#059669;padding:32px 40px;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">{{store_name}}</h1>
  </td></tr>
  <tr><td style="padding:40px 40px 32px;">
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Refund Processed ✓</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Hi {{customer_name}}, your refund is on its way.</p>

    <table role="presentation" width="100%" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:20px;" cellpadding="0" cellspacing="0">
      <tr><td style="color:#14532d;font-size:13px;line-height:2;">
        <strong>Order ID:</strong> #{{order_id}}<br>
        <strong>Refund Amount:</strong> {{refund_amount}}<br>
        <strong>Refund Method:</strong> {{refund_method}}<br>
        <strong>Processing Time:</strong> {{processing_days}} business days
      </td></tr>
    </table>

    <p style="margin:24px 0 0;color:#374151;font-size:14px;line-height:1.7;">
      If you have any questions about this refund, please don't hesitate to reach out to our support team.
    </p>

    <p style="margin:0;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6;padding-top:20px;margin-top:24px;">Questions? Contact us at <a href="mailto:{{support_email}}" style="color:#059669;">{{support_email}}</a></p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>$$,
ARRAY['customer_name','order_id','refund_amount','refund_method','processing_days','support_email','store_name'],
ARRAY['refund','return','money-back'], true),

-- 4. Chargeback — Request More Info
(null, 'Chargeback: Request More Info', 'Financial',
 'Important: Dispute Filed on Order #{{order_id}} — Your Response Needed',
 'Asks the customer for details to help resolve a chargeback dispute.',
$$<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Dispute Notice</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:40px 20px;">
<table role="presentation" width="600" align="center" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
  <tr><td style="background:#d97706;padding:32px 40px;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">{{store_name}}</h1>
  </td></tr>
  <tr><td style="padding:40px 40px 32px;">
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">Action Required</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Hi {{customer_name}}, we received a dispute notice for order #{{order_id}}.</p>

    <table role="presentation" width="100%" style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:20px;" cellpadding="0" cellspacing="0">
      <tr><td style="color:#92400e;font-size:13px;line-height:2;">
        <strong>Order ID:</strong> #{{order_id}}<br>
        <strong>Dispute Amount:</strong> {{dispute_amount}}<br>
        <strong>Response Deadline:</strong> {{deadline}}
      </td></tr>
    </table>

    <p style="margin:24px 0 16px;color:#374151;font-size:14px;line-height:1.7;">
      To resolve this quickly, please reply to this email with:
    </p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
      <li>Confirmation that you placed this order</li>
      <li>Any screenshots or proof of purchase</li>
      <li>Description of any issues you experienced</li>
    </ul>

    <p style="margin:0;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6;padding-top:20px;">Reply to this email or contact <a href="mailto:{{support_email}}" style="color:#d97706;">{{support_email}}</a></p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>$$,
ARRAY['customer_name','order_id','dispute_amount','deadline','support_email','store_name'],
ARRAY['chargeback','dispute','financial'], true),

-- 5. Support: General Response
(null, 'Support: General Response', 'Support',
 'Re: Your Support Request — {{ticket_id}}',
 'Generic support response acknowledging and addressing a customer issue.',
$$<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Support Response</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:40px 20px;">
<table role="presentation" width="600" align="center" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
  <tr><td style="background:#2563eb;padding:32px 40px;">
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">{{store_name}} Support</h1>
  </td></tr>
  <tr><td style="padding:40px 40px 32px;">
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">Hi {{customer_name}},</p>
    <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.7;">
      Thank you for reaching out! We've received your request (ticket <strong>{{ticket_id}}</strong>) and we're on it.
    </p>

    <table role="presentation" width="100%" style="background:#f0f4ff;border-radius:6px;padding:20px;" cellpadding="0" cellspacing="0">
      <tr><td style="color:#1e40af;font-size:14px;line-height:1.7;">{{response_body}}</td></tr>
    </table>

    <p style="margin:24px 0 0;color:#374151;font-size:14px;line-height:1.7;">
      If you need anything else, just reply to this email — we're always happy to help.
    </p>
    <p style="margin:8px 0 0;color:#374151;font-size:14px;">— {{agent_name}}, {{store_name}} Support</p>

    <p style="margin:0;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6;padding-top:20px;margin-top:24px;"><a href="mailto:{{support_email}}" style="color:#2563eb;">{{support_email}}</a></p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>$$,
ARRAY['customer_name','ticket_id','response_body','agent_name','support_email','store_name'],
ARRAY['support','customer-service','response'], true),

-- 6. Win-Back Campaign
(null, 'Win-Back: We Miss You', 'Marketing',
 'We Miss You, {{customer_name}} — Here''s {{discount_amount}} Off',
 'Re-engagement email for customers who haven''t purchased recently.',
$$<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>We Miss You</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:40px 20px;">
<table role="presentation" width="600" align="center" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
  <tr><td style="background:linear-gradient(135deg,#7c3aed,#db2777);padding:48px 40px;text-align:center;">
    <h1 style="margin:0 0 8px;color:#ffffff;font-size:28px;font-weight:800;">We miss you! 💜</h1>
    <p style="margin:0;color:rgba(255,255,255,.8);font-size:15px;">{{store_name}}</p>
  </td></tr>
  <tr><td style="padding:40px 40px 32px;text-align:center;">
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.7;">
      Hi {{customer_name}}, it's been a while since your last order!
      We wanted to reach out with a special offer just for you.
    </p>

    <table role="presentation" align="center" style="background:#f5f3ff;border:2px dashed #7c3aed;border-radius:8px;padding:20px 32px;margin:24px auto;" cellpadding="0" cellspacing="0">
      <tr><td style="text-align:center;">
        <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your exclusive code</p>
        <p style="margin:0 0 4px;color:#7c3aed;font-size:28px;font-weight:800;letter-spacing:2px;">{{promo_code}}</p>
        <p style="margin:0;color:#374151;font-size:14px;">{{discount_amount}} off — valid until {{expiry_date}}</p>
      </td></tr>
    </table>

    <table role="presentation" align="center" cellpadding="0" cellspacing="0"><tr><td style="padding:8px 0 32px;">
      <a href="{{store_url}}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;">Shop Now →</a>
    </td></tr></table>

    <p style="margin:0;color:#9ca3af;font-size:12px;border-top:1px solid #f3f4f6;padding-top:20px;">
      <a href="{{unsubscribe_url}}" style="color:#9ca3af;">Unsubscribe</a> · <a href="mailto:{{support_email}}" style="color:#9ca3af;">{{support_email}}</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body>
</html>$$,
ARRAY['customer_name','promo_code','discount_amount','expiry_date','store_url','unsubscribe_url','support_email','store_name'],
ARRAY['winback','retention','marketing','discount'], true);
