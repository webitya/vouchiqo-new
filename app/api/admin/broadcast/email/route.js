import mongoose from "mongoose";
import { sendEmail } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import Notification from "@/modules/notification/notification.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/broadcast/email
 * Returns registered platform users and merchants available for broadcast,
 * plus delivery provider configuration and sandbox status.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  // Better Auth stores registered users in the 'user' collection
  const db = mongoose.connection.db;

  const [rawUsers, merchants] = await Promise.all([
    db
      .collection("user")
      .find({ email: { $exists: true, $ne: "" } })
      .project({ _id: 1, id: 1, name: 1, email: 1, role: 1, createdAt: 1 })
      .toArray()
      .catch(() => []),
    Merchant.find()
      .select("businessName contactEmail phone")
      .lean()
      .catch(() => []),
  ]);

  // Customer shoppers (role != 'merchant')
  const shoppers = rawUsers.filter((u) => u.role !== "merchant");

  const shopperRecipients = shoppers.map((u) => ({
    userId: u.id || u._id?.toString(),
    email: u.email,
    name: u.name || "Valued Shopper",
    type: "user",
  }));

  const merchantRecipients = merchants
    .filter((m) => m.contactEmail)
    .map((m) => ({
      email: m.contactEmail,
      name: m.businessName || "Partner Merchant",
      type: "merchant",
    }));

  const allRecipients = [...shopperRecipients, ...merchantRecipients];

  const devRecipient = process.env.EMAIL_DEV_RECIPIENT || "vouchiqo@gmail.com";
  const isProduction = process.env.NODE_ENV === "production";

  return ok({
    totalUsers: shopperRecipients.length > 0 ? shopperRecipients.length : rawUsers.length,
    totalMerchants: merchantRecipients.length > 0 ? merchantRecipients.length : merchants.length,
    totalRecipients: allRecipients.length,
    sampleRecipients: allRecipients.slice(0, 10),
    providerInfo: {
      provider: "Resend",
      devRecipient,
      isProduction,
      // Resend test sandbox requires verified domain to send outside the account owner
      isSandboxMode: !isProduction,
      verifiedDomainNeeded: "vouchiqo.com",
    },
  });
});

