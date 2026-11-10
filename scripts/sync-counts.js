import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

async function syncAllMerchantOfferCounts() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const couponsColl = db.collection("coupons");
  const affiliatesColl = db.collection("affiliate_products");
  const merchantsColl = db.collection("merchants");

  const merchants = await merchantsColl.find({}).toArray();
  console.log(`Found ${merchants.length} merchants to check.`);

  let updatedCount = 0;
  for (const m of merchants) {
    const couponCount = await couponsColl.countDocuments({
      merchantId: m._id,
      status: { $nin: ["deleted"] },
    });

    const affiliateCount = await affiliatesColl.countDocuments({
      merchantId: m._id,
      status: { $nin: ["deleted"] },
    });

    const totalOffers = couponCount + affiliateCount;

    if (m.totalCoupons !== totalOffers) {
      await merchantsColl.updateOne(
        { _id: m._id },
        { $set: { totalCoupons: totalOffers } }
      );
      console.log(
        `Updated [${m.businessName}] (${m.slug}): coupons=${couponCount}, affiliates=${affiliateCount} => totalOffers=${totalOffers} (was ${m.totalCoupons})`
      );
      updatedCount++;
    }
  }

  console.log(`\nSync completed: ${updatedCount} merchants updated.`);
  await mongoose.disconnect();
  process.exit(0);
}

syncAllMerchantOfferCounts().catch((err) => {
  console.error("Error syncing merchant counts:", err);
  process.exit(1);
});
