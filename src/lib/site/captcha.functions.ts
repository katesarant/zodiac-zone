import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Επιστρέφει νέα ερώτηση CAPTCHA για τη φόρμα επικοινωνίας. */
export const getCaptchaChallenge = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ lang: z.enum(["el", "en"]).default("el") }).parse(data))
  .handler(async ({ data }) => {
    const { createChallenge } = await import("./captcha.server");
    return createChallenge(data.lang);
  });
