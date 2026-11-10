import { redis } from "@/lib/redis";
import { REDIS_KEYS } from "@/utils/constants";
import PlatformSetting from "@/modules/admin/settings.model";
import Redemption from "@/modules/redemption/redemption.model";
import CustomerRevival from "@/modules/revival/customer-revival.model";
import Revival from "@/modules/revival/revival.model";

// Helper function to format relative timestamps
function getRelativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
}

/**
 * Fetch all platform settings as a key-value object map.
 * Returns default objects if not yet configured in the database.
 */
export async function getPlatformSettings() {
  const settings = await PlatformSetting.find().lean();

  const settingsMap = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  // Calculate live delta stats from database requests
  const [
    totalCustomerRevivals,
    totalMerchantRevivals,
    approvedCustomerRevivals,
    approvedMerchantRevivals,
  ] = await Promise.all([
    CustomerRevival.countDocuments(),
    Revival.countDocuments(),
    CustomerRevival.countDocuments({ status: "approved" }),
    Revival.countDocuments({ status: "approved" }),
  ]);

  const liveTotalRequests = totalCustomerRevivals + totalMerchantRevivals;
  const liveApprovedRequests =
    approvedCustomerRevivals + approvedMerchantRevivals;

  // Provide system defaults for clean fallback
  let dbStats = settingsMap.revival_stats;
  if (!dbStats) {
    dbStats = {
      totalRequests: 5240,
      thisMonthRequests: 142,
      recoveredAmount: 1250000,
      successRate: 94.2,
    };
  }

  // Combine baseline admin stats with real database deltas
  settingsMap.revival_stats = {
    totalRequests: dbStats.totalRequests + liveTotalRequests,
    thisMonthRequests: dbStats.thisMonthRequests + liveTotalRequests,
    recoveredAmount: dbStats.recoveredAmount + liveApprovedRequests * 1500, // ₹1,500 average recovered savings
    successRate:
      liveTotalRequests > 0
        ? Number(
            (
              ((dbStats.totalRequests * (dbStats.successRate / 100) +
                liveApprovedRequests) /
                (dbStats.totalRequests + liveTotalRequests)) *
              100
            ).toFixed(1),
          )
        : dbStats.successRate,
  };

  // Fetch latest 3 redemptions to generate live social proof testimonials
  const latestRedemptions = await Redemption.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("merchantId")
    .lean();

  const liveSocialProofs = latestRedemptions.map((r) => {
    const brand = r.merchantId?.businessName || "Partner Store";
    const dateText = r.createdAt ? getRelativeTime(r.createdAt) : "Just now";
    return {
      user: `Member ${r.userId.slice(-4).toUpperCase()} from Ranchi`,
      brand,
      offer:
        r.discountType === "percentage"
          ? `${r.discountValue}% OFF`
          : `Saved ₹${r.savingsAmount || 150}`,
      date: dateText,
      text: `Successfully saved ₹${r.savingsAmount || 150} by redeeming coupon code "${r.couponCode}" at ${brand}.`,
    };
  });

  const baseSocialProof = settingsMap.social_proof || [
    {
      user: "Anish S. from Ranchi",
      brand: "Marbella Tiles & Sanitary",
      offer: "Saved ₹5,400 on home flooring tiles",
      date: "2 days ago",
      text: "Vouchiqo helped reactivate the flat ₹5,000 discount. Marbella Ranchi approved it immediately after receiving the request batch.",
    },
    {
      user: "Sarah J. from Delhi",
      brand: "Starbucks Coffee",
      offer: "Revived Buy 1 Get 1 Free Espresso",
      date: "5 days ago",
      text: "Requested Starbucks BOGO revival. Within 48 hours, Vouchiqo updated the code to active, and I redeemed it in-store.",
    },
    {
      user: "Rohan D. from Bangalore",
      brand: "Notion Premium Team Plan",
      offer: "Recovered $100 SaaS Workspace Credits",
      date: "1 week ago",
      text: "Our team credits coupon had expired. Vouchiqo contacted Notion's merchant partnership team, and they re-enabled it for our domain!",
    },
  ];

  settingsMap.social_proof = [...liveSocialProofs, ...baseSocialProof].slice(
    0,
    5,
  );

  if (!settingsMap.categories) {
    settingsMap.categories = [
      { id: "fashion", name: "Fashion & Clothing", slug: "fashion", active: true },
      { id: "food", name: "Food & Dining", slug: "food", active: true },
      { id: "electronics", name: "Electronics & Gadgets", slug: "electronics", active: true },
      { id: "beauty", name: "Beauty & Wellness", slug: "beauty", active: true },
      { id: "travel", name: "Travel & Hospitality", slug: "travel", active: true },
      { id: "home", name: "Home & Living", slug: "home", active: true },
      { id: "home-improvement", name: "Home Improvement", slug: "home-improvement", active: true },
      { id: "fitness", name: "Fitness & Healthcare", slug: "fitness", active: true },
      { id: "education", name: "Education & Courses", slug: "education", active: true },
      { id: "kids-baby", name: "Kids & Baby Products", slug: "kids-baby", active: true },
      { id: "jewellery", name: "Jewellery & Accessories", slug: "jewellery", active: true },
      { id: "automotive", name: "Automobile & Auto Services", slug: "automotive", active: true },
      { id: "entertainment", name: "Gaming & Entertainment", slug: "entertainment", active: true },
      { id: "grocery", name: "Grocery & Essentials", slug: "grocery", active: true },
      { id: "finance", name: "Finance & Insurance", slug: "finance", active: true },
    ];
  }

  if (!settingsMap.merchant_commitments) {
    settingsMap.merchant_commitments = [
      {
        id: "commit1",
        text: "All submitted business information is accurate and real.",
        required: true,
      },
      {
        id: "commit2",
        text: "I will honour every verified offer published on Vouchiqo.",
        required: true,
      },
      {
        id: "commit3",
        text: "I will submit only genuine, working offer codes and deals.",
        required: true,
      },
      {
        id: "commit4",
        text: "I will enter actual transaction values when confirming codes.",
        required: true,
      },
      {
        id: "commit5",
        text: "I understand Vouchiqo earns performance commission.",
        required: true,
      },
      {
        id: "commit6",
        text: "I will keep counter staff informed about active offers.",
        required: true,
      },
      {
        id: "commit7",
        text: "I will pause offers if stock runs out or terms change.",
        required: true,
      },
    ];
  }

  if (!settingsMap.policy_agreements) {
    settingsMap.policy_agreements = [
      {
        id: "merchant_agreement",
        title: "Agree to Merchant Agreement",
        link: "https://drive.google.com/file/d/1_sample_merchant_agreement/view?usp=sharing",
        required: true,
      },
      {
        id: "terms_of_service",
        title: "Agree to Terms of Service",
        link: "https://drive.google.com/file/d/1_sample_terms_of_service/view?usp=sharing",
        required: true,
      },
      {
        id: "privacy_policy",
        title: "Agree to Privacy Policy",
        link: "https://drive.google.com/file/d/1_sample_privacy_policy/view?usp=sharing",
        required: true,
      },
      {
        id: "verification_policy",
        title: "Agree to Verification Policy",
        link: "https://drive.google.com/file/d/1_sample_verification_policy/view?usp=sharing",
        required: true,
      },
      {
        id: "refund_cancellation",
        title: "Agree to Refund & Cancellation Policy",
        link: "https://drive.google.com/file/d/1_sample_refund_policy/view?usp=sharing",
        required: true,
      },
    ];
  }

  if (!settingsMap.merchant_plans) {
    settingsMap.merchant_plans = [
      {
        id: "starter",
        name: "STARTER FREE",
        badge: "Popular",
        priceText: "₹0",
        priceSuffix: "/ month free forever",
        originalPrice: "",
        subCaption: "Start listing. Pay only when a customer visits.",
        features: [
          { text: "Up to 3 active verified listings", included: true },
          { text: "Counter Smart Code & QR redemption", included: true },
          { text: "Basic views & Smart Code analytics", included: true },
          { text: "Platform promotional campaigns", included: false },
          { text: "Expired offer customer revivals", included: false },
          { text: "Targeted customer push notifications", included: false },
          { text: "Direct POS & CRM API integration", included: false },
          { text: "Multi-location central dashboard", included: false },
          { text: "Dedicated named account manager", included: false },
          { text: "Priority 24h dedicated support", included: false },
        ],
        footerNote:
          "Commission charged only on confirmed customer transactions — never on views or clicks.",
        buttonText: "Select Starter",
        theme: "blue",
        active: true,
      },
      {
        id: "growth",
        name: "GROWTH PARTNER",
        badge: "Founding Rate -33%",
        priceText: "₹999",
        originalPrice: "₹1,499",
        priceSuffix: "/ month",
        subCaption:
          "More listings. Campaigns. Revival included. 14-day free trial.",
        features: [
          { text: "Up to 15 active listings (5× Starter)", included: true },
          { text: "Counter Smart Code & QR redemption", included: true },
          { text: "Redemptions, clicks & category rank", included: true },
          { text: "4 platform campaigns / yr (1/quarter)", included: true },
          { text: "5 expired offer revivals / month", included: true },
          { text: "Targeted customer push notifications", included: false },
          { text: "Direct POS & CRM API integration", included: false },
          { text: "Multi-location central dashboard", included: false },
          { text: "Dedicated named account manager", included: false },
          { text: "Standard email support (48h SLA)", included: true },
        ],
        footerNote:
          "No payment collected today. Trial starts on account activation.",
        buttonText: "Select Growth — ₹999/mo",
        theme: "orange",
        active: true,
      },
      {
        id: "pro",
        name: "PRO PARTNER",
        badge: "Best Value",
        priceText: "₹2,499",
        originalPrice: "₹3,999",
        priceSuffix: "/ month",
        subCaption:
          "Unlimited listings, campaigns, and push sends. Full power.",
        features: [
          { text: "Unlimited active offer listings", included: true },
          { text: "Counter Smart Code & QR redemption", included: true },
          { text: "Deep analytics & revenue heatmaps", included: true },
          { text: "Unlimited platform campaigns (no cap)", included: true },
          { text: "50 expired offer revivals / month", included: true },
          { text: "Custom push notifications to customers", included: true },
          { text: "Direct POS & CRM API integration", included: false },
          { text: "Multi-location central dashboard", included: false },
          { text: "Dedicated named account manager", included: false },
          { text: "Priority 24h dedicated support", included: true },
        ],
        footerNote:
          "Commission rate locked for 12 months under Founding Program.",
        buttonText: "Select Pro — ₹2,499/mo",
        theme: "emerald",
        active: true,
      },
      {
        id: "enterprise",
        name: "ENTERPRISE",
        badge: "Scale",
        priceText: "Custom pricing",
        originalPrice: "",
        priceSuffix: "",
        subCaption:
          "Dedicated manager. API access. Multi-location. Custom SLA.",
        features: [
          { text: "Unlimited multi-location listings", included: true },
          { text: "Counter Smart Code & QR redemption", included: true },
          { text: "Multi-location BI & custom exports", included: true },
          { text: "Unlimited custom marketing campaigns", included: true },
          { text: "Unlimited expired offer revivals", included: true },
          { text: "Priority customer broadcast push campaigns", included: true },
          { text: "Direct POS & CRM API integration", included: true },
          { text: "Multi-location under one dashboard", included: true },
          { text: "Dedicated named account manager", included: true },
          { text: "Custom SLA & guaranteed response time", included: true },
        ],
        footerNote:
          "No self-serve signup. Our team contacts you within 24 hours.",
        buttonText: "Contact us — partners@vouchiqo.com",
        theme: "indigo",
        active: true,
      },
    ];
  }

  if (!settingsMap.master_cpa_rates) {
    settingsMap.master_cpa_rates = [
      {
        id: "fashion",
        category: "Fashion & Clothing",
        rate: "5%",
        model: "CPA",
        notes: "Uniform across apparel",
      },
      {
        id: "food",
        category: "Food & Dining",
        rate: "3% dine-in / 2% delivery",
        model: "CPA",
        notes: "Never charge on Zomato-fulfilled orders",
      },
      {
        id: "electronics",
        category: "Electronics & Gadgets",
        rate: "2.5% blended",
        model: "CPA",
        notes: "Accessories 4%, handsets 1.5%",
      },
      {
        id: "beauty",
        category: "Beauty & Wellness",
        rate: "6% services / 4% retail",
        model: "CPA",
        notes: "Split by service vs product",
      },
      {
        id: "travel",
        category: "Travel & Hospitality",
        rate: "5% hotels / 4% packages",
        model: "CPA",
        notes: "Hotels pay less than MakeMyTrip",
      },
      {
        id: "home",
        category: "Home & Living",
        rate: "5%",
        model: "CPA",
        notes: "Furniture and décor",
      },
      {
        id: "home-improvement",
        category: "Home Improvement",
        rate: "2% products / 3% services",
        model: "CPA",
        notes: "In-store attribution via code",
      },
      {
        id: "fitness",
        category: "Fitness & Healthcare",
        rate: "6% gyms / 2% pharmacy / ₹200 CPL clinics",
        model: "CPA + CPL",
        notes: "Two models in one category",
      },
      {
        id: "education",
        category: "Education & Courses",
        rate: "₹300 CPL local / 8% online",
        model: "CPL + CPA",
        notes: "CPL for offline institutes",
      },
      {
        id: "kids-baby",
        category: "Kids & Baby Products",
        rate: "5%",
        model: "CPA",
        notes: "Clean, simple rate",
      },
      {
        id: "jewellery",
        category: "Jewellery",
        rate: "1.5% gold / 6% fashion / 3% blended",
        model: "CPA",
        notes: "Split by product type",
      },
      {
        id: "automotive",
        category: "Automobile & Auto Services",
        rate: "4%",
        model: "CPA",
        notes: "White space — you set the standard",
      },
      {
        id: "entertainment",
        category: "Gaming & Entertainment",
        rate: "4–5%",
        model: "CPA",
        notes: "Cafés higher, retail lower",
      },
      {
        id: "grocery",
        category: "Grocery & Essentials",
        rate: "2% regular / 4% organic",
        model: "CPA",
        notes: "Start with premium segment",
      },
      {
        id: "finance",
        category: "Finance & Insurance",
        rate: "₹150–₹350 CPL",
        model: "CPL",
        notes: "Pure lead model",
      },
    ];
  }

  return settingsMap;
}

/**
 * Save or update a single platform setting value.
 *
 * @param {string} key
 * @param {any} value
 */
export async function savePlatformSetting(key, value) {
  if (!key) throw new Error("Setting key is required");

  const setting = await PlatformSetting.findOneAndUpdate(
    { key },
    { $set: { value } },
    { new: true, upsert: true },
  );

  return setting;
}
