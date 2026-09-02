/** Στέλνει ειδοποίηση νέου μηνύματος επικοινωνίας με e-mail (Brevo API). */
const TO_EMAIL = 'aik33sant@gmail.com';

export async function notifyContactMessage(data: {
  name: string;
  email: string;
  subject?: string | undefined;
  message: string;
  lang: string;
}) {
  const apiKey = process.env['BREVO_API_KEY'];
  const senderEmail = process.env['BREVO_SENDER_EMAIL'] ?? TO_EMAIL;
  if (!apiKey) return { notified: false as const, reason: 'not_configured' as const };

  const body = {
    sender: { name: 'MyZodiacMaps', email: senderEmail },
    to: [{ email: TO_EMAIL }],
    replyTo: { email: data.email, name: data.name },
    subject: `Νέο μήνυμα επικοινωνίας: ${data.subject || data.name}`,
    textContent: [
      `Όνομα: ${data.name}`,
      `Email: ${data.email}`,
      `Θέμα: ${data.subject || '—'}`,
      `Γλώσσα: ${data.lang}`,
      '',
      data.message,
    ].join('\n'),
  };

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`[contact-notify] brevo failed [${res.status}]: ${await res.text()}`);
      return { notified: false as const, reason: 'send_failed' as const };
    }
    return { notified: true as const };
  } catch (err) {
    console.error('[contact-notify] brevo error', err);
    return { notified: false as const, reason: 'send_failed' as const };
  }
}
