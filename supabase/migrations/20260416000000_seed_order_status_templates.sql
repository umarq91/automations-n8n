-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Order Status email templates — 8 templates covering all ParcelPanel
-- fulfillment statuses used in the n8n order-status workflow.
-- Variables: first_name, order_number, tracking_number, tracking_url
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.email_templates
  (organization_id, name, category, subject, description, html_body, variables, tags, is_default)
values

-- ── 1. Label Created (info_received) ─────────────────────────────────────────
(null,
 'Order Status — Label Created',
 'Order Status — Label Created',
 'Your Order {{order_number}} — Label Created',
 'Shipping label has been created. Carrier has not yet picked up the package.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1d4ed8;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Order Update</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hey {{first_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Your order <strong>{{order_number}}</strong> has been processed and the shipping label is created. The carrier will pick up your package soon. Once it is on the way, you will see updates here.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">You can track your order here: <a href="{{tracking_url}}" style="color:#1d4ed8;">{{tracking_url}}</a></p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">Just reply here if you have any questions.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['first_name','order_number','tracking_number','tracking_url'],
ARRAY['order-status','info-received','label-created','parcel-panel'],
true),

-- ── 2. Label Created — Delayed Pickup (info_received > 3 days) ───────────────
(null,
 'Order Status — Label Delayed',
 'Order Status — Label Delayed',
 'Update on Your Order {{order_number}}',
 'Label created but carrier has not picked up within 3+ days. Proactive delay notice.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#b45309;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Order Update</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hey {{first_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Your order <strong>{{order_number}}</strong> has been processed and the shipping label is ready. However, it is taking a bit longer than usual — we are checking with the carrier and will update you as soon as we have news.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">You can monitor any movement here: <a href="{{tracking_url}}" style="color:#1d4ed8;">{{tracking_url}}</a></p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">I will keep an eye on it and let you know if anything changes. Just reply here if you have any questions.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['first_name','order_number','tracking_number','tracking_url'],
ARRAY['order-status','info-received','delayed-pickup','parcel-panel'],
true),

-- ── 3. Picked Up (picked_up) ──────────────────────────────────────────────────
(null,
 'Order Status — Picked Up',
 'Order Status — Picked Up',
 'Your Order {{order_number}} Has Been Picked Up',
 'Carrier has collected the package. Order is now in the shipping network.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1d4ed8;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Order Update</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hey {{first_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Great news! Your package for order <strong>{{order_number}}</strong> has been picked up by the carrier and is now on its way to you. You can track it using the link below.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Tracking number: <strong>{{tracking_number}}</strong><br>
  Track here: <a href="{{tracking_url}}" style="color:#1d4ed8;">{{tracking_url}}</a></p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">Just reply here if you have any questions.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['first_name','order_number','tracking_number','tracking_url'],
ARRAY['order-status','picked-up','in-transit','parcel-panel'],
true),

-- ── 4. In Transit (in_transit) ───────────────────────────────────────────────
(null,
 'Order Status — In Transit',
 'Order Status — In Transit',
 'Your Order {{order_number}} Is On Its Way',
 'Package is moving through the carrier network toward the customer.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1d4ed8;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Order Update</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hey {{first_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Your package for order <strong>{{order_number}}</strong> is currently in transit and moving through the carrier network. You can follow its journey using the tracking link.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Tracking number: <strong>{{tracking_number}}</strong><br>
  Track here: <a href="{{tracking_url}}" style="color:#1d4ed8;">{{tracking_url}}</a></p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">I will keep an eye on it and let you know if anything changes. Just reply here if you have any questions.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['first_name','order_number','tracking_number','tracking_url'],
ARRAY['order-status','in-transit','tracking','parcel-panel'],
true),

-- ── 5. Out for Delivery (out_for_delivery) ────────────────────────────────────
(null,
 'Order Status — Out for Delivery',
 'Order Status — Out for Delivery',
 'Your Order {{order_number}} Is Out for Delivery Today',
 'Package is with the delivery driver and expected today.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1d4ed8;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Order Update</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hey {{first_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Your package for order <strong>{{order_number}}</strong> is out for delivery today! You should receive it soon — keep an eye out for the delivery person.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Track the final mile here: <a href="{{tracking_url}}" style="color:#1d4ed8;">{{tracking_url}}</a></p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">Just reply here if you have any questions.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['first_name','order_number','tracking_number','tracking_url'],
ARRAY['order-status','out-for-delivery','today','parcel-panel'],
true),

-- ── 6. Delivered (delivered) ──────────────────────────────────────────────────
(null,
 'Order Status — Delivered',
 'Order Status — Delivered',
 'Your Order {{order_number}} Has Been Delivered',
 'Package marked as delivered. Proactively checks customer received it without issues.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#065f46;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Order Update</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hey {{first_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Your package for order <strong>{{order_number}}</strong> has been delivered! We hope everything arrived in great shape.</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">If you have not received it or there is any issue with your order, just reply here and we will help right away.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['first_name','order_number','tracking_number','tracking_url'],
ARRAY['order-status','delivered','parcel-panel'],
true),

-- ── 7. Shipment Exception (exception) ────────────────────────────────────────
(null,
 'Order Status — Shipment Exception',
 'Order Status — Exception',
 'Update on Your Order {{order_number}}',
 'Carrier has flagged a delay or issue (weather, customs, facility hold, etc.).',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#b45309;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Order Update</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hey {{first_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">There is a slight delay with your shipment for order <strong>{{order_number}}</strong>. The carrier is working to resolve it, and we are keeping an eye on it. We will update you as soon as there is progress.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">You can check the latest status here: <a href="{{tracking_url}}" style="color:#1d4ed8;">{{tracking_url}}</a></p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">No action is needed from you right now — just reply here if you have any questions and we will get back to you straight away.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['first_name','order_number','tracking_number','tracking_url'],
ARRAY['order-status','exception','delay','carrier','parcel-panel'],
true),

-- ── 8. Returned to Sender (returned) ─────────────────────────────────────────
(null,
 'Order Status — Returned to Sender',
 'Order Status — Returned',
 'Your Order {{order_number}} — Return Update',
 'Package was returned to sender. Offer refund or replacement.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#dc2626;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Order Update</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hey {{first_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Your package for order <strong>{{order_number}}</strong> was returned to sender. We are sorry this happened — it is not the experience we want for you.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Please let us know how you would like to proceed — we can arrange a <strong>replacement shipment</strong> or process a <strong>full refund</strong>, whichever you prefer. Just reply here and we will get it sorted right away.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['first_name','order_number','tracking_number','tracking_url'],
ARRAY['order-status','returned','refund','replacement','parcel-panel'],
true);
