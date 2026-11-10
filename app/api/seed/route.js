import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import Campaign from "@/modules/merchant/campaign.model";
import Merchant from "@/modules/merchant/merchant.model";
import UserProfile from "@/modules/user/user.model";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/seed
 * Seed Super Admin, 2 Customer Users, and 7 Fresh Merchants using Better Auth's native auth.api.signUpEmail.
 */
export async function GET(request) {
  // ABSOLUTE BLOCK in production — this route wipes all database data
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  // Dev-only: require a secret header to prevent accidental wipes
  const secret = request.headers.get("x-seed-secret");
  if (!secret || secret !== process.env.SEED_SECRET) {
    return Response.json(
      { error: "Unauthorized. Pass 'x-seed-secret' header with the correct SEED_SECRET value." },
      { status: 401 },
    );
  }
  console.log("[Seed Route] Started database seeding...");
  await connectDB();
  const db = mongoose.connection.db;

  try {
    // 1. Wipe all collections to start fresh
    const collections = await db.listCollections().toArray();
    for (const c of collections) {
      await db.collection(c.name).deleteMany({});
    }
    console.log("[Seed Route] Cleared existing database collections.");

    // Helper to safely sign up user via Better Auth
    const createAuthUser = async (name, email, password, role = "user") => {
      try {
        await auth.api.signUpEmail({
          body: { email, password, name, role },
        });
      } catch (err) {
        console.log(`[Seed Route] Note for ${email}:`, err.message || err);
      }
      const u = await db.collection("user").findOne({ email });
      if (u) {
        await db
          .collection("user")
          .updateOne({ _id: u._id }, { $set: { role } });
        return u._id.toString();
      }
      return null;
    };

    // 2. Create Super Admin
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123!";
    const adminEmail = `${process.env.ADMIN_USERNAME || "admin"}@vouchiqo.com`;
    await createAuthUser("Super Admin", adminEmail, adminPassword, ROLES.ADMIN);
    console.log(`[Seed Route] Created Super Admin: ${adminEmail}`);

    // 3. Create 2 Customer Users
    const customers = [
      {
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
      },
      {
        name: "Priya Singh",
        email: "priya.singh@example.com",
        phone: "+91 98765 43211",
      },
    ];

    for (const c of customers) {
      const authId = await createAuthUser(
        c.name,
        c.email,
        "User@123!",
        ROLES.USER,
      );
      if (authId) {
        await UserProfile.create({
          authId,
          name: c.name,
          email: c.email,
          phone: c.phone,
          city: "Ranchi",
          state: "Jharkhand",
          pincode: "834001",
        });
      }
    }
    console.log("[Seed Route] Created 2 Customer Users.");

    // 4. Create 7 Fresh Merchants
    const merchantsData = [
      {
        businessName: "Marbella Tiles & Sanitaryware",
        contactEmail: "marbella@vouchiqo.com",
        phone: "+91 98351 23456",
        category: "Home Improvement",
        plan: "pro",
        status: "approved",
        address: "Plot 42, Main Road, Overbridge, Ranchi, Jharkhand 834001",
      },
      {
        businessName: "Burger House",
        contactEmail: "burgerhouse@vouchiqo.com",
        phone: "+91 98351 23457",
        category: "Food & Dining",
        plan: "growth",
        status: "approved",
        address: "Nucleus Mall, Food Court, Ranchi, Jharkhand 834001",
      },
      {
        businessName: "JewelCraft Ranchi",
        contactEmail: "jewelcraft@vouchiqo.com",
        phone: "+91 98351 23458",
        category: "Jewelry & Luxury",
        plan: "enterprise",
        status: "approved",
        address: "Lalpur Chowk, Ranchi, Jharkhand 834001",
      },
      {
        businessName: "Kaveri Restaurant",
        contactEmail: "kaveri@vouchiqo.com",
        phone: "+91 98351 23459",
        category: "Fine Dining",
        plan: "starter",
        status: "approved",
        address: "Church Road, Commercial Complex, Ranchi 834001",
      },
      {
        businessName: "Trends Fashion Studio",
        contactEmail: "trendsfashion@vouchiqo.com",
        phone: "+91 98351 23460",
        category: "Fashion & Apparel",
        plan: "growth",
        status: "pending",
        address: "Opp. GEL Church Complex, Main Road, Ranchi 834001",
      },
      {
        businessName: "FitPulse Gym & Spa",
        contactEmail: "fitpulse@vouchiqo.com",
        phone: "+91 98351 23461",
        category: "Health & Fitness",
        plan: "starter",
        status: "pending",
        address: "Kanke Road, Near Rock Garden, Ranchi 834008",
      },
      {
        businessName: "Apex Electronics",
        contactEmail: "apexelectronics@vouchiqo.com",
        phone: "+91 98351 23462",
        category: "Electronics & Gadgets",
        plan: "starter",
        status: "rejected",
        address: "Daily Market, Main Road, Ranchi 834001",
      },
    ];

    for (const m of merchantsData) {
      const authId = await createAuthUser(
        m.businessName,
        m.contactEmail,
        "Merchant@123!",
        ROLES.MERCHANT,
      );
      if (authId) {
        const slug = m.businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const merchantDoc = await Merchant.create({
          authId,
          businessName: m.businessName,
          slug,
          contactEmail: m.contactEmail,
          phone: m.phone,
          category: m.category,
          plan: m.plan,
          status: m.status,
          address: m.address,
          isVerified: m.status === "approved",
          revivalCredits: 50,
        });

        // If merchant is approved, add 1 live coupon and 1 pending review campaign
        if (m.status === "approved") {
          await Coupon.create({
            merchantId: merchantDoc._id,
            title: `Flat 20% OFF at ${m.businessName}`,
            code: `${m.businessName.substring(0, 4).toUpperCase()}20`,
            discountType: "percentage",
            discountValue: 20,
            category: m.category,
            status: "active",
            claimsCount: 15,
            totalLimit: 500,
            expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          });

          await Campaign.create({
            merchantId: merchantDoc._id,
            name: `${m.businessName} Festive Special Campaign`,
            type: "festival",
            status: "pending_review",
            headline: `Special Offer from ${m.businessName}`,
            offerDetails: {
              code: `${m.businessName.substring(0, 4).toUpperCase()}FEST`,
              discountValue: 25,
              redemptionLimit: 1000,
            },
            startDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
            endDate: new Date(Date.now() + 10 * 24 * 3600 * 1000),
          });
        }
      }
    }
    console.log(
      "[Seed Route] Created 7 Fresh Merchants with active coupons & campaigns.",
    );

    return Response.json({
      status: "success",
      message:
        "Database seeded successfully with 1 Admin, 2 Users, and 7 Merchants!",
    });
  } catch (err) {
    console.error("[Seed Route] Error seeding database:", err);
    return Response.json(
      {
        status: "error",
        message: err.message || "Failed to seed database.",
      },
      { status: 500 },
    );
  }
}