/**
 * POST /api/admin/broadcast/email
 * Send live email broadcast (with in-app notification sync) or test copy.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const body = await request.json();
  const {
    subject,
    headline,
    description,
    bannerUrl,
    offerCode,
    ctaUrl,
    isTest,
    testEmail,
  } = body;

  if (!subject) {
    return Response.json(
      { status: "error", message: "Email subject is required" },
      { status: 400 },
    );
  }

  // Generate responsive Vouchiqo branded email HTML
  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fdf2f8; margin: 0; padding: 20px; color: #0f172a; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fbcfe8; box-shadow: 0 4px 20px rgba(244, 63, 94, 0.08); }
      .header { background: linear-gradient(135deg, #e11d48 0%, #db2777 100%); padding: 24px; text-align: center; color: #ffffff; }
      .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin: 0; }
      .subtag { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #fce7f3; margin-top: 4px; font-weight: 600; }
      .content { padding: 28px 24px; text-align: left; }
      .headline { font-size: 20px; font-weight: 700; color: #881337; margin: 0 0 12px 0; line-height: 1.3; }
      .description { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 20px; font-weight: 400; }
      .banner { width: 100%; max-height: 240px; object-fit: cover; border-radius: 12px; margin-bottom: 20px; border: 1px solid #fbcfe8; }
      .code-box { background: #fff1f2; border: 2px dashed #f43f5e; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0; }
      .code-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #9f1239; margin-bottom: 6px; letter-spacing: 0.5px; }
      .code { font-family: monospace; font-size: 22px; font-weight: 800; color: #e11d48; letter-spacing: 2px; }
      .btn { display: inline-block; background: #e11d48; color: #ffffff !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 32px; border-radius: 10px; margin-top: 10px; text-align: center; }
      .footer { background: #fff1f2; padding: 16px; text-align: center; font-size: 11px; color: #9f1239; border-top: 1px solid #fecdd3; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="logo">Vouchiqo</h1>
        <div class="subtag">Verified Local Deals &amp; Offers</div>
      </div>
      <div class="content">
        <h2 class="headline">${headline || subject}</h2>
        <p class="description">${description || "Unlock exclusive verified discounts across top partner outlets on Vouchiqo."}</p>
        ${bannerUrl ? `<img src="${bannerUrl}" class="banner" alt="Campaign Banner" />` : ""}
        ${
          offerCode
            ? `
          <div class="code-box">
            <div class="code-label">Use Promo Code At Counter</div>
            <div class="code">${offerCode}</div>
          </div>`
            : ""
        }
        <div style="text-align: center; margin-top: 24px;">
          <a href="${ctaUrl || "https://vouchiqo.com"}" class="btn">Claim Deal on Vouchiqo →</a>
        </div>
      </div>
      <div class="footer">
        © 2026 Vouchiqo • You are receiving this official promotional alert as a registered member.<br>
        Ranchi, Jharkhand, India.
      </div>
    </div>
  </body>
  </html>`;

  // Test mode: Send test copy to specified email
  if (isTest) {
    const target = testEmail || "admin@vouchiqo.com";
    const result = await sendEmail({
      to: target,
      subject: `[TEST BLAST] ${subject}`,
      html: emailHtml,
    });

    const isRedirected = result?.fallbackUsed;
    const msg = isRedirected
      ? `Test email dispatched! (Redirected to sandbox inbox: ${result.redirectedTo} because domain is unverified).`
      : `Test email sent successfully to ${target} via Resend`;

    return ok(
      { testEmail: target, result, status: "test_sent", fallbackUsed: isRedirected },
      msg,
    );
  }

  // Live broadcast mode: Send to registered database users/merchants based on recipientType
  const { recipientType = "all", syncInAppNotification = true } = body;
  const db = mongoose.connection.db;

  let targetList = [];
  let targetedUsers = [];

  if (recipientType === "users" || recipientType === "all") {
    const rawUsers = await db
      .collection("user")
      .find({ email: { $exists: true, $ne: "" } })
      .project({ _id: 1, id: 1, email: 1, name: 1, role: 1 })
      .toArray()
      .catch(() => []);

    const shoppers = rawUsers.filter((u) => recipientType === "all" || u.role !== "merchant");
    targetedUsers.push(...shoppers);
    targetList.push(...shoppers.map((u) => u.email).filter(Boolean));
  }

  if (recipientType === "merchants" || recipientType === "all") {
    const merchants = await Merchant.find({
      contactEmail: { $exists: true, $ne: "" },
    })
      .select("contactEmail businessName userId")
      .lean()
      .catch(() => []);

    targetList.push(...merchants.map((m) => m.contactEmail).filter(Boolean));
  }

  // Deduplicate and filter out invalid/placeholder emails
  const isValidBroadcastEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    const lower = email.toLowerCase().trim();
    if (!lower.includes("@") || !lower.includes(".")) return false;
    if (
      lower.endsWith("@example.com") ||
      lower.endsWith("@test.com") ||
      lower.endsWith("@sample.com")
    ) {
      return false;
    }
    return true;
  };

  targetList = [...new Set(targetList)].filter(isValidBroadcastEmail);
  if (targetList.length === 0) {
    targetList = ["admin@vouchiqo.com"];
  }

  // 1. IN-APP NOTIFICATION MULTI-CHANNEL SYNC
  // Persist announcement notification for each registered shopper in MongoDB
  let inAppNotifiedCount = 0;
  if (syncInAppNotification && targetedUsers.length > 0) {
    try {
      const now = new Date();
      const inAppDocs = targetedUsers
        .map((u) => {
          const uId = u.id || u._id?.toString();
          if (!uId) return null;
          return {
            userId: uId,
            type: "campaign",
            category: "campaign",
            title: headline || subject,
            message: description || "New exclusive platform announcement on Vouchiqo!",
            metadata: {
              offerCode: offerCode || "",
              ctaUrl: ctaUrl || "/deals",
              bannerUrl: bannerUrl || "",
              source: "email_blast_builder",
            },
            isRead: false,
            createdAt: now,
            updatedAt: now,
          };
        })
        .filter(Boolean);

      if (inAppDocs.length > 0) {
        await Notification.insertMany(inAppDocs, { ordered: false });
        inAppNotifiedCount = inAppDocs.length;
        console.log(`[Broadcast In-App Sync]: Created ${inAppNotifiedCount} in-app notifications for shoppers.`);
      }
    } catch (inAppErr) {
      console.warn("[Broadcast In-App Sync Warning]:", inAppErr.message);
    }
  }

  // 2. DISPATCH EMAILS VIA RESEND WITH RATE-LIMIT THROTTLING
  let deliveredDirectlyCount = 0;
  let sandboxRedirectCount = 0;
  let failedCount = 0;
  const dispatchList = targetList.slice(0, 50);

  // Send sequentially with 200ms delay to respect Resend rate limits
  for (const email of dispatchList) {
    try {
      const res = await sendEmail({
        to: email,
        subject,
        html: emailHtml,
      });

      if (res?.deliveredDirectly) {
        deliveredDirectlyCount++;
      } else if (res?.fallbackUsed) {
        sandboxRedirectCount++;
      } else if (res?.success) {
        deliveredDirectlyCount++;
      } else {
        failedCount++;
        console.warn(`[Broadcast Skipped for ${email}]:`, res?.error);
      }
    } catch (err) {
      failedCount++;
      console.warn(`[Broadcast Error for ${email}]:`, err.message);
    }

    // Short 200ms throttle to prevent 429 rate limit
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const devRecipient = process.env.EMAIL_DEV_RECIPIENT || "vouchiqo@gmail.com";
  const isSandboxMode = sandboxRedirectCount > 0 && deliveredDirectlyCount === 0;

  const message = isSandboxMode
    ? `Broadcast processed: ${inAppNotifiedCount} shoppers received In-App Notifications! (Resend sandbox routed emails to ${devRecipient} because domain vouchiqo.com is unverified).`
    : `Email broadcast delivered to ${deliveredDirectlyCount} recipients (and ${inAppNotifiedCount} In-App Notifications created)!`;

  return ok(
    {
      sentCount: deliveredDirectlyCount + sandboxRedirectCount,
      deliveredDirectlyCount,
      sandboxRedirectCount,
      inAppNotifiedCount,
      failedCount,
      recipientType,
      totalRecipients: targetList.length,
      isSandboxMode,
      sandboxEmail: devRecipient,
      status: "broadcast_completed",
    },
    message,
  );
});
