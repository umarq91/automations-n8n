import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Sample values substituted for each known variable during a test send.
// Any unknown variable falls back to a generic placeholder.
const SAMPLE_VALUES: Record<string, string> = {
  customer_name:   'Alex Johnson',
  first_name:      'Alex',
  last_name:       'Johnson',
  order_id:        'ORD-28471',
  order_number:    '#28471',
  order_date:      'April 12, 2025',
  tracking_number: '1Z999AA10123456784',
  product_name:    'Classic Crew Neck Tee (Black, L)',
  company_name:    'Acme Store',
  store_name:      'Acme Store',
  support_agent:   'Sarah M.',
  refund_amount:   '$47.99',
  ticket_id:       'TKT-9923',
  issue_type:      'Missing Package',
  email:           '', // filled dynamically from recipient
};

function fillVariables(text: string, recipientEmail: string): string {
  const values = { ...SAMPLE_VALUES, email: recipientEmail };
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return values[key] ?? `[${key.replace(/_/g, ' ')}]`;
  });
}

interface SendTestEmailBody {
  to: string;
  subject: string;
  html_body: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ ok: false, message: 'Email service is not configured (RESEND_API_KEY missing).' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: SendTestEmailBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, message: 'Invalid JSON body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { to, subject, html_body } = body;
  if (!to || !subject || !html_body) {
    return new Response(JSON.stringify({ ok: false, message: 'Missing required fields: to, subject, html_body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const filledSubject  = fillVariables(subject, to);
  const filledHtmlBody = fillVariables(html_body, to);

  // Wrap in a minimal test banner so the recipient knows it's a preview
  const wrappedHtml = `
    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:10px 16px;margin-bottom:16px;font-family:sans-serif;font-size:13px;color:#856404;">
      <strong>Test preview</strong> — variables have been replaced with sample data.
    </div>
    ${filledHtmlBody}
  `;

  let resendRes: Response;
  try {
    resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Automn <onboarding@resend.dev>',
        to: [to],
        subject: `[Test] ${filledSubject}`,
        html: wrappedHtml,
      }),
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, message: 'Failed to reach email provider.' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!resendRes.ok) {
    const errBody = await resendRes.text();
    return new Response(JSON.stringify({ ok: false, message: `Email provider error: ${errBody}` }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true, message: `Test email sent to ${to}.` }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
