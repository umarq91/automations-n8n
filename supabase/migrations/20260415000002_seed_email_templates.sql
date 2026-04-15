-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Intent-specific email templates for n8n complaint routing
-- Drops the 6 generic defaults from the previous seed and replaces them
-- with 17 templates, one per complaint/inquiry category that n8n handles.
-- ─────────────────────────────────────────────────────────────────────────────

delete from public.email_templates
where is_default = true and organization_id is null;

insert into public.email_templates
  (organization_id, name, category, subject, description, html_body, variables, tags, is_default)
values

-- ── 1. Quality / Defective Item ──────────────────────────────────────────────
(null,
 'Quality / Defective Item',
 'Quality Issue',
 'Re: Your Order #{{order_id}}',
 'Customer reports a defective, damaged, or poor quality item.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1f2937;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We are truly sorry to hear about the quality issue with your order <strong>#{{order_id}}</strong>. This is not the standard we hold ourselves to, and we completely understand your frustration.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">To help us investigate and resolve this as quickly as possible, could you please reply with a photo of the affected area?</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">Once we receive your photo, we will follow up within 24 hours with next steps.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id'],
ARRAY['quality','defective','damaged'],
true),

-- ── 2. Wrong Item Received ────────────────────────────────────────────────────
(null,
 'Wrong Item Received',
 'Wrong Item',
 'Re: Your Order #{{order_id}}',
 'Customer received a completely different item from what was ordered.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1f2937;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We sincerely apologize for sending you the wrong item on order <strong>#{{order_id}}</strong>. This is our error and we are sorry for the inconvenience caused.</p>
  <p style="margin:0 0 10px;color:#374151;font-size:14px;line-height:1.7;">To investigate this immediately, could you please reply with:</p>
  <ul style="margin:0 0 14px;padding-left:20px;color:#374151;font-size:14px;line-height:2.1;">
    <li>A photo of the item you received</li>
    <li>A photo of the item's tag or label</li>
  </ul>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">We will follow up within 24 hours of receiving your photos.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id'],
ARRAY['wrong-item','fulfillment'],
true),

-- ── 3. Color Mismatch ─────────────────────────────────────────────────────────
(null,
 'Color Mismatch',
 'Color Mismatch',
 'Re: Your Order #{{order_id}}',
 'Item color does not match the product listing photos on the website.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1f2937;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We are sorry to hear that the color of your order <strong>#{{order_id}}</strong> does not match what was shown on our website. We completely understand how disappointing this is.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">To help us review your case, could you please send a photo of the item alongside a screenshot of the product listing showing the expected color?</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">We will follow up within 24 hours of receiving your photo.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id'],
ARRAY['color','mismatch'],
true),

-- ── 4. Sizing Complaint ───────────────────────────────────────────────────────
(null,
 'Sizing Complaint',
 'Sizing Complaint',
 'Re: Your Order #{{order_id}}',
 'Item measurements do not match the published size chart.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1f2937;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We are sorry to hear that the sizing of your order <strong>#{{order_id}}</strong> does not match what was described. We want to investigate this thoroughly before taking any further steps.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">To help us review your case, could you please reply with a photo of the item laid flat with a measuring tape showing the relevant measurement? This allows us to compare directly against our size chart.</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">We will follow up within 24 hours of receiving your photo.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id'],
ARRAY['sizing','size-chart','measurements'],
true),

-- ── 5. Missing Package ────────────────────────────────────────────────────────
(null,
 'Missing Package',
 'Missing Package',
 'Re: Your Order #{{order_id}} — Delivery Investigation',
 'Package has not arrived and tracking shows no delivery.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1f2937;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We completely understand how concerning and frustrating this must be, and we sincerely apologize that your order <strong>#{{order_id}}</strong> has not reached you.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We are investigating this with the carrier immediately and will provide you with a full update within 24–48 hours.</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">No further action is needed from you at this stage — we will be in touch shortly.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id'],
ARRAY['missing','non-delivery','carrier'],
true),

