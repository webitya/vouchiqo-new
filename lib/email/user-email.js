import { Resend } from "resend";
import { env } from "../../utils/env.js";

const apiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const isProduction = process.env.NODE_ENV === "production";
const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  (isProduction ? "Vouchiqo <noreply@vouchiqo.com>" : "Vouchiqo <onboarding@resend.dev>");

/**
 * High-precision, ultra-compact, modern responsive HTML email layout for User/Shopper notifications.
 * Features crisp typography, 4px/6px small border-radius, clean spacing, and premium UI/UX.
 */
function renderUserEmailLayout({ title, previewText, bodyContent }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 20px 0; }
    .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; border-top: 3px solid #2563eb; padding: 18px 20px; display: table; width: 100%; box-sizing: border-box; }
    .header-logo { font-size: 19px; font-weight: 600; color: #ffffff; text-decoration: none; }
    .header-logo span { color: #38bdf8; }
    .header-tag { font-size: 11px; font-weight: 400; color: #94a3b8; float: right; margin-top: 4px; }
    .content { padding: 24px 20px; line-height: 1.6; font-size: 14px; color: #334155; font-weight: 400; }
    .h1 { font-size: 17px; font-weight: 600; color: #0f172a; margin: 0 0 10px 0; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; margin-bottom: 12px; }
    .badge-success { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
    .badge-amber { background: #fffbeb; color: #b45309; border-color: #fde68a; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px 16px; margin: 16px 0; }
    .code-box { background: #f1f5f9; border: 1px dashed #0284c7; border-radius: 4px; padding: 12px; text-align: center; font-size: 20px; font-weight: 600; color: #0369a1; letter-spacing: 3px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 14px 0; }
    .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; font-weight: 500; font-size: 13px; text-decoration: none; padding: 9px 18px; border-radius: 4px; text-align: center; margin-top: 12px; }
    .btn-blue { background-color: #2563eb; }
    .btn-emerald { background-color: #059669; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 11px; color: #64748b; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="${env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com"}" class="header-logo">Vouch<span>iqo</span></a>
        <span class="header-tag">Verified Deals</span>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p style="margin:0 0 4px 0;">© 2026 Vouchiqo Technologies Pvt Ltd • Ranchi &amp; Jharkhand</p>
        <p style="margin:0;">Account notification sent to your registered email.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Dispatch low-level email via Resend
 */
async function dispatchEmail({ to, subject, html }) {
  if (!to) {
    console.warn("[dispatchEmail Warning]: Skipping dispatch - missing recipient 'to' email address.");
    return { success: false, deliveredDirectly: false, error: "Missing recipient 'to' email address" };
  }

  if (!resend || !apiKey || apiKey === "re_dummy_key_for_build") {
    console.log(`[Resend Mock User Email] To: ${to} | Subject: ${subject}`);
    return { success: true, deliveredDirectly: false, mocked: true };
  }

  const fromAddress = FROM_EMAIL;
  const devRecipient = process.env.EMAIL_DEV_RECIPIENT || env.EMAIL_DEV_RECIPIENT || "vouchiqo@gmail.com";

  // 1. Try sending directly to the target recipient's email address ('to')
  try {
    const res = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    });

    if (res?.error) {
      console.error(`[Resend User Email Error]:`, res.error);
      const errMsg = res.error.message || res.error.name || String(res.error);

      if (
        errMsg.includes("testing emails to your own email address") ||
        errMsg.includes("validation_error") ||
        errMsg.includes("not verified") ||
        errMsg.includes("verify your domain") ||
        errMsg.includes("must verify") ||
        errMsg.includes("unverified")
      ) {
        console.warn(
          `[Resend Sandbox Notice]: Cannot send directly to recipient '${to}' using domain '${fromAddress}'.\n` +
          `-> Reason: ${errMsg}\n` +
          `-> Sandbox Fallback: Retrying dispatch using 'onboarding@resend.dev' to dev owner email '${devRecipient}'.`
        );

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
      }

      if (errMsg.includes("daily email sending quota") || res.error.name === "daily_quota_exceeded") {
        console.warn(`⚠️ [Resend Quota Warning]: Daily quota reached on Resend account. Email to ${to} queued.`);
      }

      return { success: false, deliveredDirectly: false, error: errMsg };
    }

    console.log(`[Resend User Email Success]: Dispatched directly to target user: ${to}`);
    return { success: true, data: res.data, deliveredDirectly: true, to };
  } catch (error) {
    const errMsg = error?.message || String(error);
    console.error("Failed to send email via Resend:", error);
    return { success: false, deliveredDirectly: false, error: errMsg };
  }
}

/**
 * 1. User Registration Welcome Email
 */
export async function sendUserWelcomeEmail({ to, name }) {
  const userName = name || "Valued Member";
  const html = renderUserEmailLayout({
    title: "Welcome to Vouchiqo!",
    bodyContent: `
      <span class="badge badge-success">🎉 Registration Complete</span>
      <h1 class="h1">Welcome to Vouchiqo, ${userName}!</h1>
      <p style="margin: 0 0 12px 0;">Your account is ready. Discover Ranchi's top verified deals, save instant offers, and get exclusive store discounts.</p>

      <div class="card">
        <div style="font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px;">Quick Start Guide</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
          <tr>
            <td style="padding: 4px 0; width: 20px;">🔹</td>
            <td><strong>Explore Deals:</strong> Browse local food, retail &amp; service discounts.</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; width: 20px;">🔹</td>
            <td><strong>Claim Offers:</strong> Instant 1-tap claim to save codes in your profile.</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; width: 20px;">🔹</td>
            <td><strong>Request Revivals:</strong> Notify brands when out-of-stock deals expire.</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 16px;">
        <a href="${env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com"}" class="btn btn-blue">Start Exploring Deals →</a>
      </div>
    `,
  });

  return dispatchEmail({
    to,
    subject: `Welcome to Vouchiqo, ${userName}! Start saving today`,
    html,
  });
}

/**
 * 2. User Welcome Back Email
 */
export async function sendUserWelcomeBackEmail({ to, name, lastLoginAt }) {
  const userName = name || "Valued Member";
  const formattedLastLogin = lastLoginAt
    ? new Date(lastLoginAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const html = renderUserEmailLayout({
    title: "Welcome Back to Vouchiqo!",
    bodyContent: `
      <span class="badge badge-blue">👋 Welcome Back</span>
      <h1 class="h1">Great to see you again, ${userName}!</h1>
      <p style="margin: 0 0 12px 0;">You've successfully signed back into your Vouchiqo account${formattedLastLogin ? ` (last active ${formattedLastLogin})` : ""}.</p>

      <div class="card">
        <div style="font-size: 13px; font-weight: 600; color: #1d4ed8; margin-bottom: 4px;">Fresh Local Offers Waiting For You</div>
        <p style="margin: 0; font-size: 13px; color: #475569;">Check out the latest verified offers from top stores in Ranchi and claim your savings before they expire.</p>
      </div>

      <div style="text-align: center; margin-top: 16px;">
        <a href="${env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com"}" class="btn btn-blue">View Newest Offers →</a>
      </div>
    `,
  });

  return dispatchEmail({
    to,
    subject: `Welcome back to Vouchiqo, ${userName}!`,
    html,
  });
}

/**
 * 3. OTP Verification Email
 */
export async function sendUserVerificationOtpEmail({ to, otp, name }) {
  const userName = name || "User";
  const html = renderUserEmailLayout({
    title: "Security Code - Vouchiqo",
    bodyContent: `
      <span class="badge badge-blue">🔒 Security Code</span>
      <h1 class="h1">Verify your email address</h1>
      <p style="margin: 0 0 10px 0;">Hello ${userName}, enter the verification code below to authorize your session.</p>
      <div class="code-box">${otp}</div>
      <p style="font-size: 12px; color: #64748b; margin: 0;">Code expires in 10 minutes. Do not share this code with anyone.</p>
    `,
  });

  return dispatchEmail({
    to,
    subject: `${otp} is your Vouchiqo verification code`,
    html,
  });
}

/**
 * 3b. Account Activation / Email Verification Link Email
 */
export async function sendUserVerificationEmail({ to, verifyUrl, name }) {
  const userName = name || "User";
  const html = renderUserEmailLayout({
    title: "Verify Your Email - Vouchiqo",
    bodyContent: `
      <span class="badge badge-success">✉️ Email Verification</span>
      <h1 class="h1">Verify your email address</h1>
      <p style="margin: 0 0 12px 0;">Hi ${userName}, thanks for signing up for Vouchiqo! Please confirm your email address to activate your account and start saving.</p>
      <div style="text-align: center; margin: 18px 0;">
        <a href="${verifyUrl}" class="btn btn-blue">Verify Email Address →</a>
      </div>
      <p style="font-size: 12px; color: #64748b; margin: 0;">If you didn't create an account with Vouchiqo, you can safely ignore this email.</p>
    `,
  });

  return dispatchEmail({
    to,
    subject: "Verify your email address - Vouchiqo",
    html,
  });
}

/**
 * 4. Password Reset Email
 */
export async function sendUserPasswordResetEmail({ to, resetUrl, name }) {
  const userName = name || "User";
  const html = renderUserEmailLayout({
    title: "Reset Password - Vouchiqo",
    bodyContent: `
      <span class="badge badge-blue">🔑 Password Reset</span>
      <h1 class="h1">Reset your Vouchiqo password</h1>
      <p style="margin: 0 0 12px 0;">Hi ${userName}, we received a request to reset your password.</p>
      <div style="text-align: center; margin: 16px 0;">
        <a href="${resetUrl}" class="btn btn-blue">Reset Password Now →</a>
      </div>
      <p style="font-size: 12px; color: #64748b; margin: 0;">This link expires in 1 hour. If you didn't request this, your account remains secure.</p>
    `,
  });

  return dispatchEmail({
    to,
    subject: "Reset your Vouchiqo password",
    html,
  });
}

/**
 * 5. Offer Claimed Confirmation Email
 */
export async function sendUserCouponClaimedEmail({
  to,
  name,
  couponTitle,
  merchantName,
  couponCode,
  discountText,
  validTill,
}) {
  const userName = name || "User";
  const html = renderUserEmailLayout({
    title: `Offer Claimed: ${couponTitle}`,
    bodyContent: `
      <span class="badge badge-success">🏷️ Offer Claimed</span>
      <h1 class="h1">Offer claimed successfully!</h1>
      <p style="margin: 0 0 12px 0;">Hi ${userName}, you claimed an offer from <strong>${merchantName || "Vouchiqo Partner"}</strong>.</p>
      
      <div class="card">
        <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${couponTitle}</div>
        <div style="font-size: 13px; color: #059669; font-weight: 700; margin-top: 2px;">${discountText || "Verified Deal"}</div>
        ${validTill ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">Valid until: ${new Date(validTill).toLocaleDateString("en-IN", { dateStyle: "medium" })}</div>` : ""}
      </div>

      <div class="code-box">${couponCode || "VOUCHIQO"}</div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/customer/claimed"}" class="btn btn-blue">View My Claimed Offers →</a>
      </div>
    `,
  });

  return dispatchEmail({
    to,
    subject: `Claimed: ${couponTitle} at ${merchantName || "Vouchiqo"}`,
    html,
  });
}

/**
 * 6. Offer Redemption Receipt Email
 */
export async function sendUserCouponRedeemedEmail({
  to,
  name,
  couponTitle,
  merchantName,
  savingsAmount,
  storeAddress,
}) {
  const userName = name || "User";
  const html = renderUserEmailLayout({
    title: `Savings Receipt - ${couponTitle}`,
    bodyContent: `
      <span class="badge badge-success">✅ Offer Redeemed</span>
      <h1 class="h1">Saved ₹${savingsAmount || 0} at ${merchantName}!</h1>
      <p style="margin: 0 0 12px 0;">Hi ${userName}, your offer <strong>${couponTitle}</strong> was redeemed successfully.</p>
      
      <div class="card" style="border-color: #a7f3d0; background: #ecfdf5;">
        <div style="font-size: 12px; color: #047857; font-weight: 500;">Total Saved</div>
        <div style="font-size: 26px; font-weight: 800; color: #047857; margin: 2px 0;">₹${savingsAmount || 0}</div>
        ${storeAddress ? `<div style="font-size: 11px; color: #4b5563; margin-top: 4px;">📍 ${storeAddress}</div>` : ""}
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com"}" class="btn btn-emerald">Find More Deals →</a>
      </div>
    `,
  });

  return dispatchEmail({
    to,
    subject: `You saved ₹${savingsAmount || 0} at ${merchantName}!`,
    html,
  });
}

/**
 * 7. Savings Milestone Email
 */
export async function sendUserSavingsMilestoneEmail({
  to,
  name,
  totalSavings,
  couponsRedeemedCount,
}) {
  const userName = name || "Savings Champion";
  const html = renderUserEmailLayout({
    title: "Savings Milestone Achieved!",
    bodyContent: `
      <span class="badge badge-blue">🏆 Milestone Reached</span>
      <h1 class="h1">Congrats ${userName}! Saved ₹${totalSavings}!</h1>
      <p style="margin: 0 0 12px 0;">You've officially saved ₹${totalSavings} across ${couponsRedeemedCount || 1} local offers on Vouchiqo.</p>
      
      <div style="text-align: center; margin-top: 16px;">
        <a href="${env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com"}" class="btn btn-blue">Explore Top Deals →</a>
      </div>
    `,
  });

  return dispatchEmail({
    to,
    subject: `🎉 Congrats ${userName}! You've saved ₹${totalSavings} on Vouchiqo`,
    html,
  });
}

/**
 * 8. Revival Request Confirmation Email
 */
export async function sendUserRevivalConfirmationEmail({ to, name, brandName }) {
  const userName = name || "User";
  const html = renderUserEmailLayout({
    title: `Revival Request - ${brandName}`,
    bodyContent: `
      <span class="badge badge-blue">⚡ Deal Revival</span>
      <h1 class="h1">Revival request sent to ${brandName}</h1>
      <p style="margin: 0 0 12px 0;">Hi ${userName}, we notified <strong>${brandName}</strong> that you're eager for their offers to return. We'll email you the moment new deals go live.</p>
    `,
  });

  return dispatchEmail({
    to,
    subject: `Deal Revival Requested for ${brandName}`,
    html,
  });
}
