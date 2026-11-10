import mongoose from "mongoose";
import { auth } from "../lib/auth.js";
import { connectDB } from "../lib/mongodb.js";
import Merchant from "../modules/merchant/merchant.model.js";
import { ROLES } from "../utils/constants.js";

async function createMerchant() {
  console.log("Connecting to MongoDB...");
  await connectDB();
  const db = mongoose.connection.db;

  const email = process.env.INITIAL_MERCHANT_EMAIL || "merchant@vouchiqo.com";
  const password = process.env.INITIAL_MERCHANT_PASSWORD || "Merchant@123!";
  const name = process.env.INITIAL_MERCHANT_NAME || "Vouchiqo Prime Store";

  console.log(`Creating auth user: ${email}...`);

  try {
    await auth.api.signUpEmail({
      body: { email, password, name, role: ROLES.MERCHANT },
    });
  } catch (err) {
    console.log("Signup note:", err.message || err);
  }

  const u = await db.collection("user").findOne({ email });
  if (!u) {
    console.error("Failed to find or create user record.");
    process.exit(1);
  }

  await db.collection("user").updateOne({ _id: u._id }, { $set: { role: ROLES.MERCHANT } });
  const authId = u._id.toString();

  console.log("Creating or updating Merchant profile...");
  const slug = "vouchiqo-prime-store";
  let merchant = await Merchant.findOne({ authId });

  if (!merchant) {
    merchant = await Merchant.create({
      authId,
      businessName: name,
      slug,
      contactEmail: email,
      phone: "+91 98765 00000",
      category: "food",
      plan: "growth",
      status: "approved",
      address: "Main Road, Ranchi, Jharkhand 834001",
      isVerified: true,
      revivalCredits: 50,
    });
  } else {
    merchant.status = "approved";
    merchant.isVerified = true;
    await merchant.save();
  }

  console.log("\n==========================================");
  console.log("NEW MERCHANT ACCOUNT CREATED SUCCESSFULLY!");
  console.log("==========================================");
  console.log(`Email:       ${email}`);
  console.log(`Password:    ${password}`);
  console.log(`Portal Path: /auth/login or /merchant/dashboard`);
  console.log("==========================================\n");

  process.exit(0);
}

createMerchant().catch((err) => {
  console.error("Error creating merchant:", err);
  process.exit(1);
});
