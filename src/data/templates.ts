export interface EmailTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  subject: string;
  content: string;
  isCustom: boolean;
  variables: string[];
  createdDate: string;
  description: string;
  tags: string[];
}

export type TemplateCategory =
  | 'Transactional'
  | 'Returns & Refunds'
  | 'Financial'
  | 'Support'
  | 'Marketing'
  | 'Security'
  | 'Operations'
  | 'B2B';

export const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  Transactional: 'bg-indigo-100 text-indigo-700',
  'Returns & Refunds': 'bg-amber-100 text-amber-700',
  Financial: 'bg-emerald-100 text-emerald-700',
  Support: 'bg-blue-100 text-blue-700',
  Marketing: 'bg-pink-100 text-pink-700',
  Security: 'bg-red-100 text-red-700',
  Operations: 'bg-slate-100 text-slate-700',
  B2B: 'bg-violet-100 text-violet-700',
};

export const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome New Customer',
    category: 'Transactional',
    description: 'First email sent after a new customer registers or places their first order.',
    subject: 'Welcome to {{store_name}}, {{customer_name}}!',
    content: `Hi {{customer_name}},

Welcome aboard! We're thrilled to have you as part of the {{store_name}} family.

Here's what you can expect from us:
• Fast, reliable shipping on every order
• 30-day hassle-free returns
• 24/7 customer support
• Exclusive member deals and early access to new products

As a welcome gift, here's a discount code just for you:
🎁 Code: {{promo_code}} — {{discount_amount}} off your next order

To get started, browse our latest collection:
{{store_url}}

If you ever need help, our team is always here. Just reply to this email or reach us at {{support_email}}.

Welcome again,
The {{store_name}} Team`,
    isCustom: false,
    variables: ['customer_name', 'store_name', 'promo_code', 'discount_amount', 'store_url', 'support_email'],
    createdDate: '2024-01-01',
    tags: ['welcome', 'onboarding', 'new customer'],
  },
  {
    id: '2',
    name: 'Order Confirmation',
    category: 'Transactional',
    description: 'Sent immediately after a customer completes a purchase.',
    subject: 'Order Confirmed ✓ — #{{order_id}}',
    content: `Hi {{customer_name}},

Great news — your order has been confirmed and is being prepared!

━━━━━━━━━━━━━━━━━━━━
ORDER SUMMARY
━━━━━━━━━━━━━━━━━━━━
Order ID:      #{{order_id}}
Order Date:    {{order_date}}
Total Amount:  {{total_amount}}
Payment:       {{payment_method}}

Items Ordered:
{{order_items}}

Shipping To:
{{shipping_address}}

Estimated Delivery: {{estimated_delivery}}
━━━━━━━━━━━━━━━━━━━━

You can track your order at any time here:
{{tracking_url}}

Questions? Reply to this email or contact {{support_email}}.

Thank you for shopping with us!
{{store_name}}`,
    isCustom: false,
    variables: ['customer_name', 'order_id', 'order_date', 'total_amount', 'payment_method', 'order_items', 'shipping_address', 'estimated_delivery', 'tracking_url', 'support_email', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['order', 'confirmation', 'purchase'],
  },
  {
    id: '3',
    name: 'Order Shipped',
    category: 'Transactional',
    description: 'Notifies customer that their order has been dispatched with tracking info.',
    subject: 'Your Order is On the Way! 🚚 — #{{order_id}}',
    content: `Hi {{customer_name}},

Your order has left our warehouse and is on its way to you!

TRACKING INFORMATION
━━━━━━━━━━━━━━━━━━━━
Order ID:        #{{order_id}}
Carrier:         {{carrier_name}}
Tracking Number: {{tracking_number}}
Estimated Arrival: {{estimated_delivery}}

Track your package in real-time:
👉 {{tracking_url}}

WHAT'S IN YOUR PACKAGE:
{{order_items}}

If your package doesn't arrive by {{expected_date}}, please contact us and we'll investigate immediately.

Enjoy your order!
{{store_name}} Team`,
    isCustom: false,
    variables: ['customer_name', 'order_id', 'carrier_name', 'tracking_number', 'estimated_delivery', 'tracking_url', 'order_items', 'expected_date', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['shipping', 'tracking', 'dispatch'],
  },
  {
    id: '4',
    name: 'Order Delivered',
    category: 'Transactional',
    description: 'Confirms delivery and encourages a review or follow-up.',
    subject: 'Your Order Has Been Delivered! 📦 — #{{order_id}}',
    content: `Hi {{customer_name}},

Great news — your order #{{order_id}} has been delivered!

Delivered on: {{delivery_date}}
Delivered to: {{delivery_address}}

We hope you love your purchase. If anything is wrong with your order, please contact us within 48 hours so we can make it right.

💬 HOW DID WE DO?
Your feedback means the world to us. Leave a quick review and help other customers discover great products:
{{review_link}}

As a thank you for your time, you'll get {{review_reward}} applied to your next order.

Need anything? We're always here.
{{store_name}} Support Team
{{support_email}}`,
    isCustom: false,
    variables: ['customer_name', 'order_id', 'delivery_date', 'delivery_address', 'review_link', 'review_reward', 'store_name', 'support_email'],
    createdDate: '2024-01-01',
    tags: ['delivery', 'review', 'feedback'],
  },
  {
    id: '5',
    name: 'Order Cancelled',
    category: 'Transactional',
    description: 'Confirms cancellation and communicates refund timeline.',
    subject: 'Order Cancelled — #{{order_id}}',
    content: `Hi {{customer_name}},

We've processed the cancellation for your order #{{order_id}} as requested.

CANCELLATION DETAILS
━━━━━━━━━━━━━━━━━━━━
Order ID:         #{{order_id}}
Cancelled On:     {{cancellation_date}}
Cancellation By:  {{cancelled_by}}
Reason:           {{cancellation_reason}}

REFUND INFORMATION
If you were charged, your refund of {{refund_amount}} will be processed to {{payment_method}} within {{refund_timeline}} business days.

We're sorry to see this order go. If there's anything we could have done better, we'd love to hear from you:
{{feedback_link}}

Ready to shop again? Here's {{promo_code}} — {{discount_amount}} off your next order.

{{store_name}} Team`,
    isCustom: false,
    variables: ['customer_name', 'order_id', 'cancellation_date', 'cancelled_by', 'cancellation_reason', 'refund_amount', 'payment_method', 'refund_timeline', 'feedback_link', 'promo_code', 'discount_amount', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['cancellation', 'refund', 'order'],
  },
  {
    id: '6',
    name: 'Order Delayed',
    category: 'Operations',
    description: 'Proactive communication when an order will arrive later than expected.',
    subject: 'Important Update on Your Order #{{order_id}}',
    content: `Hi {{customer_name}},

We want to be upfront with you — your order #{{order_id}} is experiencing a delay.

DELAY UPDATE
━━━━━━━━━━━━━━━━━━━━
Original Delivery Date: {{original_date}}
New Estimated Delivery: {{new_delivery_date}}
Delay Reason: {{delay_reason}}

We sincerely apologize for the inconvenience. As a gesture of goodwill, we're adding {{compensation}} to your account automatically.

YOUR OPTIONS:
1. Keep waiting — your order is on its way and will arrive by {{new_delivery_date}}
2. Cancel for a full refund — reply "CANCEL ORDER {{order_id}}" to this email
3. Talk to us — reply to this email or call {{support_phone}}

We take responsibility for this delay and appreciate your patience.

{{store_name}} Operations Team`,
    isCustom: false,
    variables: ['customer_name', 'order_id', 'original_date', 'new_delivery_date', 'delay_reason', 'compensation', 'support_phone', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['delay', 'shipping', 'update'],
  },
  {
    id: '7',
    name: 'Backorder Notification',
    category: 'Operations',
    description: 'Notifies customer that an item is backordered and provides options.',
    subject: 'Item on Backorder — Order #{{order_id}}',
    content: `Hi {{customer_name}},

One or more items in your order #{{order_id}} are currently on backorder.

BACKORDERED ITEM(S):
{{backordered_items}}

Expected back in stock: {{restock_date}}
New estimated delivery: {{new_delivery_date}}

YOUR OPTIONS:
✅ Wait it out — We'll ship the backordered items by {{restock_date}}
🔄 Swap for similar — Browse alternatives: {{alternatives_url}}
✂️  Partial shipment — We'll send available items now and backorder the rest at no extra shipping cost
❌ Cancel the backordered item — Get a refund of {{item_amount}}

Reply to this email with your preference or visit your account: {{account_url}}

We're committed to fulfilling your order as quickly as possible.

{{store_name}} Fulfillment Team`,
    isCustom: false,
    variables: ['customer_name', 'order_id', 'backordered_items', 'restock_date', 'new_delivery_date', 'alternatives_url', 'item_amount', 'account_url', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['backorder', 'stock', 'fulfillment'],
  },
  {
    id: '8',
    name: 'Return Request Approved',
    category: 'Returns & Refunds',
    description: 'Approves a return and provides prepaid label or instructions.',
    subject: 'Return Approved — #{{order_id}} | Instructions Inside',
    content: `Hi {{customer_name}},

Your return request for order #{{order_id}} has been approved!

RETURN DETAILS
━━━━━━━━━━━━━━━━━━━━
Return ID:        #{{return_id}}
Items Returning:  {{return_items}}
Return Reason:    {{return_reason}}
Refund Amount:    {{refund_amount}}

HOW TO RETURN YOUR ITEM(S):
1. Pack the item(s) securely in the original packaging if possible
2. Attach the prepaid shipping label: {{label_url}}
3. Drop off at any {{carrier_name}} location
4. Keep your receipt — your tracking number is {{return_tracking}}

WHAT HAPPENS NEXT:
Once we receive and inspect your return, your refund of {{refund_amount}} will be processed to {{payment_method}} within {{refund_timeline}} business days.

Return deadline: Please ship by {{return_deadline}}

Questions? Contact us at {{support_email}}.

{{store_name}} Returns Team`,
    isCustom: false,
    variables: ['customer_name', 'order_id', 'return_id', 'return_items', 'return_reason', 'refund_amount', 'label_url', 'carrier_name', 'return_tracking', 'payment_method', 'refund_timeline', 'return_deadline', 'support_email', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['return', 'approved', 'refund'],
  },
  {
    id: '9',
    name: 'Return Request Rejected',
    category: 'Returns & Refunds',
    description: 'Declines a return with explanation and alternative resolution.',
    subject: 'Update on Your Return Request — Order #{{order_id}}',
    content: `Hi {{customer_name}},

Thank you for contacting us regarding your return request for order #{{order_id}}.

After careful review, we're unable to approve this return for the following reason(s):
{{rejection_reasons}}

OUR RETURN POLICY:
• Returns must be initiated within {{return_window}} days of delivery
• Items must be unused, unworn, and in original packaging with tags attached
• {{non_returnable_note}}

We understand this may be disappointing, and we want to find a solution that works for you. Here are some alternatives:

1. Store Credit — We can offer {{store_credit_amount}} in store credit as a courtesy
2. Repair or Replacement — If the item is defective, we'll arrange a free replacement
3. Escalate for Review — If you believe this decision is in error, reply with your documentation

We value your business and want to make this right. Please reply to this email and we'll work with you personally.

{{store_name}} Customer Care`,
    isCustom: false,
    variables: ['customer_name', 'order_id', 'rejection_reasons', 'return_window', 'non_returnable_note', 'store_credit_amount', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['return', 'rejected', 'policy'],
  },
  {
    id: '10',
    name: 'Refund Processed',
    category: 'Financial',
    description: 'Confirms a refund has been issued and when to expect it.',
    subject: 'Refund of {{refund_amount}} Processed ✓',
    content: `Hi {{customer_name}},

Your refund has been successfully processed!

REFUND DETAILS
━━━━━━━━━━━━━━━━━━━━
Refund ID:      #{{refund_id}}
Original Order: #{{order_id}}
Refund Amount:  {{refund_amount}}
Refund To:      {{payment_method}}
Processed On:   {{process_date}}
Expected By:    {{expected_date}}

Please note that the timing depends on your bank or card issuer — most refunds appear within 3–7 business days. If you don't see it by {{expected_date}}, please contact your bank with reference code: {{reference_code}}

HAVE QUESTIONS?
Contact us anytime at {{support_email}} and we'll be happy to help trace your refund.

We hope to serve you again soon.
{{store_name}} Billing Team`,
    isCustom: false,
    variables: ['customer_name', 'refund_id', 'order_id', 'refund_amount', 'payment_method', 'process_date', 'expected_date', 'reference_code', 'support_email', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['refund', 'financial', 'billing'],
  },
  {
    id: '11',
    name: 'Partial Refund Issued',
    category: 'Financial',
    description: 'For cases where only part of the order amount is refunded.',
    subject: 'Partial Refund of {{refund_amount}} — Order #{{order_id}}',
    content: `Hi {{customer_name}},

A partial refund has been issued for your order #{{order_id}}.

PARTIAL REFUND BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━
Original Order Total:   {{original_amount}}
Refund Issued:          {{refund_amount}}
Remaining Balance:      {{remaining_amount}}
Reason:                 {{refund_reason}}

Items Refunded:
{{refunded_items}}

Items Kept (Not Refunded):
{{kept_items}}

Your refund of {{refund_amount}} will appear on {{payment_method}} within {{refund_timeline}} business days.

If you have questions about this partial refund or believe the amount is incorrect, please reply to this email with your concern and we'll review it promptly.

{{store_name}} Billing Team`,
    isCustom: false,
    variables: ['customer_name', 'order_id', 'original_amount', 'refund_amount', 'remaining_amount', 'refund_reason', 'refunded_items', 'kept_items', 'payment_method', 'refund_timeline', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['refund', 'partial', 'billing'],
  },
  {
    id: '12',
    name: 'Payment Failed',
    category: 'Financial',
    description: 'Alerts customer about a failed payment and urges them to update billing.',
    subject: 'Action Required: Payment Failed for Order #{{order_id}}',
    content: `Hi {{customer_name}},

We were unable to process your payment for order #{{order_id}} and need your help to resolve this.

PAYMENT DETAILS
━━━━━━━━━━━━━━━━━━━━
Order ID:           #{{order_id}}
Amount Due:         {{amount_due}}
Card on File:       ****{{card_last_4}}
Failure Reason:     {{failure_reason}}
Attempt Date:       {{attempt_date}}

WHY THIS MIGHT HAPPEN:
• Insufficient funds
• Card expired or cancelled
• Bank declined the transaction
• Incorrect billing details

WHAT TO DO:
1. Update your payment method here: {{payment_update_url}}
2. Or contact your bank to authorize the charge

⚠️ Your order will be held for {{hold_period}} hours. After that, it may be cancelled automatically.

If you'd like to use a different payment method or need assistance, reply to this email and we'll help immediately.

{{store_name}} Billing Team
{{support_email}}`,
    isCustom: false,
    variables: ['customer_name', 'order_id', 'amount_due', 'card_last_4', 'failure_reason', 'attempt_date', 'payment_update_url', 'hold_period', 'store_name', 'support_email'],
    createdDate: '2024-01-01',
    tags: ['payment', 'failed', 'billing', 'urgent'],
  },
  {
    id: '13',
    name: 'Payment Method Expiring',
    category: 'Financial',
    description: 'Proactive reminder that a saved card is about to expire.',
    subject: 'Your Payment Method is Expiring Soon',
    content: `Hi {{customer_name}},

We noticed that the payment method on your {{store_name}} account is expiring soon.

EXPIRING CARD
━━━━━━━━━━━━━━━━━━━━
Card Type:    {{card_type}}
Last 4 Digits: ****{{card_last_4}}
Expiring:     {{expiry_month}}/{{expiry_year}}

To avoid any interruption to your orders or subscriptions, please update your payment method before {{deadline_date}}:

👉 Update Payment Method: {{payment_update_url}}

It only takes 30 seconds and ensures a smooth checkout experience every time.

If you've already updated your card or no longer wish to save a payment method, you can ignore this email.

Questions? Contact us at {{support_email}}.

{{store_name}} Account Team`,
    isCustom: false,
    variables: ['customer_name', 'store_name', 'card_type', 'card_last_4', 'expiry_month', 'expiry_year', 'deadline_date', 'payment_update_url', 'support_email'],
    createdDate: '2024-01-01',
    tags: ['payment', 'expiry', 'account'],
  },
  {
    id: '14',
    name: 'Subscription Renewal Reminder',
    category: 'Financial',
    description: 'Advance notice before a subscription renews with billing details.',
    subject: 'Your {{plan_name}} Subscription Renews in {{days_until_renewal}} Days',
    content: `Hi {{customer_name}},

This is a friendly reminder that your {{store_name}} {{plan_name}} subscription will automatically renew soon.

RENEWAL SUMMARY
━━━━━━━━━━━━━━━━━━━━
Plan:            {{plan_name}}
Renewal Date:    {{renewal_date}}
Amount:          {{renewal_amount}}
Billed To:       ****{{card_last_4}}

WHAT'S INCLUDED IN YOUR PLAN:
{{plan_features}}

If you're happy with your subscription, no action is needed — we'll handle it automatically.

WANT TO MAKE CHANGES?
• Upgrade your plan: {{upgrade_url}}
• Cancel before {{renewal_date}}: {{cancel_url}}
• Update payment method: {{payment_url}}

Thank you for being a {{store_name}} subscriber. We look forward to continuing to serve you!

{{store_name}} Billing Team
{{support_email}}`,
    isCustom: false,
    variables: ['customer_name', 'store_name', 'plan_name', 'days_until_renewal', 'renewal_date', 'renewal_amount', 'card_last_4', 'plan_features', 'upgrade_url', 'cancel_url', 'payment_url', 'support_email'],
    createdDate: '2024-01-01',
    tags: ['subscription', 'renewal', 'billing'],
  },
  {
    id: '15',
    name: 'Abandoned Cart Recovery',
    category: 'Marketing',
    description: 'Re-engages customers who left items in their cart without completing purchase.',
    subject: 'You left something behind, {{customer_name}} 👀',
    content: `Hi {{customer_name}},

We noticed you left some items in your cart. They're still waiting for you!

ITEMS IN YOUR CART
━━━━━━━━━━━━━━━━━━
{{cart_items}}

Cart Total: {{cart_total}}

Don't let these go — popular items sell out fast.

👉 Complete Your Purchase: {{cart_url}}

STILL ON THE FENCE?
• Free returns within {{return_window}} days — no questions asked
• {{shipping_offer}} on orders over {{shipping_threshold}}
• Secure checkout with 256-bit encryption

As a little nudge, here's a discount code exclusively for you:
🎁 Code: {{promo_code}} — {{discount_amount}} off (expires in {{expiry_hours}} hours)

If you have questions about any product, just reply to this email — we're happy to help.

{{store_name}} Team`,
    isCustom: false,
    variables: ['customer_name', 'cart_items', 'cart_total', 'cart_url', 'return_window', 'shipping_offer', 'shipping_threshold', 'promo_code', 'discount_amount', 'expiry_hours', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['cart', 'abandoned', 'recovery', 'marketing'],
  },
  {
    id: '16',
    name: 'Win-Back Campaign',
    category: 'Marketing',
    description: 'Re-engages customers who haven\'t purchased in a long time.',
    subject: 'We miss you, {{customer_name}} — Here\'s {{discount_amount}} to come back',
    content: `Hi {{customer_name}},

It's been a while since we've seen you at {{store_name}}, and we miss you!

Your last order was back on {{last_order_date}}, and a lot has happened since then.

WHAT'S NEW:
{{new_arrivals}}

We've also made major improvements:
• {{improvement_1}}
• {{improvement_2}}
• {{improvement_3}}

As our way of saying "we miss you," here's an exclusive offer:

🎁 {{discount_amount}} OFF YOUR NEXT ORDER
Code: {{promo_code}}
Valid until: {{expiry_date}}

👉 Shop Now: {{store_url}}

This offer is exclusive to valued customers like you and won't be publicly available.

We'd love to have you back!

With appreciation,
{{store_name}} Team

P.S. If you'd prefer not to receive these emails, you can unsubscribe here: {{unsubscribe_url}}`,
    isCustom: false,
    variables: ['customer_name', 'store_name', 'last_order_date', 'new_arrivals', 'improvement_1', 'improvement_2', 'improvement_3', 'discount_amount', 'promo_code', 'expiry_date', 'store_url', 'unsubscribe_url'],
    createdDate: '2024-01-01',
    tags: ['win-back', 'retention', 'lapsed', 'marketing'],
  },
  {
    id: '17',
    name: 'VIP Customer Exclusive Offer',
    category: 'Marketing',
    description: 'Exclusive deal sent only to top-tier or high-spend customers.',
    subject: '⭐ Exclusive VIP Access — {{customer_name}}, This Is Just For You',
    content: `Hi {{customer_name}},

As one of our most valued VIP customers, you're getting early access to something special before it's available to anyone else.

YOUR VIP PRIVILEGES THIS MONTH:
🏆 {{vip_offer_title}}
{{vip_offer_description}}

VIP EXCLUSIVE CODE: {{vip_code}}
✓ {{vip_discount}} off — no minimum spend
✓ Priority processing — your order ships first
✓ Free express shipping
✓ Valid until: {{offer_expiry}}

👉 Shop Your Exclusive Collection: {{vip_url}}

This offer is not available to the public and has been reserved specifically for VIP members like you.

PLUS, as a VIP member you also get:
• Dedicated support line: {{vip_support}}
• Early access to all new product launches
• Invitations to exclusive events

Thank you for being such an incredible part of the {{store_name}} community. You genuinely make what we do worthwhile.

With gratitude,
{{store_name}} VIP Team`,
    isCustom: false,
    variables: ['customer_name', 'vip_offer_title', 'vip_offer_description', 'vip_code', 'vip_discount', 'offer_expiry', 'vip_url', 'vip_support', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['vip', 'exclusive', 'loyalty', 'high-value'],
  },
  {
    id: '18',
    name: 'Product Back in Stock',
    category: 'Operations',
    description: 'Notifies customers who requested restock alerts that an item is available.',
    subject: '🔔 It\'s back! {{product_name}} is now available',
    content: `Hi {{customer_name}},

You asked us to let you know — and it's finally here! {{product_name}} is back in stock.

PRODUCT DETAILS
━━━━━━━━━━━━━━━━
Product: {{product_name}}
Price:   {{product_price}}
Stock:   {{stock_quantity}} units available
━━━━━━━━━━━━━━━━

⚡ Heads up: This item sold out quickly last time. We recommend acting fast.

👉 Get Yours Now: {{product_url}}

As a thank you for your patience, use code {{promo_code}} for {{discount_amount}} off this item.
(Offer valid for {{offer_hours}} hours only)

If you no longer need this item, you can manage your restock alerts in your account: {{account_url}}

Happy shopping!
{{store_name}} Team`,
    isCustom: false,
    variables: ['customer_name', 'product_name', 'product_price', 'stock_quantity', 'product_url', 'promo_code', 'discount_amount', 'offer_hours', 'account_url', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['restock', 'inventory', 'notification'],
  },
  {
    id: '19',
    name: 'Product Review Request',
    category: 'Marketing',
    description: 'Post-purchase email requesting a product review after delivery.',
    subject: 'How\'s your {{product_name}}? Share your thoughts ⭐',
    content: `Hi {{customer_name}},

We hope you're loving your recent purchase from {{store_name}}!

You ordered: {{product_name}} on {{order_date}}

We'd love to know what you think. Your review helps other shoppers make confident decisions and helps us improve.

⭐⭐⭐⭐⭐ LEAVE A REVIEW
It takes less than 2 minutes:
{{review_url}}

What we'd love to hear about:
• Quality and durability
• Whether it matched the description
• How it compares to your expectations

AS A THANK YOU:
Leave a review this week and receive {{review_reward}} in your account automatically.

🌟 SHARE A PHOTO?
Tag us @{{social_handle}} or use #{{store_hashtag}} on social media — we love seeing our products in the wild!

Thank you for being part of the {{store_name}} community.

The {{store_name}} Team`,
    isCustom: false,
    variables: ['customer_name', 'product_name', 'store_name', 'order_date', 'review_url', 'review_reward', 'social_handle', 'store_hashtag'],
    createdDate: '2024-01-01',
    tags: ['review', 'feedback', 'post-purchase'],
  },
  {
    id: '20',
    name: 'Flash Sale Alert',
    category: 'Marketing',
    description: 'Time-sensitive promotional email for a limited-time sale event.',
    subject: '⚡ FLASH SALE: {{discount_percent}}% Off — {{hours_remaining}} Hours Only!',
    content: `Hi {{customer_name}},

DROP EVERYTHING. Our biggest flash sale of the season just launched — and it ends in {{hours_remaining}} hours.

🔥 {{discount_percent}}% OFF EVERYTHING*
Code: {{promo_code}}
Ends: {{sale_end_time}}

FEATURED DEALS:
{{featured_products}}

👉 SHOP THE SALE NOW: {{sale_url}}

⏰ Countdown: {{hours_remaining}} hours left — don't miss out

TOP PICKS SELLING FAST:
• {{top_pick_1}} — was {{original_price_1}}, now {{sale_price_1}}
• {{top_pick_2}} — was {{original_price_2}}, now {{sale_price_2}}
• {{top_pick_3}} — was {{original_price_3}}, now {{sale_price_3}}

FREE SHIPPING on all orders over {{free_shipping_threshold}} during the sale.

*Excludes {{exclusions}}. Cannot be combined with other offers.

Grab your deals now — quantities are limited!

{{store_name}} Team`,
    isCustom: false,
    variables: ['customer_name', 'discount_percent', 'hours_remaining', 'promo_code', 'sale_end_time', 'featured_products', 'sale_url', 'top_pick_1', 'original_price_1', 'sale_price_1', 'top_pick_2', 'original_price_2', 'sale_price_2', 'top_pick_3', 'original_price_3', 'sale_price_3', 'free_shipping_threshold', 'exclusions', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['sale', 'promotion', 'urgency', 'marketing'],
  },
  {
    id: '21',
    name: 'Loyalty Points Milestone',
    category: 'Marketing',
    description: 'Celebrates a customer hitting a loyalty points milestone.',
    subject: '🎉 Congrats! You\'ve earned {{points_amount}} points, {{customer_name}}',
    content: `Hi {{customer_name}},

You've hit a major milestone — congratulations!

YOUR LOYALTY STATUS
━━━━━━━━━━━━━━━━━━━━
Total Points:     {{total_points}} pts
Current Tier:     {{current_tier}} {{tier_badge}}
Points This Month: {{monthly_points}} pts
Next Tier:        {{next_tier}} ({{points_to_next}} pts away)
━━━━━━━━━━━━━━━━━━━━

🎁 YOUR REWARD: {{reward_description}}
Redeemable at checkout — automatically applied.
Expires: {{reward_expiry}}

WHAT YOUR POINTS CAN GET YOU:
{{points_redemption_options}}

👉 Redeem Points & Shop: {{store_url}}

As a {{current_tier}} member, you also enjoy:
• {{perk_1}}
• {{perk_2}}
• {{perk_3}}

Keep shopping to reach {{next_tier}} status and unlock even more benefits!

Thank you for your loyalty — you're the reason we do what we do.

{{store_name}} Loyalty Program`,
    isCustom: false,
    variables: ['customer_name', 'points_amount', 'total_points', 'current_tier', 'tier_badge', 'monthly_points', 'next_tier', 'points_to_next', 'reward_description', 'reward_expiry', 'points_redemption_options', 'store_url', 'perk_1', 'perk_2', 'perk_3'],
    createdDate: '2024-01-01',
    tags: ['loyalty', 'points', 'reward', 'milestone'],
  },
  {
    id: '22',
    name: 'Support Escalation',
    category: 'Support',
    description: 'Sent when a support ticket is escalated to a senior team or specialist.',
    subject: 'Your Case Has Been Escalated — Ticket #{{ticket_id}}',
    content: `Hi {{customer_name}},

Your support case has been escalated to our senior specialist team and is now our top priority.

ESCALATION DETAILS
━━━━━━━━━━━━━━━━━━━━
Ticket ID:         #{{ticket_id}}
Escalated On:      {{escalation_date}}
Priority Level:    {{priority_level}}
Assigned To:       {{specialist_name}}
Response Deadline: Within {{response_hours}} hours
━━━━━━━━━━━━━━━━━━━━

YOUR ISSUE SUMMARY:
{{issue_summary}}

WHAT HAPPENS NEXT:
{{specialist_name}} will personally review your case and reach out to you by {{response_deadline}}. They have full authority to resolve your issue with any solution needed.

If you need to add more information or context, please reply directly to this email — it goes straight to {{specialist_name}}.

You can also reach our escalations team directly:
📞 {{escalations_phone}}
📧 {{escalations_email}}

We take full responsibility for this experience and are committed to making it right.

{{store_name}} Senior Support`,
    isCustom: false,
    variables: ['customer_name', 'ticket_id', 'escalation_date', 'priority_level', 'specialist_name', 'response_hours', 'response_deadline', 'issue_summary', 'escalations_phone', 'escalations_email', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['escalation', 'support', 'priority'],
  },
  {
    id: '23',
    name: 'Issue Resolved',
    category: 'Support',
    description: 'Confirms a support ticket has been resolved and asks for satisfaction rating.',
    subject: 'Your Issue Has Been Resolved — Ticket #{{ticket_id}}',
    content: `Hi {{customer_name}},

We're happy to let you know that your support case has been resolved!

RESOLUTION SUMMARY
━━━━━━━━━━━━━━━━━━━━
Ticket ID:     #{{ticket_id}}
Resolved On:   {{resolution_date}}
Resolved By:   {{agent_name}}
Resolution:    {{resolution_summary}}
━━━━━━━━━━━━━━━━━━━━

HOW DID WE DO?
Your feedback helps us improve. Please rate this interaction:
⭐ Rate your experience: {{feedback_url}}

NOT SATISFIED?
If you feel this issue isn't fully resolved, simply reply to this email and we'll reopen your case immediately with priority status.

This ticket will be marked resolved in {{auto_close_hours}} hours unless we hear from you.

HELPFUL RESOURCES:
• FAQs: {{faq_url}}
• Returns Policy: {{returns_url}}
• Live Chat: {{chat_url}}

Thank you for your patience throughout this process.

{{agent_name}}
{{store_name}} Customer Support`,
    isCustom: false,
    variables: ['customer_name', 'ticket_id', 'resolution_date', 'agent_name', 'resolution_summary', 'feedback_url', 'auto_close_hours', 'faq_url', 'returns_url', 'chat_url', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['resolved', 'support', 'feedback'],
  },
  {
    id: '24',
    name: 'Chargeback / Dispute Response',
    category: 'Financial',
    description: 'Responds to a customer who filed a chargeback with supporting information.',
    subject: 'Regarding Your Chargeback Dispute — Order #{{order_id}}',
    content: `Hi {{customer_name}},

We received notification that a chargeback dispute has been filed with your bank for order #{{order_id}}.

DISPUTE DETAILS
━━━━━━━━━━━━━━━━━━━━
Order ID:        #{{order_id}}
Amount Disputed: {{dispute_amount}}
Dispute Date:    {{dispute_date}}
━━━━━━━━━━━━━━━━━━━━

We understand issues arise, and we want to resolve this directly with you — quickly and fairly.

WHAT WE FOUND IN OUR RECORDS:
• Order was placed on {{order_date}} and confirmed via {{confirmation_email}}
• Shipped on {{ship_date}} with tracking number {{tracking_number}}
• Delivery confirmed by {{carrier}} on {{delivery_date}} to {{delivery_address}}

IF THERE WAS A PROBLEM WITH YOUR ORDER:
We would much prefer to resolve this directly. Please reply to this email and let us know what went wrong — we can issue a refund or replacement faster than a bank dispute.

If you'd like us to withdraw the dispute response and process a refund directly: {{direct_refund_url}}

Our chargebacks team can be reached at:
📧 {{disputes_email}}
📞 {{disputes_phone}} (Mon-Fri, 9AM-6PM)

{{store_name}} Finance Team`,
    isCustom: false,
    variables: ['customer_name', 'order_id', 'dispute_amount', 'dispute_date', 'order_date', 'confirmation_email', 'ship_date', 'tracking_number', 'carrier', 'delivery_date', 'delivery_address', 'direct_refund_url', 'disputes_email', 'disputes_phone', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['chargeback', 'dispute', 'financial', 'fraud'],
  },
  {
    id: '25',
    name: 'Account Suspended',
    category: 'Security',
    description: 'Notifies a customer that their account has been temporarily suspended.',
    subject: 'Your Account Has Been Temporarily Suspended',
    content: `Hi {{customer_name}},

We regret to inform you that your {{store_name}} account ({{customer_email}}) has been temporarily suspended.

SUSPENSION DETAILS
━━━━━━━━━━━━━━━━━━━━
Suspended On:  {{suspension_date}}
Reason:        {{suspension_reason}}
Duration:      {{suspension_duration}}
━━━━━━━━━━━━━━━━━━━━

During this period, you will not be able to:
• Place new orders
• Access your order history
• Use saved payment methods

WHAT YOU CAN DO:
If you believe this is a mistake, please contact us immediately with your account information and we'll investigate right away.

To appeal this decision:
📧 {{appeals_email}}
📞 {{support_phone}}
Reference: {{case_number}}

If this activity was not initiated by you, your account may have been compromised. We recommend securing any linked email accounts immediately.

We take account security very seriously and appreciate your understanding.

{{store_name}} Trust & Safety Team`,
    isCustom: false,
    variables: ['customer_name', 'store_name', 'customer_email', 'suspension_date', 'suspension_reason', 'suspension_duration', 'appeals_email', 'support_phone', 'case_number'],
    createdDate: '2024-01-01',
    tags: ['account', 'suspended', 'security'],
  },
  {
    id: '26',
    name: 'Suspicious Activity Alert',
    category: 'Security',
    description: 'Alerts customer about suspicious order or account activity for verification.',
    subject: '⚠️ Suspicious Activity Detected on Your Account',
    content: `Hi {{customer_name}},

We detected unusual activity on your {{store_name}} account and have temporarily flagged it for review.

ACTIVITY DETECTED
━━━━━━━━━━━━━━━━━━━━
Date/Time:    {{activity_date}}
IP Address:   {{ip_address}}
Location:     {{location}}
Activity:     {{suspicious_activity}}
━━━━━━━━━━━━━━━━━━━━

WAS THIS YOU?
If yes, no action needed — we'll clear the flag automatically in {{auto_clear_hours}} hours.

If NO, act immediately:
1. Reset your password: {{password_reset_url}}
2. Review recent orders: {{orders_url}}
3. Contact us: {{security_email}}

FOR YOUR SECURITY, WE HAVE:
• Paused processing on any new orders from this session
• Notified our fraud prevention team
• Logged this activity for investigation

Your account security is our top priority. If you have any questions or concerns, our security team is available 24/7 at {{security_email}}.

{{store_name}} Security Team`,
    isCustom: false,
    variables: ['customer_name', 'store_name', 'activity_date', 'ip_address', 'location', 'suspicious_activity', 'auto_clear_hours', 'password_reset_url', 'orders_url', 'security_email'],
    createdDate: '2024-01-01',
    tags: ['security', 'fraud', 'alert', 'verification'],
  },
  {
    id: '27',
    name: 'Wholesale Partner Welcome',
    category: 'B2B',
    description: 'Onboards a new wholesale buyer or B2B partner.',
    subject: 'Welcome to {{store_name}} Wholesale — Your Account is Ready',
    content: `Hi {{contact_name}},

Welcome to {{store_name}} Wholesale! We're excited to have {{company_name}} as an official retail partner.

YOUR WHOLESALE ACCOUNT
━━━━━━━━━━━━━━━━━━━━━━
Account ID:        {{account_id}}
Account Type:      {{account_type}}
Credit Limit:      {{credit_limit}}
Payment Terms:     Net {{payment_terms}} days
Wholesale Portal:  {{portal_url}}
━━━━━━━━━━━━━━━━━━━━━━

YOUR LOGIN CREDENTIALS:
Email:    {{login_email}}
Temp Password: {{temp_password}}
(Please change this on first login)

WHAT'S AVAILABLE TO YOU:
• Minimum Order Quantity (MOQ): {{moq}}
• Volume discount tiers: {{discount_tiers}}
• Dedicated account manager: {{account_manager}}
• Direct line: {{manager_phone}}
• Wholesale catalog: {{catalog_url}}

GETTING STARTED:
1. Log into your portal: {{portal_url}}
2. Review our wholesale terms: {{terms_url}}
3. Browse the wholesale catalog and place your first order

Your dedicated account manager {{account_manager}} will reach out within {{onboarding_hours}} hours to walk you through everything.

Looking forward to a strong partnership,
{{store_name}} Wholesale Team`,
    isCustom: false,
    variables: ['contact_name', 'company_name', 'store_name', 'account_id', 'account_type', 'credit_limit', 'payment_terms', 'portal_url', 'login_email', 'temp_password', 'moq', 'discount_tiers', 'account_manager', 'manager_phone', 'catalog_url', 'terms_url', 'onboarding_hours'],
    createdDate: '2024-01-01',
    tags: ['wholesale', 'b2b', 'onboarding', 'partner'],
  },
  {
    id: '28',
    name: 'Bulk Order Confirmation',
    category: 'B2B',
    description: 'Confirms a large wholesale or bulk purchase with detailed breakdown.',
    subject: 'Bulk Order Confirmed — PO #{{po_number}} | {{company_name}}',
    content: `Dear {{contact_name}},

Thank you for your bulk order. This email serves as your official order confirmation.

PURCHASE ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━
PO Number:         {{po_number}}
Company:           {{company_name}}
Order Date:        {{order_date}}
Account Manager:   {{account_manager}}

ORDER SUMMARY:
{{order_line_items}}

FINANCIAL SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━
Subtotal:          {{subtotal}}
Volume Discount:   -{{volume_discount}}
Shipping:          {{shipping_cost}}
Tax:               {{tax_amount}}
TOTAL DUE:         {{total_amount}}

PAYMENT TERMS: Net {{payment_terms}} days
Payment Due: {{payment_due_date}}
Invoice: {{invoice_url}}

FULFILLMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━
Processing Time:   {{processing_days}} business days
Estimated Ship:    {{estimated_ship_date}}
Ship To:           {{shipping_address}}
Delivery Method:   {{delivery_method}}

Please review this order and confirm accuracy within {{confirmation_hours}} hours. Any discrepancies should be reported immediately to {{account_manager}} at {{manager_email}}.

{{store_name}} Wholesale Division`,
    isCustom: false,
    variables: ['contact_name', 'po_number', 'company_name', 'order_date', 'account_manager', 'order_line_items', 'subtotal', 'volume_discount', 'shipping_cost', 'tax_amount', 'total_amount', 'payment_terms', 'payment_due_date', 'invoice_url', 'processing_days', 'estimated_ship_date', 'shipping_address', 'delivery_method', 'confirmation_hours', 'manager_email', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['bulk', 'wholesale', 'b2b', 'purchase order'],
  },
  {
    id: '29',
    name: 'Product Discontinued Notice',
    category: 'Operations',
    description: 'Notifies customers subscribed to or purchasing a product being discontinued.',
    subject: 'Important: {{product_name}} Will Be Discontinued',
    content: `Hi {{customer_name}},

We want to give you advance notice that {{product_name}} will be discontinued from our catalog.

DISCONTINUATION DETAILS
━━━━━━━━━━━━━━━━━━━━
Product:          {{product_name}}
SKU:              {{product_sku}}
Last Order Date:  {{last_order_date}}
Reason:           {{discontinuation_reason}}
━━━━━━━━━━━━━━━━━━━━

We know you've loved this product, and we want to help you plan ahead. Stock is limited — once it's gone, it's gone.

👉 Order Your Last Stock Now: {{product_url}}

RECOMMENDED ALTERNATIVES:
We think you'll love these similar products:
• {{alternative_1}} — {{alt_1_description}} — {{alt_1_price}}
• {{alternative_2}} — {{alt_2_description}} — {{alt_2_price}}
• {{alternative_3}} — {{alt_3_description}} — {{alt_3_price}}

USE CODE {{promo_code}} for {{discount_amount}} off any alternative product — our way of saying thank you for your loyalty.

If you have bulk or long-term needs for this product, please contact us at {{support_email}} and we'll try to accommodate special orders.

{{store_name}} Product Team`,
    isCustom: false,
    variables: ['customer_name', 'product_name', 'product_sku', 'last_order_date', 'discontinuation_reason', 'product_url', 'alternative_1', 'alt_1_description', 'alt_1_price', 'alternative_2', 'alt_2_description', 'alt_2_price', 'alternative_3', 'alt_3_description', 'alt_3_price', 'promo_code', 'discount_amount', 'support_email', 'store_name'],
    createdDate: '2024-01-01',
    tags: ['discontinued', 'product', 'operations'],
  },
  {
    id: '30',
    name: 'Seasonal Holiday Promotion',
    category: 'Marketing',
    description: 'Holiday-themed promotional email for seasonal campaigns.',
    subject: '🎄 {{holiday_name}} Special — {{discount_percent}}% Off Storewide',
    content: `Hi {{customer_name}},

The holidays are here, and we're celebrating with our biggest sale of the year!

🎁 {{holiday_name}} SALE
{{discount_percent}}% OFF EVERYTHING SITEWIDE

USE CODE: {{promo_code}}
Valid: {{sale_start}} — {{sale_end}}

{{holiday_message}}

HOLIDAY BESTSELLERS:
{{featured_products}}

👉 Shop the {{holiday_name}} Sale: {{sale_url}}

GIFT SERVICES (Free this season!):
🎀 Gift wrapping on all orders
📝 Personalized gift messages
🚀 Express shipping available — guaranteed delivery by {{guaranteed_date}}

LAST-MINUTE ORDERING:
• Order by {{standard_deadline}} for standard delivery
• Order by {{express_deadline}} for express delivery
• Digital gift cards available for same-day delivery: {{gift_card_url}}

FREE SHIPPING on all orders over {{free_shipping_threshold}}.

Wishing you and your loved ones a wonderful {{holiday_name}}!

The {{store_name}} Team

P.S. Need gift ideas? Our gift guide is here to help: {{gift_guide_url}}`,
    isCustom: false,
    variables: ['customer_name', 'holiday_name', 'discount_percent', 'promo_code', 'sale_start', 'sale_end', 'holiday_message', 'featured_products', 'sale_url', 'guaranteed_date', 'standard_deadline', 'express_deadline', 'gift_card_url', 'free_shipping_threshold', 'store_name', 'gift_guide_url'],
    createdDate: '2024-01-01',
    tags: ['holiday', 'seasonal', 'sale', 'marketing'],
  },
];
