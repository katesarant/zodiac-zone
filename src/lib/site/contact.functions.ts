import { createServerFn } from "@tanstack/react-start";

import { contactSchema } from "./contact-schema";

/** Αποθηκεύει το μήνυμα επικοινωνίας και ειδοποιεί με email (όταν είναι ενεργό το email domain). */
export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.website) throw new Error("spam_detected");

    const { verifyChallenge } = await import("./captcha.server");
    const ok = await verifyChallenge(data.captchaToken, data.captchaAnswer);
    if (!ok) throw new Error("captcha_failed");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      message: data.message,
      lang: data.lang,
    });

    if (error) throw new Error("insert_failed");

    const { notifyContactMessage } = await import("./contact-notify.server");
    await notifyContactMessage(data);

    return { ok: true as const };
  });

