import { Resend } from "resend";
import { env } from "../utils/env.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const isProduction = process.env.NODE_ENV === "production";

const NOREPLY_EMAIL =
  process.env.EMAIL_FROM ||
  (isProduction ? "Vouchiqo <noreply@vouchiqo.com>" : "Vouchiqo <onboarding@resend.dev>");
const MERCHANT_EMAIL =
  process.env.EMAIL_FROM_MERCHANT ||
  process.env.EMAIL_FROM ||
  (isProduction ? "Vouchiqo Merchant <merchant@vouchiqo.com>" : "Vouchiqo Merchant <onboarding@resend.dev>");

// Base Vouchiqo HTML Email Template wrapper
function renderHtmlWrapper({ title, previewText, bodyContent }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #0f172a; }
    .email-container { max-width: 580px; margin: 20px auto; background: #ffffff; border-radius: 6px; overflow: hidden; border: 1px solid #e2e8f0; }
    .email-header { background: #0f172a; border-top: 3px solid #2563eb; padding: 18px 22px; text-align: center; }
    .email-logo { font-size: 20px; font-weight: 600; color: #ffffff; text-decoration: none; }
    .email-logo span { color: #38bdf8; }
    .email-body { padding: 24px 22px; line-height: 1.6; font-size: 14px; color: #334155; font-weight: 400; }
    .email-title { font-size: 17px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 10px; }
    .cta-button { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 500; font-size: 13px; text-decoration: none; padding: 9px 20px; border-radius: 4px; margin-top: 16px; text-align: center; }
    .email-footer { background-color: #f8fafc; padding: 16px 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .code-box { background: #f8fafc; border: 1px dashed #2563eb; padding: 12px; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 600; color: #1d4ed8; letter-spacing: 2px; text-align: center; margin: 14px 0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header" style="background: #0f172a; border-top: 3px solid #2563eb; padding: 18px 22px; display: table; width: 100%; box-sizing: border-box;">
      <a href="https://vouchiqo.com" class="email-logo">Vouch<span>iqo</span></a>
      <span style="font-size: 11px; font-weight: 400; color: #94a3b8; float: right; margin-top: 4px;">Verified Deals and Offers</span>
    </div>
    <div class="email-body">
      ${bodyContent}
    </div>
    <div class="email-footer">
      © 2026 Vouchiqo<br>
      You are receiving this email regarding your Vouchiqo account activity.
    </div>
  </div>
</body>
</html>`;
}

// Low-level send mail dispatcher via Resend
export async function sendEmail({ to, from = NOREPLY_EMAIL, subject, html }) {
  if (!to) {
    console.warn("[sendEmail Warning]: Skipping dispatch - missing recipient 'to' email address.");
    return { success: false, deliveredDirectly: false, error: "Missing recipient 'to' email address" };
  }

  if (!resend || !RESEND_API_KEY || RESEND_API_KEY === "re_dummy_key_for_build") {
    console.log(
      `[Email Mock Dispatch] To: ${to} | From: ${from} | Subject: ${subject}`,
    );
    return { success: true, deliveredDirectly: false, mocked: true };
  }

  const devRecipient = process.env.EMAIL_DEV_RECIPIENT || env.EMAIL_DEV_RECIPIENT || "vouchiqo@gmail.com";

  // 1. Try sending directly to the target recipient's email address ('to')
  try {
    const res = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (res?.error) {
      console.error(`[Resend Base Email Error]:`, res.error);
      const errMsg = res.error.message || res.error.name || String(res.error);
      const errName = res.error.name || "";

      if (
        errName === "validation_error" ||
        errMsg.toLowerCase().includes("validation_error") ||
        errMsg.toLowerCase().includes("testing email address") ||
        errMsg.toLowerCase().includes("testing emails to your own email address") ||
        errMsg.toLowerCase().includes("invalid `to` field") ||
        errMsg.toLowerCase().includes("not verified") ||
        errMsg.toLowerCase().includes("verify your domain") ||
        errMsg.toLowerCase().includes("must verify") ||
        errMsg.toLowerCase().includes("unverified")
      ) {
        console.warn(
          `[Resend Sandbox Notice]: Cannot send directly to '${to}' using domain '${from}'.\n` +
          `-> Reason: ${errMsg}\n` +
          `-> Sandbox Fallback: Retrying dispatch using 'onboarding@resend.dev' to dev owner email '${devRecipient}'.`
        );

        try {
          let fallbackRes = await resend.emails.send({
            from: "Vouchiqo <onboarding@resend.dev>",
            to: devRecipient,
            subject: `[Dev Sandbox Redirect for ${to}] ${subject}`,
            html,
          });

          if (fallbackRes?.error) {
            console.error("[Resend Sandbox Fallback Error]:", fallbackRes.error);
            return { success: false, deliveredDirectly: false, error: fallbackRes.error.message || String(fallbackRes.error) };
          }
          return {
            success: true,
            data: fallbackRes.data,
            deliveredDirectly: false,
            fallbackUsed: true,
            redirectedTo: devRecipient,
            originalRecipient: to,
            reason: errMsg,
          };
        } catch (fbErr) {
          console.error("[Resend Sandbox Exception]:", fbErr);
          return { success: false, deliveredDirectly: false, error: fbErr.message };
        }
      }

      if (errMsg.includes("daily email sending quota") || res.error.name === "daily_quota_exceeded") {
        console.warn(`⚠️ [Resend Quota Warning]: Daily quota reached on Resend account. Email to ${to} queued.`);
      }

      return { success: false, deliveredDirectly: false, error: errMsg };
    }

    console.log(`[Resend Email Success]: Dispatched directly to ${to}`);
    return { success: true, data: res.data, deliveredDirectly: true, to };
  } catch (err) {
    const errMsg = err?.message || String(err);
    console.error("Failed to send email via Resend:", err);
    return { success: false, deliveredDirectly: false, error: errMsg };
  }
}

// ─────────────────────────────────────────────
// 15 EMAIL NOTIFICATION IMPLEMENTATIONS
// ─────────────────────────────────────────────

// 1. Merchant registration submitted -> Admin
export async function sendMerchantRegistrationSubmittedEmail({
  businessName,
  reviewUrl,
}) {
  const html = renderHtmlWrapper({
    title: `New Merchant Registration: ${businessName}`,
    bodyContent: `
      <h2 class="email-title">New Merchant Registration Submitted</h2>
      <p>Merchant partner <strong>${businessName}</strong> has submitted a new onboarding application for review.</p>
      <a href="${reviewUrl || "https://vouchiqo.com/admin/merchants"}" class="cta-button">Review Application →</a>
    `,
  });
  return sendEmail({
    to: "admin@vouchiqo.com",
    from: MERCHANT_EMAIL,
    subject: `New Merchant Registration: ${businessName}`,
    html,
  });
}

// 2. Merchant registration approved -> Merchant
export async function sendMerchantRegistrationApprovedEmail({
  email,
  businessName,
  loginUrl,
}) {
  const html = renderHtmlWrapper({
    title: "Welcome to Vouchiqo!",
    bodyContent: `
      <h2 class="email-title">Welcome to Vouchiqo, ${businessName}!</h2>
      <p>Great news! Your merchant registration application has been approved and your dashboard is now fully active.</p>
      <a href="${loginUrl || "https://vouchiqo.com/merchant/dashboard"}" class="cta-button">Access Merchant Dashboard →</a>
    `,
  });
  return sendEmail({
    to: email,
    from: MERCHANT_EMAIL,
    subject: "Welcome to Vouchiqo! Your Dashboard is Now Active",
    html,
  });
}

// 3. Merchant registration rejected -> Merchant
export async function sendMerchantRegistrationRejectedEmail({
  email,
  reason,
  reapplyUrl,
}) {
  const html = renderHtmlWrapper({
    title: "Vouchiqo Application Status Update",
    bodyContent: `
      <h2 class="email-title">Merchant Application Status Update</h2>
      <p>Thank you for applying to Vouchiqo. At this time, your application was not approved for the following reason:</p>
      <blockquote style="background: #f1f5f9; padding: 12px; border-left: 4px solid #ef4444; border-radius: 4px;">${reason}</blockquote>
      <p>You can update your business details and reapply below:</p>
      <a href="${reapplyUrl || "https://vouchiqo.com/merchant/register"}" class="cta-button">Update & Reapply →</a>
    `,
  });
  return sendEmail({
    to: email,
    from: MERCHANT_EMAIL,
    subject: "Vouchiqo Merchant Application Status Update",
    html,
  });
}

// 4. Offer submitted for review -> Merchant
export async function sendOfferSubmittedEmail({ email, code }) {
  const html = renderHtmlWrapper({
    title: `Offer ${code} Under Review`,
    bodyContent: `
      <h2 class="email-title">Offer Submitted for Verification</h2>
      <p>Your new offer listing (Code: <strong>${code}</strong>) has been submitted for quality verification. It is expected to go live within 4 hours.</p>
    `,
  });
  return sendEmail({
    to: email,
    from: MERCHANT_EMAIL,
    subject: `Offer [${code}] Submitted for Review`,
    html,
  });
}

// 5. Offer approved and live -> Merchant
export async function sendOfferApprovedEmail({ email, code, listingUrl }) {
  const html = renderHtmlWrapper({
    title: `Offer ${code} is Live!`,
    bodyContent: `
      <h2 class="email-title">Your Offer is Live on Vouchiqo! 🎉</h2>
      <p>Your offer code <strong>${code}</strong> has passed verification and is now live to customers.</p>
      <a href="${listingUrl || "https://vouchiqo.com/coupons"}" class="cta-button">View Live Listing →</a>
    `,
  });
  return sendEmail({
    to: email,
    from: MERCHANT_EMAIL,
    subject: `Your Offer [${code}] is Now Live on Vouchiqo!`,
    html,
  });
}

// 6. Offer rejected -> Merchant
export async function sendOfferRejectedEmail({ email, code, reason, editUrl }) {
  const html = renderHtmlWrapper({
    title: `Offer ${code} Requires Changes`,
    bodyContent: `
      <h2 class="email-title">Offer Review Feedback</h2>
      <p>Your offer code <strong>${code}</strong> requires changes before publishing:</p>
      <blockquote style="background: #f1f5f9; padding: 12px; border-left: 4px solid #f59e0b; border-radius: 4px;">${reason}</blockquote>
      <a href="${editUrl || "https://vouchiqo.com/merchant/coupons"}" class="cta-button">Edit & Resubmit Offer →</a>
    `,
  });
  return sendEmail({
    to: email,
    from: MERCHANT_EMAIL,
    subject: `Offer [${code}] Requires Revision`,
    html,
  });
}

// 7. Offer expiring in 3 days -> Merchant
export async function sendOfferExpiringSoonEmail({ email, code, extendUrl }) {
  const html = renderHtmlWrapper({
    title: `Offer ${code} Expiring Soon`,
    bodyContent: `
      <h2 class="email-title">Offer Expiring in 3 Days</h2>
      <p>Your popular offer code <strong>${code}</strong> is scheduled to expire in 3 days. Extend validity to maintain customer momentum.</p>
      <a href="${extendUrl || "https://vouchiqo.com/merchant/coupons"}" class="cta-button">Extend Offer Validity →</a>
    `,
  });
  return sendEmail({
    to: email,
    from: MERCHANT_EMAIL,
    subject: `Reminder: Your Offer [${code}] Expires in 3 Days`,
    html,
  });
}

// 8. Subscription payment confirmed -> Merchant
export async function sendSubscriptionPaymentConfirmedEmail({
  email,
  plan,
  amount,
}) {
  const html = renderHtmlWrapper({
    title: "Subscription Payment Confirmed",
    bodyContent: `
      <h2 class="email-title">Subscription Payment Received</h2>
      <p>Payment of <strong>₹${amount}</strong> was successfully received. Your <strong>${plan}</strong> plan is active.</p>
      <p>A copy of your GST tax invoice is attached for your accounting records.</p>
    `,
  });
  return sendEmail({
    to: email,
    from: MERCHANT_EMAIL,
    subject: `Subscription Payment Confirmed - Tax Invoice Attached`,
    html,
  });
}

// 9. Subscription payment failed -> Merchant
export async function sendSubscriptionPaymentFailedEmail({
  email,
  plan,
  retryUrl,
}) {
  const html = renderHtmlWrapper({
    title: "Subscription Payment Failed",
    bodyContent: `
      <h2 class="email-title">Action Required: Payment Failed</h2>
      <p>We were unable to process the recurring payment for your <strong>${plan}</strong> plan. Please update your payment method to prevent feature locking.</p>
      <a href="${retryUrl || "https://vouchiqo.com/merchant/billing"}" class="cta-button">Update Payment Method →</a>
    `,
  });
  return sendEmail({
    to: email,
    from: MERCHANT_EMAIL,
    subject: `Action Required: Subscription Payment Failed for ${plan}`,
    html,
  });
}

// 10. Revival request from customer -> Merchant
export async function sendCustomerRevivalRequestEmail({
  email,
  code,
  reviewUrl,
}) {
  const html = renderHtmlWrapper({
    title: `Customer Revival Request: ${code}`,
    bodyContent: `
      <h2 class="email-title">Customer Offer Revival Request Received</h2>
      <p>A customer has requested the revival of your expired offer <strong>${code}</strong>.</p>
      <a href="${reviewUrl || "https://vouchiqo.com/merchant/revivals"}" class="cta-button">Review Revival Request →</a>
    `,
  });
  return sendEmail({
    to: email,
    from: MERCHANT_EMAIL,
    subject: `Customer Requested Revival of Offer [${code}]`,
    html,
  });
}

// 11. Customer OTP verification -> Customer
export async function sendCustomerOtpEmail({ email, otp }) {
  const html = renderHtmlWrapper({
    title: "Vouchiqo Verification Code",
    bodyContent: `
      <h2 class="email-title">Your Verification Code</h2>
      <p>Use the following 6-digit OTP code to complete your login or registration. Valid for 10 minutes:</p>
      <div class="code-box">${otp}</div>
    `,
  });
  return sendEmail({
    to: email,
    from: NOREPLY_EMAIL,
    subject: `Your Vouchiqo Verification Code: ${otp}`,
    html,
  });
}

// 12. Customer forgot password -> Customer
export async function sendForgotPasswordEmail({ email, resetUrl }) {
  const html = renderHtmlWrapper({
    title: "Reset Your Vouchiqo Password",
    bodyContent: `
      <h2 class="email-title">Password Reset Request</h2>
      <p>We received a request to reset your Vouchiqo password. Click below to choose a new password. Valid for 1 hour:</p>
      <a href="${resetUrl}" class="cta-button">Reset Password →</a>
    `,
  });
  return sendEmail({
    to: email,
    from: NOREPLY_EMAIL,
    subject: "Reset Your Vouchiqo Password",
    html,
  });
}

// 13. Revival request confirmation -> Customer
export async function sendRevivalRequestConfirmationEmail({
  email,
  brandName,
}) {
  const html = renderHtmlWrapper({
    title: `Revival Request Received for ${brandName}`,
    bodyContent: `
      <h2 class="email-title">We Received Your Revival Request!</h2>
      <p>We've received your request to revive an expired offer for <strong>${brandName}</strong>. Our team is contacting the merchant on your behalf, and we will update you within 48 hours.</p>
    `,
  });
  return sendEmail({
    to: email,
    from: NOREPLY_EMAIL,
    subject: `We Received Your Revival Request for ${brandName}`,
    html,
  });
}

// 14. Revival approved - fresh code sent -> Customer
export async function sendRevivalApprovedEmail({
  email,
  brandName,
  newCode,
  expiryDate,
}) {
  const html = renderHtmlWrapper({
    title: `Offer Revived for ${brandName}!`,
    bodyContent: `
      <h2 class="email-title">Good News! Offer Revived 🎉</h2>
      <p>Your request to revive an offer for <strong>${brandName}</strong> was approved by the merchant! Here is your fresh promo code:</p>
      <div class="code-box">${newCode}</div>
      <p>Valid until: <strong>${expiryDate}</strong></p>
    `,
  });
  return sendEmail({
    to: email,
    from: NOREPLY_EMAIL,
    subject: `Good News! Your Offer for ${brandName} Has Been Revived`,
    html,
  });
}

// 15. Weekly deals digest -> Customer (opted-in)
export async function sendWeeklyDealsDigestEmail({ email, city, deals }) {
  const html = renderHtmlWrapper({
    title: `Top Deals in ${city} This Week`,
    bodyContent: `
      <h2 class="email-title">Your Weekly Vouchiqo Picks in ${city}</h2>
      <p>Here are the top 10 trending discount picks in ${city} this week:</p>
      <ul style="padding-left: 20px; font-size: 13px;">
        ${(
          deals || [
            "Flat 20% off Italian Marble",
            "BOGO Gourmet Burger",
            "Flat ₹500 Dining Cashback",
          ]
        )
          .map(
            (d) => `<li style="margin-bottom: 8px;"><strong>${d}</strong></li>`,
          )
          .join("")}
      </ul>
      <a href="https://vouchiqo.com" class="cta-button">Browse All ${city} Deals →</a>
    `,
  });
  return sendEmail({
    to: email,
    from: NOREPLY_EMAIL,
    subject: `Top 10 Vouchiqo Deals in ${city} This Week`,
    html,
  });
}

// ─────────────────────────────────────────────
// TASK 8: ADMIN CAMPAIGN PANEL NOTIFICATION TRIGGERS
// ─────────────────────────────────────────────

// 1. New campaign submitted -> Admin badge + email
export async function sendAdminNewCampaignSubmittedEmail({
  merchantName,
  campaignType,
  plan,
  addOns,
  startDate,
  reviewUrl,
}) {
  const html = renderHtmlWrapper({
    title: "New Campaign Submitted for Review",
    bodyContent: `
      <h2 class="email-title">New Campaign Review Required</h2>
      <p>Campaign from <strong>${merchantName}</strong> entered the Review Queue.</p>
      <ul>
        <li><strong>Type:</strong> ${campaignType}</li>
        <li><strong>Plan:</strong> ${plan}</li>
        <li><strong>Add-Ons:</strong> ${addOns?.join(", ") || "None"}</li>
        <li><strong>Start Date:</strong> ${startDate}</li>
      </ul>
      <a href="${reviewUrl || "https://vouchiqo.com/admin/campaigns/queue"}" class="cta-button">Review Now →</a>
    `,
  });
  return sendEmail({
    to: "admin@vouchiqo.com",
    from: MERCHANT_EMAIL,
    subject: `New Campaign Review: ${merchantName} [${campaignType}]`,
    html,
  });
}

// 2. Campaign resubmitted after Changes Requested -> Admin badge + email
export async function sendAdminCampaignResubmittedEmail({
  merchantName,
  campaignName,
  reviewUrl,
}) {
  const html = renderHtmlWrapper({
    title: "Campaign Resubmitted",
    bodyContent: `
      <h2 class="email-title">Campaign Resubmitted After Changes Request</h2>
      <p><strong>${merchantName}</strong> resubmitted campaign <strong>"${campaignName}"</strong> after your changes request.</p>
      <a href="${reviewUrl || "https://vouchiqo.com/admin/campaigns/queue"}" class="cta-button">Review Updated Submission →</a>
    `,
  });
  return sendEmail({
    to: "admin@vouchiqo.com",
    from: MERCHANT_EMAIL,
    subject: `Campaign Resubmitted: ${merchantName} - ${campaignName}`,
    html,
  });
}

// 3. Redemptions reach 80% of usage cap -> Admin alert + email
export async function sendAdminCap80PercentReachedEmail({
  campaignName,
  merchantName,
  current,
  capLimit,
}) {
  const html = renderHtmlWrapper({
    title: "80% Usage Cap Reached Alert",
    bodyContent: `
      <h2 class="email-title">80% Usage Cap Reached Alert ⚠️</h2>
      <p>Campaign <strong>"${campaignName}"</strong> by <strong>${merchantName}</strong> has used 80% of its redemption cap.</p>
      <p>Current Usage: <strong>${current} of ${capLimit} claims</strong>. Consider notifying the merchant to increase cap.</p>
    `,
  });
  return sendEmail({
    to: "admin@vouchiqo.com",
    from: MERCHANT_EMAIL,
    subject: `Alert: 80% Cap Reached on ${campaignName}`,
    html,
  });
}

// 4. Success Rate drops below 80% -> Admin urgent alert
export async function sendAdminSuccessRateLowAlertEmail({
  campaignName,
  successRate,
}) {
  const html = renderHtmlWrapper({
    title: "URGENT: Low Success Rate Alert",
    bodyContent: `
      <h2 class="email-title">URGENT: Campaign Success Rate Low 🚨</h2>
      <p>Campaign <strong>"${campaignName}"</strong> Success Rate has fallen to <strong>${successRate}%</strong>.</p>
      <p>Investigate immediately — customers may be experiencing redemption problems at the counter.</p>
    `,
  });
  return sendEmail({
    to: "admin@vouchiqo.com",
    from: MERCHANT_EMAIL,
    subject: `URGENT: Success Rate Dropped Below 80% on ${campaignName}`,
    html,
  });
}

// 5. Campaign live 24 hours with 0 redemptions -> Admin alert
export async function sendAdminZeroRedemptions24hAlertEmail({ campaignName }) {
  const html = renderHtmlWrapper({
    title: "Zero Redemptions Alert (24 Hours)",
    bodyContent: `
      <h2 class="email-title">24-Hour Zero Redemptions Alert ⚠️</h2>
      <p>Campaign <strong>"${campaignName}"</strong> has been live for 24 hours with zero redemptions.</p>
      <p>Verify the offer mechanism is functioning correctly.</p>
    `,
  });
  return sendEmail({
    to: "admin@vouchiqo.com",
    from: MERCHANT_EMAIL,
    subject: `Alert: 24h Zero Redemptions on ${campaignName}`,
    html,
  });
}

// 6. Add-on payment fails -> Admin badge + email
export async function sendAdminAddOnPaymentFailedEmail({
  addOnType,
  campaignName,
  merchantName,
}) {
  const html = renderHtmlWrapper({
    title: "Add-On Payment Failed",
    bodyContent: `
      <h2 class="email-title">Add-On Payment Failed</h2>
      <p>Payment for <strong>${addOnType}</strong> on campaign <strong>"${campaignName}"</strong> by <strong>${merchantName}</strong> has failed.</p>
      <p>The add-on will not activate until payment is confirmed.</p>
    `,
  });
  return sendEmail({
    to: "admin@vouchiqo.com",
    from: MERCHANT_EMAIL,
    subject: `Payment Failed: ${addOnType} on ${campaignName}`,
    html,
  });
}

// 7. Campaign cap reached — auto-paused -> Admin badge + email
export async function sendAdminCampaignCapReachedAutoPausedEmail({
  campaignName,
}) {
  const html = renderHtmlWrapper({
    title: "Campaign Cap Reached (Auto-Paused)",
    bodyContent: `
      <h2 class="email-title">Campaign Redemption Cap Reached</h2>
      <p>Campaign <strong>"${campaignName}"</strong> has reached its redemption cap and has been auto-paused. Merchant has been notified.</p>
    `,
  });
  return sendEmail({
    to: "admin@vouchiqo.com",
    from: MERCHANT_EMAIL,
    subject: `Auto-Paused: Cap Reached on ${campaignName}`,
    html,
  });
}

// 8. Push notification delivery failure -> Admin alert
export async function sendAdminPushDeliveryFailedEmail({
  campaignName,
  errorReason,
}) {
  const html = renderHtmlWrapper({
    title: "Push Notification Delivery Failure",
    bodyContent: `
      <h2 class="email-title">Push Notification Delivery Failure 🚨</h2>
      <p>Push notification for campaign <strong>"${campaignName}"</strong> failed to deliver.</p>
      <p>Reason from MSG91: <strong>${errorReason}</strong>. Manual retry is available in campaign record.</p>
    `,
  });
  return sendEmail({
    to: "admin@vouchiqo.com",
    from: MERCHANT_EMAIL,
    subject: `Alert: Push Delivery Failed on ${campaignName}`,
    html,
  });
}

// 9. Campaign ends naturally -> Admin badge
export async function sendAdminCampaignEndedEmail({
  campaignName,
  merchantName,
  endedTime,
  reportUrl,
}) {
  const html = renderHtmlWrapper({
    title: "Campaign Ended Naturally",
    bodyContent: `
      <h2 class="email-title">Campaign Completed</h2>
      <p>Campaign <strong>"${campaignName}"</strong> by <strong>${merchantName}</strong> ended naturally at ${endedTime}.</p>
      <p>Post-campaign analytics are now available.</p>
      <a href="${reportUrl || "https://vouchiqo.com/admin/campaigns/analytics"}" class="cta-button">View Report & Analytics →</a>
    `,
  });
  return sendEmail({
    to: "admin@vouchiqo.com",
    from: MERCHANT_EMAIL,
    subject: `Campaign Completed: ${campaignName}`,
    html,
  });
}
