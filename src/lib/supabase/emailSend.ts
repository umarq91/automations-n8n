import { supabase } from './client';

export async function sendTestEmail(payload: {
  to: string;
  subject: string;
  html_body: string;
}): Promise<{ ok: boolean; message: string }> {
  const { data, error } = await supabase.functions.invoke('send-test-email', {
    body: payload,
  });
  if (error) return { ok: false, message: error.message ?? 'Failed to send test email.' };
  return data as { ok: boolean; message: string };
}
