/**
 * WhatsApp Messaging Utility & API Client for Vouchiqo
 *
 * Supports:
 * 1. Meta WhatsApp Business Cloud API (Official Graph API)
 * 2. Twilio WhatsApp API (Secondary fallback)
 * 3. WhatsApp wa.me Universal Deep Links (Zero-cost instant messaging)
 * 4. Automatic Indian / International phone number normalization (E.164)
 */

export const VOUCHIQO_SUPPORT_WHATSAPP =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ||
  process.env.SUPPORT_WHATSAPP ||
  "917997443334";

/**
 * Clean and format mobile number to standard international digits (without symbols)
 * Defaults to country code 91 (India) for 10-digit mobile numbers.
 *
 * @param {string} phone
 * @returns {string} E.g. "917997443334"
 */
export function sanitizeWhatsAppNumber(phone) {
  if (!phone) return "";
  let clean = String(phone).replace(/\D/g, "");

  // If 10 digits (standard Indian mobile), prepend 91
  if (clean.length === 10) {
    clean = `91${clean}`;
  }
  // If starts with 0 and has 11 digits, strip leading 0 and prepend 91
  else if (clean.length === 11 && clean.startsWith("0")) {
    clean = `91${clean.slice(1)}`;
  }

  return clean;
}

/**
 * Generate a direct universal click-to-chat WhatsApp deep link.
 *
 * @param {{ phone?: string, message?: string }} options
 * @returns {string} E.g. "https://wa.me/917997443334?text=Hello"
 */
export function getWhatsAppDeepLink({ phone = VOUCHIQO_SUPPORT_WHATSAPP, message = "" } = {}) {
  const cleanPhone = sanitizeWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(message || "");
  return `https://wa.me/${cleanPhone}${encodedText ? `?text=${encodedText}` : ""}`;
}

/**
 * Check whether Meta WhatsApp Cloud API credentials are configured in environment.
 */
export function isWhatsAppCloudConfigured() {
  const token =
    process.env.WHATSAPP_TOKEN ||
    process.env.META_WHATSAPP_TOKEN ||
    process.env.WHATSAPP_API_KEY;
  const phoneId =
    process.env.WHATSAPP_PHONE_NUMBER_ID ||
    process.env.META_PHONE_NUMBER_ID;

  return Boolean(token && phoneId);
}

/**
 * Check whether Twilio WhatsApp credentials are configured.
 */
export function isTwilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_NUMBER,
  );
}

/**
 * Send a WhatsApp message via Meta Cloud API, Twilio, or fallback to deep link.
 *
 * @param {{
 *   to: string,
 *   message: string,
 *   templateName?: string,
 *   templateLanguage?: string,
 *   templateComponents?: Array
 * }} options
 */
export async function sendWhatsAppMessage({
  to,
  message,
  templateName,
  templateLanguage = "en_US",
  templateComponents = [],
}) {
  const recipient = sanitizeWhatsAppNumber(to);
  if (!recipient) {
    return {
      success: false,
      error: "Recipient phone number is invalid or missing.",
    };
  }

  // 1. Try Meta WhatsApp Cloud API if configured
  if (isWhatsAppCloudConfigured()) {
    const token =
      process.env.WHATSAPP_TOKEN ||
      process.env.META_WHATSAPP_TOKEN ||
      process.env.WHATSAPP_API_KEY;
    const phoneId =
      process.env.WHATSAPP_PHONE_NUMBER_ID ||
      process.env.META_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || "v19.0";

    const payload = templateName
      ? {
          messaging_product: "whatsapp",
          to: recipient,
          type: "template",
          template: {
            name: templateName,
            language: { code: templateLanguage },
            components: templateComponents,
          },
        }
      : {
          messaging_product: "whatsapp",
          to: recipient,
          type: "text",
          text: { preview_url: true, body: message },
        };

    try {
      const response = await fetch(
        `https://graph.facebook.com/${apiVersion}/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const json = await response.json();
      if (response.ok && json.messages?.[0]?.id) {
        return {
          success: true,
          provider: "meta_cloud_api",
          messageId: json.messages[0].id,
          recipient,
        };
      }

      console.warn("[WhatsApp Cloud API Error]:", json?.error || json);
    } catch (err) {
      console.error("[WhatsApp Cloud API Dispatch Failed]:", err);
    }
  }

  // 2. Try Twilio WhatsApp if configured
  if (isTwilioConfigured()) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    try {
      const basicAuth = Buffer.from(`${sid}:${auth}`).toString("base64");
      const formParams = new URLSearchParams({
        From: fromNumber.startsWith("whatsapp:")
          ? fromNumber
          : `whatsapp:${fromNumber}`,
        To: `whatsapp:+${recipient}`,
        Body: message,
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formParams.toString(),
        },
      );

      const json = await response.json();
      if (response.ok && json.sid) {
        return {
          success: true,
          provider: "twilio",
          messageId: json.sid,
          recipient,
        };
      }

      console.warn("[Twilio WhatsApp Error]:", json);
    } catch (err) {
      console.error("[Twilio WhatsApp Dispatch Failed]:", err);
    }
  }

  // 3. Fallback: Generate deep link & return simulated response
  const deepLink = getWhatsAppDeepLink({ phone: recipient, message });
  console.log(
    `[WhatsApp Mock Dispatch] To: +${recipient} | DeepLink: ${deepLink} | Message: "${message?.slice(0, 80)}..."`,
  );

  return {
    success: true,
    provider: "deep_link_fallback",
    simulated: true,
    deepLink,
    recipient,
    message: "WhatsApp message logged; deep-link generated for delivery.",
  };
}
