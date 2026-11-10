import mongoose from "mongoose";
import { NextResponse } from "next/server";
import {
  sendMerchantApprovedEmail,
  sendMerchantRejectedEmail,
} from "@/lib/email/merchant-email";
import { redis } from "@/lib/redis";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import MerchantApplication from "@/modules/merchant/merchant-application.model";
import { REDIS_KEYS, ROLES } from "@/utils/constants";

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (MONGODB_URI) {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    let appData = null;
    if (mongoose.connection.readyState >= 1) {
      appData = await MerchantApplication.findOne({
        $or: [
          { applicationId: id },
          { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        ],
      }).lean();
    }

    if (!appData) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: appData });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  // Admin-only: only admins can approve/reject merchant applications
  try {
    await requireRole(req, ROLES.ADMIN);
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Admin access required." },
      { status: 403 },
    );
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, actionNote, rejectionReason, documentUpdate } = body;

    await connectDB();

    let application = null;
    if (mongoose.connection.readyState >= 1) {
      application = await MerchantApplication.findOne({
        $or: [
          { applicationId: id },
          { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        ],
      });
    }

    // Map percentage to status
    let progressPercentage = 33;
    let newTimelineEvent = null;

    if (status === "under_review") {
      progressPercentage = 66;
      newTimelineEvent = {
        title: "Under Review by Admin",
        detail:
          actionNote ||
          "Compliance team started verification of business documents.",
        type: "warning",
      };
    } else if (status === "document_verified") {
      progressPercentage = 85;
      newTimelineEvent = {
        title: "All Documents Verified Successfully",
        detail:
          actionNote ||
          "GSTIN, PAN, and Trade License verified by Vouchiqo Team.",
        type: "success",
      };
    } else if (status === "approved") {
      progressPercentage = 100;
      newTimelineEvent = {
        title: "Application Approved & Verified",
        detail:
          actionNote ||
          "Congratulations! Account is ready. Activation window: within 2 hours.",
        type: "success",
      };
    } else if (status === "rejected") {
      progressPercentage = 100;
      newTimelineEvent = {
        title: "Application Needs Attention / Rejected",
        detail:
          rejectionReason || "Document mismatch or incomplete information.",
        type: "error",
      };
    }

    if (application) {
      application.status = status || application.status;
      application.progressPercentage = progressPercentage;
      if (rejectionReason) application.rejectionReason = rejectionReason;
      application.lastUpdatedAt = new Date();

      if (newTimelineEvent) {
        application.timeline.unshift({
          ...newTimelineEvent,
          timestamp: new Date(),
        });
      }

      if (documentUpdate) {
        const doc = application.documents.find(
          (d) => d.name === documentUpdate.name,
        );
        if (doc) {
          doc.status = documentUpdate.status;
          doc.verifiedAt = new Date();
        }
      }

      await application.save();
    }

    // Sync status update to Merchant model in DB
    if (status) {
      const merchantStatus =
        status === "document_verified" ? "pending" : status;
      await Merchant.updateMany(
        {
          $or: [
            { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
            ...(application?.email
              ? [{ contactEmail: application.email.toLowerCase().trim() }]
              : []),
          ],
        },
        {
          $set: {
            status: merchantStatus,
            isVerified: merchantStatus === "approved",
            ...(rejectionReason ? { rejectionReason } : {}),
          },
        },
      ).catch(() => {});

      const targetEmail = application?.email || application?.contactEmail;
      if (status === "approved" && mongoose.connection?.db) {
        const db = mongoose.connection.db;
        const appUserId = application?.userId || application?.authId;
        const normalizedTargetEmail = targetEmail
          ? targetEmail.toLowerCase().trim()
          : null;

        // Upgrade user & session roles to merchant
        await db
          .collection("user")
          .updateMany(
            {
              $or: [
                ...(appUserId
                  ? [{ id: String(appUserId) }, { _id: String(appUserId) }]
                  : []),
                ...(normalizedTargetEmail
                  ? [{ email: normalizedTargetEmail }]
                  : []),
              ],
            },
            { $set: { role: "merchant" } },
          )
          .catch(() => {});

        await db
          .collection("user_profiles")
          .updateMany(
            {
              $or: [
                ...(appUserId ? [{ authId: String(appUserId) }] : []),
                ...(normalizedTargetEmail
                  ? [{ email: normalizedTargetEmail }]
                  : []),
              ],
            },
            { $set: { role: "merchant" } },
          )
          .catch(() => {});

        // Invalidate Redis sessions
        if (appUserId) {
          await redis
            .del(REDIS_KEYS.merchantProfile(String(appUserId)))
            .catch(() => {});
          await redis
            .del(REDIS_KEYS.userRole(String(appUserId)))
            .catch(() => {});
          const sessions = await db
            .collection("session")
            .find({ userId: String(appUserId) })
            .toArray()
            .catch(() => []);
          for (const s of sessions) {
            if (s.token) {
              await redis.del(REDIS_KEYS.session(s.token)).catch(() => {});
              await redis.del(`auth:session:${s.token}`).catch(() => {});
            }
          }
          await db
            .collection("session")
            .updateMany(
              { userId: String(appUserId) },
              { $set: { role: "merchant" } },
            )
            .catch(() => {});
        }
      }

      if (targetEmail) {
        if (status === "approved") {
          sendMerchantApprovedEmail({
            to: targetEmail,
            businessName: application?.businessName || "Merchant",
            liaisonName: application?.contactName,
          }).catch((err) => console.error("[Approved Email Error]:", err));
        } else if (status === "rejected") {
          sendMerchantRejectedEmail({
            to: targetEmail,
            businessName: application?.businessName || "Merchant",
            liaisonName: application?.contactName,
            rejectionReason,
          }).catch((err) => console.error("[Rejected Email Error]:", err));
        }
      }
    }

    if (application) {
      return NextResponse.json({ success: true, data: application });
    }

    // Fallback response if using in-memory demo
    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      updatedStatus: status,
      progressPercentage,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
