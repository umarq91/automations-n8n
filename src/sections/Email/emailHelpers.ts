export const CATEGORY_GROUPS = [
  {
    label: 'Customer Issues',
    items: [
      'Quality Issue', 'Wrong Item', 'Color Mismatch', 'Sizing Complaint',
      'Missing Package', 'Partial Order', 'Shipping Delay', 'Customs Hold',
      'Refund Delayed', 'Active Dispute', 'Escalation Threat',
      'Order Not Found', 'Sizing Inquiry', 'Misdirected Email',
      'Repeat Contact', 'Privacy Breach', 'Positive Feedback',
    ],
  },
  {
    label: 'Order Status',
    items: ['Order Status'],
  },
  {
    label: 'Business',
    items: ['Transactional', 'Returns & Refunds', 'Financial', 'Support', 'Marketing', 'Security', 'Operations', 'B2B'],
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Quality Issue':      'bg-amber-500/10  text-amber-400',
  'Wrong Item':         'bg-red-500/10    text-red-400',
  'Color Mismatch':     'bg-orange-500/10 text-orange-400',
  'Sizing Complaint':   'bg-amber-500/10  text-amber-400',
  'Missing Package':    'bg-red-500/10    text-red-400',
  'Partial Order':      'bg-amber-500/10  text-amber-400',
  'Refund Delayed':     'bg-amber-500/10  text-amber-400',
  'Active Dispute':     'bg-red-500/10    text-red-400',
  'Escalation Threat':  'bg-red-500/10    text-red-400',
  'Order Not Found':    'bg-blue-500/10   text-blue-400',
  'Sizing Inquiry':     'bg-blue-500/10   text-blue-400',
  'Shipping Delay':     'bg-blue-500/10   text-blue-400',
  'Customs Hold':       'bg-amber-500/10  text-amber-400',
  'Misdirected Email':  'bg-ds-hover      text-ds-text2',
  'Repeat Contact':     'bg-red-500/10    text-red-400',
  'Privacy Breach':     'bg-red-500/10    text-red-400',
  'Positive Feedback':  'bg-emerald-500/10 text-emerald-400',
  'Order Status':       'bg-blue-500/10   text-blue-400',
  Transactional:        'bg-indigo-500/10 text-indigo-400',
  'Returns & Refunds':  'bg-amber-500/10  text-amber-400',
  Financial:            'bg-emerald-500/10 text-emerald-400',
  Support:              'bg-blue-500/10   text-blue-400',
  Marketing:            'bg-pink-500/10   text-pink-400',
  Security:             'bg-red-500/10    text-red-400',
  Operations:           'bg-ds-hover      text-ds-text2',
  B2B:                  'bg-violet-500/10 text-violet-400',
};

export function varLabel(v: string): string {
  const map: Record<string, string> = {
    customer_name: 'Customer Name',
    first_name: 'First Name',
    last_name: 'Last Name',
    order_id: 'Order ID',
    order_number: 'Order #',
    order_date: 'Order Date',
    tracking_number: 'Tracking #',
    product_name: 'Product Name',
    company_name: 'Company',
    support_agent: 'Agent Name',
    refund_amount: 'Refund Amount',
    ticket_id: 'Ticket ID',
    email: 'Email Address',
    store_name: 'Store Name',
    issue_type: 'Issue Type',
  };
  return map[v] ?? v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
