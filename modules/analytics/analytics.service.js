import AnalyticsEvent from "@/modules/analytics/analytics-event.model";
import Claim from "@/modules/claim/claim.model";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import Redemption from "@/modules/redemption/redemption.model";
import { NotFoundError } from "@/utils/app-error";
import { COUPON_STATUS } from "@/utils/constants";

/**
 * Get analytics for a merchant dashboard.
 * Returns aggregate stats: total coupons, redemptions, claims, impressions, clicks,
 * traffic sources, weekday performance, and period trends.
 *
 * @param {string} authId - Merchant's Better Auth user ID
 * @param {string} period - "7d" | "30d" | "90d" | "12m"
 */
export async function getMerchantAnalytics(authId, period = "30d") {
  const merchant = await Merchant.findOne({ authId }).lean();
  if (!merchant) throw new NotFoundError("Merchant profile");

  const merchantId = merchant._id;

  // Determine date boundary based on period
  const now = new Date();
  const startDate = new Date();
  if (period === "7d") {
    startDate.setDate(now.getDate() - 7);
  } else if (period === "90d") {
    startDate.setDate(now.getDate() - 90);
  } else if (period === "12m") {
    startDate.setMonth(now.getMonth() - 11);
    startDate.setDate(1);
  } else {
    // Default 30d
    startDate.setDate(now.getDate() - 30);
  }
  startDate.setHours(0, 0, 0, 0);

  const [
    couponsStats,
    recentRedemptions,
    recentClaims,
    topCoupons,
    eventTotals,
    trafficSourcesRaw,
    weekdayEventsRaw,
    eventsByPeriodRaw,
    redemptionsDailyRaw,
  ] = await Promise.all([
    // Aggregate coupon stats by status
    Coupon.aggregate([
      { $match: { merchantId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalViews: { $sum: "$viewCount" },
          totalClaims: { $sum: "$totalClaims" },
          totalRedemptions: { $sum: "$totalRedemptions" },
          totalClicks: { $sum: { $ifNull: ["$clickCount", 0] } },
          totalImpressions: { $sum: { $ifNull: ["$impressionCount", 0] } },
          totalCopyCodes: { $sum: { $ifNull: ["$copyCodeCount", 0] } },
          totalUniqueCodeGens: {
            $sum: { $ifNull: ["$uniqueCodeGenCount", 0] },
          },
        },
      },
    ]),

    // Redemptions in selected period
    Redemption.countDocuments({
      merchantId,
      createdAt: { $gte: startDate },
    }),

    // Claims in selected period
    Claim.countDocuments({
      merchantId,
      createdAt: { $gte: startDate },
    }),

    // Top performing coupons
    Coupon.find({ merchantId, status: COUPON_STATUS.ACTIVE })
      .sort({ totalRedemptions: -1, clickCount: -1 })
      .limit(5)
      .select(
        "title code totalRedemptions totalClaims viewCount clickCount impressionCount copyCodeCount expiresAt status",
      )
      .lean(),

    // Overall AnalyticsEvent counts in selected period
    AnalyticsEvent.aggregate([
      {
        $match: {
          merchantId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$eventType",
          total: { $sum: "$count" },
        },
      },
    ]),

    // Traffic sources breakdown (grouped by source)
    AnalyticsEvent.aggregate([
      {
        $match: {
          merchantId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$source",
          total: { $sum: "$count" },
        },
      },
    ]),

    // Weekday performance (group by $dayOfWeek)
    AnalyticsEvent.aggregate([
      {
        $match: {
          merchantId,
          date: { $gte: startDate },
          eventType: { $in: ["click", "redemption"] },
        },
      },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: "$date" },
            eventType: "$eventType",
          },
          total: { $sum: "$count" },
        },
      },
    ]),

    // Period events grouped by date and eventType
    AnalyticsEvent.aggregate([
      {
        $match: {
          merchantId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            dateStr: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            eventType: "$eventType",
          },
          total: { $sum: "$count" },
        },
      },
    ]),

    // Actual daily redemptions and revenue from Redemption collection
    Redemption.aggregate([
      {
        $match: {
          merchantId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRedemptions: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $ifNull: [
                "$originalPrice",
                { $ifNull: ["$savingsAmount", 0] },
              ],
            },
          },
        },
      },
    ]),
  ]);

  // Flatten coupon stats by status
  const statsByStatus = couponsStats.reduce((acc, s) => {
    acc[s._id] = {
      count: s.count,
      views: s.totalViews,
      claims: s.totalClaims,
      redemptions: s.totalRedemptions,
      clicks: s.totalClicks,
      impressions: s.totalImpressions,
      copyCodes: s.totalCopyCodes,
      uniqueCodeGens: s.totalUniqueCodeGens,
    };
    return acc;
  }, {});

  // Compute total impressions, clicks, copy codes from coupon totals or AnalyticsEvents
  let totalImpressions = merchant.totalImpressions || 0;
  let totalClicks = merchant.totalClicks || 0;
  let totalStoreViews = merchant.storePageViews || 0;

  for (const item of eventTotals) {
    if (item._id === "impression" && item.total > totalImpressions)
      totalImpressions = item.total;
    if (item._id === "click" && item.total > totalClicks)
      totalClicks = item.total;
    if (item._id === "store_view" && item.total > totalStoreViews)
      totalStoreViews = item.total;
  }

  // Calculate redemption rate based on actual data
  const redemptionRate =
    totalClicks > 0
      ? `${((recentRedemptions / totalClicks) * 100).toFixed(1)}%`
      : "0.0%";

  // Build traffic sources array from real analytics events
  const sourceNameMap = {
    homepage: "Homepage Ticker & Banners",
    category: "Category & Search Pages",
    direct: "Direct Referral Links",
    campaign: "Campaign & Push Alerts",
    search: "Search Engine Results",
    other: "Other Sources",
  };
  const sourceColorMap = {
    homepage: "#2563eb",
    category: "#e85d04",
    direct: "#10b981",
    campaign: "#8b5cf6",
    search: "#f59e0b",
    other: "#64748b",
  };

  const trafficSources = trafficSourcesRaw.map((src) => ({
    name: sourceNameMap[src._id] || src._id || "Direct Referral Links",
    value: src.total,
    color: sourceColorMap[src._id] || "#2563eb",
  }));

  // Build weekday performance array (Mon-Sun)
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayTrendMap = {
    Mon: { clicks: 0, redemptions: 0 },
    Tue: { clicks: 0, redemptions: 0 },
    Wed: { clicks: 0, redemptions: 0 },
    Thu: { clicks: 0, redemptions: 0 },
    Fri: { clicks: 0, redemptions: 0 },
    Sat: { clicks: 0, redemptions: 0 },
    Sun: { clicks: 0, redemptions: 0 },
  };

  for (const item of weekdayEventsRaw) {
    const dayName = dayNames[item._id.dayOfWeek - 1] || "Mon";
    if (item._id.eventType === "click") {
      weekdayTrendMap[dayName].clicks += item.total;
    } else if (item._id.eventType === "redemption") {
      weekdayTrendMap[dayName].redemptions += item.total;
    }
  }

  const weekdayTrend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (label) => ({
      label,
      clicks: weekdayTrendMap[label].clicks,
      redemptions: weekdayTrendMap[label].redemptions,
    }),
  );

  // Build continuous time-series trend array for period based strictly on real DB records
  const trend = [];
  const daysCount = period === "7d" ? 7 : period === "90d" ? 90 : 30;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const monthShort = d.toLocaleString("default", { month: "short" });
    const label =
      period === "7d"
        ? d.toLocaleString("default", { weekday: "short" })
        : `${d.getDate()} ${monthShort}`;

    const clickMatch = eventsByPeriodRaw.find(
      (e) => e._id.dateStr === dateStr && e._id.eventType === "click",
    );
    const redemptionMatch = eventsByPeriodRaw.find(
      (e) => e._id.dateStr === dateStr && e._id.eventType === "redemption",
    );
    const redDailyMatch = redemptionsDailyRaw.find(
      (r) => r._id === dateStr,
    );

    const clicks = clickMatch ? clickMatch.total : 0;
    const redCount = redDailyMatch
      ? redDailyMatch.totalRedemptions
      : (redemptionMatch ? redemptionMatch.total : 0);
    const revAmount = redDailyMatch ? redDailyMatch.totalRevenue : 0;

    trend.push({
      label,
      date: dateStr,
      clicks,
      views: clicks,
      redemptions: redCount,
      orders: redCount,
      revenue: revAmount,
    });
  }

  return {
    merchant: {
      businessName: merchant.businessName,
      slug: merchant.slug,
      logo: merchant.logo,
      category: merchant.category,
      totalCoupons: merchant.totalCoupons,
      totalRedemptions: merchant.totalRedemptions,
      totalClaims: merchant.totalClaims ?? 0,
      totalClicks,
      totalImpressions,
      storePageViews: totalStoreViews,
      followerCount: merchant.followerCount,
    },
    kpi: {
      totalImpressions,
      totalClicks,
      totalRedemptions: recentRedemptions,
      redemptionRate,
      storePageViews: totalStoreViews,
    },
    overview: statsByStatus,
    last30Days: {
      redemptions: recentRedemptions,
      claims: recentClaims,
    },
    topCoupons,
    trend,
    trafficSources,
    weekdayTrend,
  };
}