-- ── 6. Partial Order Missing ──────────────────────────────────────────────────
(null,
 'Partial Order Missing',
 'Partial Order',
 'Re: Your Order #{{order_id}}',
 'Order arrived but one or more items were missing from the package.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1f2937;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We are sorry to hear that your order <strong>#{{order_id}}</strong> arrived incomplete. We will investigate and resolve this as quickly as possible.</p>
  <p style="margin:0 0 10px;color:#374151;font-size:14px;line-height:1.7;">To help us investigate, could you please send:</p>
  <ul style="margin:0 0 14px;padding-left:20px;color:#374151;font-size:14px;line-height:2.1;">
    <li>A photo of the items you received</li>
    <li>A photo of the packing slip included in the box</li>
  </ul>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">We will follow up within 24 hours of receiving your photos.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id'],
ARRAY['partial','missing-item','packing-slip'],
true),

-- ── 7. Refund Not Received ────────────────────────────────────────────────────
(null,
 'Refund Not Received',
 'Refund Delayed',
 'Re: Refund for Order #{{order_id}}',
 'Customer is waiting on a refund that was promised but has not arrived.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1f2937;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We sincerely apologize for the delay in receiving your refund for order <strong>#{{order_id}}</strong>. This is not acceptable and we understand your frustration.</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">We have escalated this to our finance team to investigate immediately and will update you within 24 hours with a clear status on your refund.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id'],
ARRAY['refund','finance','delay'],
true),

-- ── 8. Active Dispute (PayPal / Credit Card) ──────────────────────────────────
(null,
 'Active Dispute',
 'Active Dispute',
 'Re: Your Order #{{order_id}} — Urgent',
 'Customer has opened a PayPal or credit card dispute. High priority escalation.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#dc2626;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support — Urgent</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We owe you a direct and sincere apology — you should not have had to reach this point without a proper response from us, and we take full responsibility for that failure.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Your case for order <strong>#{{order_id}}</strong> has been escalated to our senior team immediately and is our highest priority. We will follow up within 24 hours with a concrete resolution.</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">We are committed to resolving this for you urgently.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id'],
ARRAY['dispute','paypal','escalation','urgent'],
true),

-- ── 9. Escalation Threat (Chargeback / Social Media / FTC) ───────────────────
(null,
 'Escalation Threat',
 'Escalation Threat',
 'Re: Your Order #{{order_id}}',
 'Customer is threatening a chargeback, negative reviews, or FTC complaint.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#b45309;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We take your concern regarding order <strong>#{{order_id}}</strong> very seriously and want to ensure this is properly reviewed and resolved for you.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">To help us assess your case as quickly as possible, could you please reply with a photo of the item?</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">We will follow up with a concrete resolution within 24 hours.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id'],
ARRAY['chargeback','threat','review','ftc'],
true),

-- ── 10. Order Not Found ───────────────────────────────────────────────────────
(null,
 'Order Not Found',
 'Order Not Found',
 'Re: Your Support Request — Order Details Needed',
 'Unable to locate the order. Customer needs to provide identifying details.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1d4ed8;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi,</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We are sorry to hear you are experiencing an issue and we want to help resolve this as quickly as possible.</p>
  <p style="margin:0 0 10px;color:#374151;font-size:14px;line-height:1.7;">Could you please provide the following so we can locate your order:</p>
  <ul style="margin:0 0 14px;padding-left:20px;color:#374151;font-size:14px;line-height:2.1;">
    <li>Order number</li>
    <li>Email address used at checkout</li>
    <li>Full name</li>
  </ul>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">Once we have these details, we will be in touch right away.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY[]::text[],
ARRAY['order-lookup','details-needed'],
true),

-- ── 11. Sizing Inquiry (Pre-purchase) ────────────────────────────────────────
(null,
 'Sizing Inquiry',
 'Sizing Inquiry',
 'Re: Sizing Question',
 'Customer asking about sizing before placing an order.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1d4ed8;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Thank you for reaching out before placing your order!</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">For the best fit, we recommend sizing up from your usual size. If you are typically between sizes, going one size up will give you the most comfortable result.</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">If you have any other questions, we are happy to help!</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name'],
ARRAY['sizing','pre-purchase','inquiry'],
true),

-- ── 12. Shipping Delay ────────────────────────────────────────────────────────
(null,
 'Shipping Delay',
 'Shipping Delay',
 'Re: Your Order #{{order_id}} — Delivery Update',
 'Order is taking longer than the stated 7-13 business day window.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#1d4ed8;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Thank you for reaching out about your order <strong>#{{order_id}}</strong>.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Our standard delivery window is <strong>7–13 business days</strong> from the order date. If your tracking link is showing a longer estimate, please note that this is generated by the carrier and may not reflect our guaranteed delivery window.</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">If your order has not arrived within 13 business days from your order date, please reply here and we will investigate with the carrier immediately. We are happy to provide an update at any stage — just let us know.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id'],
