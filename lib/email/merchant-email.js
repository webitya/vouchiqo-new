import { Resend } from "resend";
import { env } from "../../utils/env.js";

const apiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const isProduction = process.env.NODE_ENV === "production";
const FROM_MERCHANT_EMAIL =
  process.env.EMAIL_FROM_MERCHANT ||
  process.env.EMAIL_FROM ||
  (isProduction
    ? "Vouchiqo Merchant <merchant@vouchiqo.com>"
    : "Vouchiqo Merchant <onboarding@resend.dev>");

/**
 * Responsive HTML email layout for Merchant notifications (White, Blue, and Black Theme).
 * Features standard clean typography (-apple-system / Segoe UI / Roboto) and high-contrast UI.
 */
function renderMerchantEmailLayout({ title, previewText, bodyContent }) {
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
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding: 20px 0; }
    .main { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; border-top: 3px solid #2563eb; padding: 18px 20px; text-align: center; }
    .logo { font-size: 19px; font-weight: 600; color: #ffffff; text-decoration: none; }
    .logo span { color: #38bdf8; }
    .merchant-tag { font-size: 11px; font-weight: 400; color: #94a3b8; margin-top: 3px; display: block; }
    .content { padding: 24px 20px; line-height: 1.6; color: #334155; font-size: 14px; font-weight: 400; }
    .h1 { font-size: 17px; font-weight: 600; color: #0f172a; margin: 0 0 10px 0; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; margin-bottom: 12px; }
    .badge-approved { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
    .badge-rejected { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .badge-blue { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 14px 16px; margin: 14px 0; }
    .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; font-weight: 500; font-size: 13px; text-decoration: none; padding: 9px 18px; border-radius: 4px; text-align: center; margin-top: 12px; }
    .btn-amber { background-color: #2563eb; color: #ffffff !important; }
    .btn-blue { background-color: #2563eb; color: #ffffff !important; }
    .btn-emerald { background-color: #059669; color: #ffffff !important; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <a href="${env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com"}/merchant" class="logo">Vouch<span>iqo</span></a>
        <span class="merchant-tag">Verified Deals and Offers</span>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p style="margin:0 0 4px 0;">© 2026 Vouchiqo</p>
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
async function dispatchMerchantEmail({ to, subject, html }) {
  if (!to) {
    console.warn(
      "[dispatchMerchantEmail Warning]: Skipping dispatch - missing recipient 'to' email address.",
    );
    return {
      success: false,
      deliveredDirectly: false,
      error: "Missing recipient 'to' email address",
    };
  }

  if (!resend || !apiKey || apiKey === "re_dummy_key_for_build") {
    console.log(`[Resend Mock Merchant Email] To: ${to} | Subject: ${subject}`);
    return { success: true, deliveredDirectly: false, mocked: true };
  }

  const fromAddress = FROM_MERCHANT_EMAIL;
  const devRecipient =
    process.env.EMAIL_DEV_RECIPIENT ||
    env.EMAIL_DEV_RECIPIENT ||
    "vouchiqo@gmail.com";

  // 1. Try sending directly to the target merchant's email address ('to')
  try {
    const res = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
    });

    if (res?.error) {
      console.error(`[Resend Merchant Email Error]:`, res.error);
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
          `[Resend Sandbox Notice]: Cannot send directly to merchant '${to}' using domain '${fromAddress}'.\n` +
            `-> Reason: ${errMsg}\n` +
            `-> Sandbox Fallback: Retrying dispatch using 'onboarding@resend.dev' to dev owner email '${devRecipient}'.`,
        );

        const fallbackRes = await resend.emails.send({
          from: "Vouchiqo Merchant <onboarding@resend.dev>",
          to: devRecipient,
          subject:
            to === devRecipient
              ? subject
              : `[Dev Sandbox Redirect for ${to}] ${subject}`,
          html,
        });

        if (fallbackRes?.error) {
          console.error("[Resend Sandbox Fallback Error]:", fallbackRes.error);
          return {
            success: false,
            deliveredDirectly: false,
            error: fallbackRes.error.message || String(fallbackRes.error),
          };
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

      if (
        errMsg.includes("daily email sending quota") ||
        res.error.name === "daily_quota_exceeded"
      ) {
        console.warn(
          `⚠️ [Resend Quota Warning]: Daily quota reached on Resend account. Email to ${to} queued.`,
        );
      }

      return { success: false, deliveredDirectly: false, error: errMsg };
    }

    console.log(
      `[Resend Merchant Email Success]: Dispatched directly to target merchant: ${to}`,
    );
    return { success: true, data: res.data, deliveredDirectly: true, to };
  } catch (error) {
    const errMsg = error?.message || String(error);
    console.error("Failed to send email via Resend:", error);
    return { success: false, deliveredDirectly: false, error: errMsg };
  }
}

/**
 * Admin Notification Email for New Merchant Registration
 */
export async function sendMerchantRegistrationAdminEmail({
  merchantEmail,
  password,
  businessName,
  liaisonName,
  phone,
  category,
}) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@vouchiqo.com";
  const devRecipient =
    process.env.EMAIL_DEV_RECIPIENT ||
    env.EMAIL_DEV_RECIPIENT ||
    "vouchiqo@gmail.com";
  const name = liaisonName || businessName || "Merchant Partner";
  const email = merchantEmail;

  const html = renderMerchantEmailLayout({
    title: `New Merchant Registration: ${businessName || name}`,
    bodyContent: `
      <span class="badge badge-blue">New Merchant Registration</span>
      <h1 class="h1">New Merchant Registered on Vouchiqo</h1>
      <p style="margin: 0 0 12px 0;">A new merchant partner has registered an account and submitted credentials on Vouchiqo.</p>
      
      <div class="card" style="border: 1px solid #e2e8f0; background: #ffffff; padding: 16px; margin: 16px 0; border-radius: 6px;">
        <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">Merchant Account &amp; Credentials</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 5px 0; color: #64748b; font-weight: 400; width: 140px;">Business / Store:</td>
            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${businessName || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b; font-weight: 400;">Liaison Contact:</td>
            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b; font-weight: 400;">Registered Email:</td>
            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b; font-weight: 400;">Password:</td>
            <td style="padding: 5px 0; color: #1e40af; font-weight: 500; font-size: 13px;">${password ? password : "<em>(Password set during account registration)</em>"}</td>
          </tr>
          ${
            phone
              ? `
          <tr>
            <td style="padding: 5px 0; color: #64748b; font-weight: 400;">Contact Phone:</td>
            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${phone}</td>
          </tr>`
              : ""
          }
          ${
            category
              ? `
          <tr>
            <td style="padding: 5px 0; color: #64748b; font-weight: 400;">Category:</td>
            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${category}</td>
          </tr>`
              : ""
          }
        </table>
      </div>

      <div style="text-align: center; margin-top: 16px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/admin/merchants"}" class="btn btn-blue">Review in Admin Portal →</a>
      </div>
    `,
  });

  const subject = `[Admin Alert] New Merchant Registration: ${businessName || name} (${email})`;

  // Try dispatching directly to dev recipient using onboarding@resend.dev to ensure delivery
  let adminRes = null;
  try {
    if (resend && apiKey && apiKey !== "re_dummy_key_for_build") {
      adminRes = await resend.emails.send({
        from: "Vouchiqo Merchant <onboarding@resend.dev>",
        to: devRecipient,
        subject,
        html,
      });
      console.log(
        `[Admin Resend Email Success]: Sent new merchant alert to ${devRecipient}`,
      );
    }
  } catch (err) {
    console.error("[Admin Resend Error]:", err);
  }

  // Also dispatch to adminEmail if distinct
  if (adminEmail && adminEmail !== devRecipient) {
    dispatchMerchantEmail({
      to: adminEmail,
      subject,
      html,
    }).catch(() => {});
  }

  return adminRes;
}

/**
 * 1. Merchant Application Submitted / Welcome Email with Credentials (Sent to User + Admin)
 */
export async function sendMerchantWelcomeEmail({
  to,
  email,
  password,
  businessName,
  liaisonName,
  phone,
  category,
}) {
  const name = liaisonName || "Merchant Partner";
  const targetEmail = email || to;

  const html = renderMerchantEmailLayout({
    title: `Congratulations! Welcome to Vouchiqo - ${businessName || "Merchant Partner"}`,
    bodyContent: `
      <span class="badge badge-approved">Congratulations • Registration Successful</span>
      <h1 class="h1">Congratulations, ${name}!</h1>
      <p style="margin: 0 0 10px 0;">Congratulations on registering with Vouchiqo! We have successfully created your merchant partner account for <strong>${businessName || "your business"}</strong>.</p>
      
      <div class="card" style="border: 1px solid #e2e8f0; background: #ffffff; padding: 16px; margin: 16px 0; border-radius: 6px;">
        <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">Your Merchant Login Credentials</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 5px 0; color: #64748b; font-weight: 400; width: 140px;">Registered Email:</td>
            <td style="padding: 5px 0; color: #0f172a; font-weight: 500;">${targetEmail}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #64748b; font-weight: 400; width: 140px;">Password:</td>
            <td style="padding: 5px 0; color: #1e40af; font-weight: 500; font-size: 13px;">${password ? password : "<em>(Password set during account registration)</em>"}</td>
          </tr>
        </table>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5;">Please keep this email safe. You can use these credentials to log into your merchant dashboard anytime.</p>
      </div>

      <div class="card">
        <strong style="color: #0f172a; font-size: 13px; font-weight: 600;">Next Steps in Onboarding:</strong>
        <ol style="margin: 6px 0 0 0; padding-left: 18px; font-size: 13px; color: #475569; font-weight: 400;">
          <li>Verification team reviews your business &amp; KYC details (24-48 hrs)</li>
          <li>Email notification dispatched instantly upon verification</li>
          <li>Once verified, your store page goes live &amp; you can post unlimited deals</li>
        </ol>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant-login"}" class="btn btn-blue">Log In to Merchant Portal →</a>
      </div>
    `,
  });

  // 1. Dispatch Congratulations email to user (merchant)
  const merchantResult = await dispatchMerchantEmail({
    to: targetEmail,
    subject: `Congratulations! Your Vouchiqo Merchant Credentials for ${businessName || "your store"}`,
    html,
  });

  // 2. Dispatch Registration notification with credentials to Admin
  sendMerchantRegistrationAdminEmail({
    merchantEmail: targetEmail,
    password,
    businessName,
    liaisonName: name,
    phone,
    category,
  }).catch((err) =>
    console.error("[Merchant Welcome - Admin Notification Error]:", err),
  );

  return merchantResult;
}

/**
 * 2. Application Approved / Verified Email
 */
export async function sendMerchantApprovedEmail({
  to,
  businessName,
  liaisonName,
  dashboardUrl,
}) {
  const name = liaisonName || "Merchant Partner";
  const targetUrl =
    dashboardUrl ||
    (env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/dashboard";

  const html = renderMerchantEmailLayout({
    title: "Application Approved! Welcome to Vouchiqo Partner Network",
    bodyContent: `
      <span class="badge badge-approved">Account Verified &amp; Active</span>
      <h1 class="h1">Congratulations, ${name}!</h1>
      <p style="margin: 0 0 10px 0;">Your business profile <strong>${businessName}</strong> has been officially verified and approved by the Vouchiqo Admin Team.</p>
      
      <div class="card" style="border-color: #a7f3d0; background: #ecfdf5;">
        <strong style="color: #065f46; font-size: 13px; font-weight: 600;">Your Merchant Storefront is Live!</strong>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #047857;">You can now post discount offers, track in-store redemptions, and launch targeted promotional campaigns.</p>
      </div>

      <div style="text-align: center; margin-top: 16px;">
        <a href="${targetUrl}" class="btn btn-blue">Go to Merchant Dashboard →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Approved! ${businessName} is now live on Vouchiqo`,
    html,
  });
}

/**
 * 3. Application Rejected Email
 */
export async function sendMerchantRejectedEmail({
  to,
  businessName,
  liaisonName,
  rejectionReason,
}) {
  const name = liaisonName || "Merchant Partner";
  const editUrl =
    (env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") +
    "/merchant/profile?edit=true";

  const html = renderMerchantEmailLayout({
    title: "Application Action Required - Vouchiqo",
    bodyContent: `
      <span class="badge badge-rejected">⚠️ Verification Action Needed</span>
      <h1 class="h1">Action Required for ${businessName}</h1>
      <p style="margin: 0 0 10px 0;">Hello ${name}, our compliance team reviewed your business profile and requested an update before final approval.</p>
      
      <div class="card" style="border-color: #fecaca; background: #fef2f2;">
        <strong style="color: #991b1b; font-size: 13px;">Reason for Review Request:</strong>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #b91c1c;">${rejectionReason || "Please verify document clarity, GST/Identity match, or storefront photo quality."}</p>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${editUrl}" class="btn">Update Profile Details →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Action Required: Update profile details for ${businessName}`,
    html,
  });
}

/**
 * 4. Plan Selected Email (Triggered when merchant selects or upgrades a plan)
 */
export async function sendMerchantPlanSelectedEmail({
  to,
  businessName,
  planName,
  planPrice,
  billingCycle,
  featuresList = [],
}) {
  const cycleText = billingCycle || "monthly";
  const html = renderMerchantEmailLayout({
    title: `Subscription Plan Selected: ${planName}`,
    bodyContent: `
      <span class="badge badge-blue">Subscription Plan Selected</span>
      <h1 class="h1">You've selected the ${planName} Plan!</h1>
      <p style="margin: 0 0 10px 0;">Hello <strong>${businessName}</strong>, thank you for selecting the <strong>${planName}</strong> plan for your store on Vouchiqo.</p>
      
      <div class="card">
        <div style="font-size: 12px; font-weight: 500; color: #64748b;">Plan Summary</div>
        <div style="font-size: 17px; font-weight: 600; color: #0f172a; margin: 4px 0;">${planName} Plan</div>
        <div style="font-size: 14px; font-weight: 600; color: #2563eb;">₹${planPrice || 0} / ${cycleText}</div>
        
        ${
          featuresList.length > 0
            ? `<ul style="margin: 10px 0 0 0; padding-left: 18px; font-size: 12px; color: #475569;">
                ${featuresList.map((f) => `<li>${f}</li>`).join("")}
              </ul>`
            : ""
        }
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/settings"}" class="btn btn-blue">View Plan &amp; Billing →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Subscription Selected: ${planName} Plan for ${businessName}`,
    html,
  });
}

/**
 * 5. Payment Completed / Receipt Email (Triggered after successful Razorpay payment)
 */
export async function sendMerchantPaymentCompletedEmail({
  to,
  businessName,
  amount,
  currency = "INR",
  transactionId,
  orderId,
  planName,
  planExpiry,
}) {
  const displayAmount = (
    Number(amount) > 1000 ? Number(amount) / 100 : Number(amount)
  ).toFixed(2);
  const formattedExpiry = planExpiry
    ? new Date(planExpiry).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const html = renderMerchantEmailLayout({
    title: `Payment Receipt - ${transactionId || orderId}`,
    bodyContent: `
      <span class="badge badge-approved">Payment Successful</span>
      <h1 class="h1">Payment Receipt &amp; Tax Confirmation</h1>
      <p style="margin: 0 0 10px 0;">Thank you! We received your payment for <strong>${businessName}</strong>.</p>

      <div class="card" style="border-color: #a7f3d0; background: #ecfdf5;">
        <div style="font-size: 12px; color: #047857; font-weight: 500;">Amount Paid</div>
        <div style="font-size: 22px; font-weight: 600; color: #047857; margin: 2px 0;">₹${displayAmount}</div>
        ${planName ? `<div style="font-size: 12px; font-weight: 500; color: #065f46;">Plan: ${planName} Plan</div>` : ""}
        ${formattedExpiry ? `<div style="font-size: 11px; color: #047857; margin-top: 2px;">Active until: ${formattedExpiry}</div>` : ""}
      </div>

      <div class="card" style="font-size: 12px;">
        <div style="font-size: 12px; font-weight: 500; color: #64748b; margin-bottom: 6px;">Transaction Details</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #334155;">
          ${transactionId ? `<tr><td style="padding: 2px 0; color: #64748b; width: 130px;">Payment ID:</td><td style="font-weight: 500;">${transactionId}</td></tr>` : ""}
          ${orderId ? `<tr><td style="padding: 2px 0; color: #64748b; width: 130px;">Order ID:</td><td style="font-weight: 500;">${orderId}</td></tr>` : ""}
          <tr><td style="padding: 2px 0; color: #64748b; width: 130px;">Date &amp; Time:</td><td>${new Date().toLocaleString("en-IN")}</td></tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/settings"}" class="btn btn-blue">View Billing History →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Payment Successful (₹${displayAmount}): Receipt for ${businessName}`,
    html,
  });
}

/**
 * 6. Payment Failed Email
 */
export async function sendMerchantPaymentFailedEmail({
  to,
  businessName,
  planName,
  amount,
  failureReason,
}) {
  const displayAmount = (
    Number(amount) > 1000 ? Number(amount) / 100 : Number(amount)
  ).toFixed(2);

  const html = renderMerchantEmailLayout({
    title: "Payment Failed - Action Required",
    bodyContent: `
      <span class="badge badge-rejected">❌ Payment Failed</span>
      <h1 class="h1">Payment Could Not Be Processed</h1>
      <p style="margin: 0 0 10px 0;">Hello <strong>${businessName}</strong>, your recent payment attempt of <strong>₹${displayAmount}</strong> for ${planName || "subscription"} was unsuccessful.</p>

      <div class="card" style="border-color: #fecaca; background: #fef2f2;">
        <div style="font-size: 12px; font-weight: 700; color: #991b1b;">Failure Details</div>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #b91c1c;">${failureReason || "Transaction declined by bank or card issuer."}</p>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/settings"}" class="btn btn-blue">Retry Payment Now →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Action Required: Payment Failed for ${businessName}`,
    html,
  });
}

/**
 * 7. Campaign / Offer Created Confirmation Email
 */
export async function sendMerchantOfferCreatedEmail({
  to,
  businessName,
  offerTitle,
  code,
  discountText,
}) {
  const html = renderMerchantEmailLayout({
    title: `Offer Live: ${offerTitle}`,
    bodyContent: `
      <span class="badge badge-approved">🚀 Offer Live</span>
      <h1 class="h1">Your offer is now live on Vouchiqo!</h1>
      <p style="margin: 0 0 10px 0;">Great job! <strong>${offerTitle}</strong> is active and discoverable by local shoppers.</p>
      
      <div class="card">
        <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${offerTitle}</div>
        <div style="font-size: 13px; font-weight: 700; color: #2563eb; margin: 2px 0;">${discountText || "Verified Deal"}</div>
        <div style="font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #2563eb; font-weight: 700; margin-top: 4px;">CODE: ${code}</div>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/coupons"}" class="btn btn-blue">Manage Listings →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Offer Live: ${offerTitle} (${businessName})`,
    html,
  });
}

/**
 * 8. Customer Offer Redemption Alert Email
 */
export async function sendMerchantRedemptionNotificationEmail({
  to,
  businessName,
  offerTitle,
  customerName,
  savingsGiven,
}) {
  const html = renderMerchantEmailLayout({
    title: `Offer Redeemed at ${businessName}`,
    bodyContent: `
      <span class="badge badge-approved">🔔 Instant Redemption</span>
      <h1 class="h1">New Offer Redeemed!</h1>
      <p style="margin: 0 0 10px 0;">A customer just redeemed an offer at <strong>${businessName}</strong>.</p>
      
      <div class="card">
        <div style="font-size: 12px; color: #64748b; font-weight: 600;">Offer Title</div>
        <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">${offerTitle}</div>
        <div style="font-size: 12px; color: #64748b; font-weight: 600;">Customer</div>
        <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${customerName || "Vouchiqo User"}</div>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/dashboard"}" class="btn btn-blue">View Redemptions Analytics →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `New Redemption: ${offerTitle} at ${businessName}`,
    html,
  });
}

/**
 * 9. Revival Demand Alert Email (Customer requested offer revival)
 */
export async function sendMerchantRevivalAlertEmail({
  to,
  businessName,
  brandName,
  totalDemandsCount,
  revivalUrl,
}) {
  const targetUrl =
    revivalUrl ||
    (env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/revivals";

  const html = renderMerchantEmailLayout({
    title: `Customer Demand: ${totalDemandsCount} Revival Requests`,
    bodyContent: `
      <span class="badge badge-blue">🔥 Customer Demand Surge</span>
      <h1 class="h1">Customers are requesting your offers!</h1>
      <p style="margin: 0 0 10px 0;">Hello team <strong>${businessName || brandName}</strong>, <strong>${totalDemandsCount || 1} local shoppers</strong> requested a deal revival for your brand.</p>
      
      <div class="card" style="border-color: #bfdbfe; background: #eff6ff; text-align: center; padding: 16px;">
        <div style="font-size: 24px; font-weight: 600; color: #1d4ed8;">${totalDemandsCount || 1}</div>
        <div style="font-size: 12px; font-weight: 500; color: #1e40af;">Customer Revival Requests</div>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${targetUrl}" class="btn btn-blue">Respond &amp; Relaunch Offer →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `High Demand: ${totalDemandsCount} customers requested deals for ${businessName || brandName}`,
    html,
  });
}

/**
 * 10. Monthly Performance & Summary Email
 */
export async function sendMerchantMonthlyReportEmail({
  to,
  businessName,
  monthName,
  totalRedemptions,
  totalSavingsProvided,
  totalPageViews,
}) {
  const html = renderMerchantEmailLayout({
    title: `Monthly Performance Report - ${monthName || "This Month"}`,
    bodyContent: `
      <span class="badge badge-blue">Performance Summary</span>
      <h1 class="h1">${businessName} Performance for ${monthName || "This Month"}</h1>
      <p style="margin: 0 0 10px 0;">Here is your customer engagement breakdown on Vouchiqo:</p>
      
      <div style="margin: 14px 0;">
        <div class="card" style="margin-bottom: 8px;">
          <div style="font-size: 17px; font-weight: 600; color: #0f172a;">${totalRedemptions || 0}</div>
          <div style="font-size: 12px; font-weight: 500; color: #64748b;">Total In-Store Redemptions</div>
        </div>
        <div class="card" style="margin-bottom: 8px;">
          <div style="font-size: 17px; font-weight: 600; color: #059669;">₹${totalSavingsProvided || 0}</div>
          <div style="font-size: 12px; font-weight: 500; color: #64748b;">Value Delivered to Customers</div>
        </div>
        <div class="card">
          <div style="font-size: 17px; font-weight: 600; color: #2563eb;">${totalPageViews || 0}</div>
          <div style="font-size: 12px; font-weight: 500; color: #64748b;">Total Brand Impressions</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/analytics"}" class="btn btn-blue">View Full Analytics →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `📊 ${monthName || "Monthly"} Performance Report: ${businessName}`,
    html,
  });
}

/**
 * 11. Admin Subscription Control Center Update Email
 * (Triggered when Super Admin changes plan tier, extends expiry (+7 days, etc.), pauses, or cancels subscription)
 */
export async function sendMerchantSubscriptionAdminUpdateEmail({
  to,
  businessName,
  actionTitle,
  statusBadgeText,
  planName,
  planExpiry,
  detailMessage,
}) {
  const formattedExpiry = planExpiry
    ? new Date(planExpiry).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const html = renderMerchantEmailLayout({
    title: actionTitle || `Subscription Update - ${businessName}`,
    bodyContent: `
      <span class="badge badge-blue">${statusBadgeText || "⚡ Subscription Updated"}</span>
      <h1 class="h1">${actionTitle || "Subscription Account Update"}</h1>
      <p style="margin: 0 0 10px 0;">Hello <strong>${businessName}</strong>, an update was made to your merchant subscription by the Vouchiqo Administration Team.</p>

      <div class="card">
        <div style="font-size: 12px; font-weight: 500; color: #64748b; margin-bottom: 6px;">Subscription Status Summary</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
          ${planName ? `<tr><td style="padding: 3px 0; color: #64748b; width: 130px;">Active Tier:</td><td style="font-weight: 500; color: #0f172a;">${planName} Plan</td></tr>` : ""}
          ${formattedExpiry ? `<tr><td style="padding: 3px 0; color: #64748b; width: 130px;">Plan Expiry:</td><td style="font-weight: 500; color: #059669;">${formattedExpiry}</td></tr>` : ""}
        </table>
        ${detailMessage ? `<div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #475569;">${detailMessage}</div>` : ""}
      </div>

      <div style="text-align: center; margin-top: 14px;">
        <a href="${(env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com") + "/merchant/settings"}" class="btn btn-blue">View Subscription &amp; Account Status →</a>
      </div>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: `Subscription Notice: ${actionTitle || "Account Updated"} for ${businessName}`,
    html,
  });
}

/**
 * Merchant Password Reset Email
 */
export async function sendMerchantPasswordResetEmail({ to, resetUrl, name }) {
  const merchantName = name || "Partner";
  const html = renderMerchantEmailLayout({
    title: "Reset Merchant Password - Vouchiqo",
    bodyContent: `
      <span class="badge badge-blue">🔑 Password Reset</span>
      <h1 class="h1">Reset your Merchant Partner password</h1>
      <p style="margin: 0 0 12px 0;">Hello <strong>${merchantName}</strong>, we received a request to reset your Vouchiqo Merchant portal password.</p>
      <div style="text-align: center; margin: 16px 0;">
        <a href="${resetUrl}" class="btn btn-blue">Reset Merchant Password →</a>
      </div>
      <p style="font-size: 12px; color: #64748b; margin: 0;">This secure link expires in 1 hour. If you didn't request this reset, your account credentials remain safe and no action is required.</p>
    `,
  });

  return dispatchMerchantEmail({
    to,
    subject: "Reset your Vouchiqo Merchant password",
    html,
  });
}
