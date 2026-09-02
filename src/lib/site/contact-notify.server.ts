/** Στέλνει ειδοποίηση νέου μηνύματος επικοινωνίας μέσω Gmail (connector gateway). */
const TO_EMAIL = 'aik33sant@gmail.com';
const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_mail/gmail/v1';

const b64 = (s: string) =>
  btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(''));
const header = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);

export async function notifyContactMessage(data: {
  name: string;
  email: string;
  subject?: string | undefined;
  message: string;
  lang: string;
}) {
  const lovableKey = process.env['LOVABLE_API_KEY'];
  const connKey = process.env['GOOGLE_MAIL_API_KEY'];
  if (!lovableKey || !connKey) {
    return { notified: false as const, reason: 'not_configured' as const };
  }

  const subject = `Νέο μήνυμα επικοινωνίας: ${data.subject || data.name}`;
  const body = [
    `Όνομα: ${data.name}`,
    `Email: ${data.email}`,
    `Θέμα: ${data.subject || '—'}`,
    `Γλώσσα: ${data.lang}`,
    '',
    data.message,
  ].join('\r\n');

  const raw = [
    `To: ${TO_EMAIL}`,
    `Reply-To: ${header(data.name)} <${data.email}>`,
    `Subject: ${header(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
  ].join('\r\n');

  const encoded = b64(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  try {
    const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        'X-Connection-Api-Key': connKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    });
    if (!res.ok) {
      console.error(`[contact-notify] gmail failed [${res.status}]: ${await res.text()}`);
      return { notified: false as const, reason: 'send_failed' as const };
    }
    return { notified: true as const };
  } catch (err) {
    console.error('[contact-notify] gmail error', err);
    return { notified: false as const, reason: 'send_failed' as const };
  }
}