ARRAY['shipping','delay','tracking'],
true),

-- ── 13. Customs Hold ──────────────────────────────────────────────────────────
(null,
 'Customs Hold',
 'Customs Hold',
 'Re: Your Order #{{order_id}} — Customs',
 'Package is held at customs. Customer was not informed about potential fees.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#b45309;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We apologize that you were not informed about potential customs fees at the time of your order — we understand how unexpected this must be.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We are reviewing your order <strong>#{{order_id}}</strong> urgently given the time-sensitive nature of customs holds and will follow up within 24 hours with a clear update and next steps.</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">We appreciate your patience and will be in touch shortly.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id'],
ARRAY['customs','import','fees'],
true),

-- ── 14. Misdirected / Automated Email ────────────────────────────────────────
(null,
 'Misdirected / Automated Email',
 'Misdirected Email',
 '[INTERNAL] Auto-close — No Reply Needed',
 'Ticket is an automated notification or email not intended for customer support.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#4b5563;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Internal — No Reply Needed</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:15px;font-weight:600;line-height:1.7;">Auto-close this ticket without sending a reply.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">This ticket appears to be an automated notification, marketing email, or system message not intended for customer support.</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">Action: Archive immediately. Do not reply to the sender.</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY[]::text[],
ARRAY['internal','auto-close','misdirected'],
true),

-- ── 15. Repeat Contact (Multiple Emails Ignored) ──────────────────────────────
(null,
 'Repeat Contact — Previously Ignored',
 'Repeat Contact',
 'Re: Your Order #{{order_id}}',
 'Customer has emailed multiple times without receiving a response.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#dc2626;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support — Senior Escalation</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We owe you a direct and sincere apology. Having to contact us multiple times without receiving a proper response is completely unacceptable, and we are truly sorry for the frustration this has caused.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Your case for order <strong>#{{order_id}}</strong> has been escalated to a senior member of our team who will personally take ownership of this. We will follow up by <strong>{{deadline}}</strong> with a concrete resolution.</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">We will not let you down again.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id','deadline'],
ARRAY['repeat','ignored','escalation','senior'],
true),

-- ── 16. Privacy Breach (Wrong Order with Another Customer's Data) ─────────────
(null,
 'Privacy Breach — Wrong Order Data',
 'Privacy Breach',
 'Re: Your Order #{{order_id}} — Important',
 'Customer received another customer''s packing slip with personal data exposed.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#dc2626;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support — Compliance Escalation</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Thank you for bringing this to our attention — we take matters like this extremely seriously.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">We kindly ask that you discard or destroy the packing slip containing the other customer's information to protect their privacy. Please do not photograph or forward it.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Your case for order <strong>#{{order_id}}</strong> has been escalated to our compliance team immediately. We will follow up within 24 hours with a resolution and next steps.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name','order_id'],
ARRAY['privacy','compliance','breach','gdpr'],
true),

-- ── 17. Positive Feedback / Minor Quality Flag ────────────────────────────────
(null,
 'Positive Feedback / Minor Issue',
 'Positive Feedback',
 'Re: Your Feedback — Thank You',
 'Customer is happy but flagging a minor quality issue for the QC team.',
$$<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 16px;">
<table width="560" align="center" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">
<tr><td style="background:#065f46;padding:16px 28px;border-radius:8px 8px 0 0;">
  <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Customer Support</p>
</td></tr>
<tr><td style="padding:28px;">
  <p style="margin:0 0 14px;color:#111827;font-size:14px;line-height:1.7;">Hi {{customer_name}},</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Thank you so much for taking the time to share this — we genuinely appreciate customers who help us improve our quality.</p>
  <p style="margin:0 0 14px;color:#374151;font-size:14px;line-height:1.7;">Could you please reply with a photo of the area you mentioned? We will pass this directly to our quality control team for documentation and review.</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">Thank you again — feedback like yours truly makes a difference.</p>
  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;border-top:1px solid #f3f4f6;padding-top:14px;">Customer Support Team</p>
</td></tr>
</table></td></tr></table>
</body></html>$$,
ARRAY['customer_name'],
ARRAY['feedback','quality-control','positive'],
true);
