/** Στέλνει ειδοποίηση νέου μηνύματος επικοινωνίας στο Telegram (αν έχει ρυθμιστεί). */
export async function notifyContactMessage(data: {
  name: string;
  email: string;
  subject?: string | undefined;
  message: string;
  lang: string;
}) {
  const token = process.env['TELEGRAM_BOT_TOKEN'];
  const chatId = process.env['TELEGRAM_CHAT_ID'];
  if (!token || !chatId) return { notified: false as const, reason: 'not_configured' as const };

  const text = [
    '📬 Νέο μήνυμα επικοινωνίας',
    `Όνομα: ${data.name}`,
    `Email: ${data.email}`,
    `Θέμα: ${data.subject || '—'}`,
    `Γλώσσα: ${data.lang}`,
    '',
    data.message,
  ].join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!res.ok) {
      console.error(`[contact-notify] telegram failed [${res.status}]: ${await res.text()}`);
      return { notified: false as const, reason: 'send_failed' as const };
    }
    return { notified: true as const };
  } catch (err) {
    console.error('[contact-notify] telegram error', err);
    return { notified: false as const, reason: 'send_failed' as const };
  }
}
