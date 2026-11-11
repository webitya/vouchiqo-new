import { Suspense } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { logger } from "@/lib/logger";
import { connectDB } from "@/lib/mongodb";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import Coupon from "@/modules/coupon/coupon.model";
import { COUPON_CATEGORIES } from "@/utils/constants";
import CategoriesClient from "./categories-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Categories Deals, Offers & Promo Codes | Vouchiqo",
  description:
    "Discover verified coupons and brand deals across 15 popular categories on Vouchiqo. Find the best offers on fashion, food, electronics, travel, beauty, and more.",
};

// 15 Curated Categories with rich photography, subcategories & descriptions
export const CATEGORY_META = {
  fashion: {
    title: "Fashion & Clothing",
    slug: "fashion",
    description: "Apparel, western & ethnic wear, footwear and bags.",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop",
    subs: [
      "Men's Fashion",
      "Women's Wear",
      "Footwear",
      "Watches & Accessories",
    ],
  },
  food: {
    title: "Food & Dining",
    slug: "food",
    description: "Restaurants, cafes, cloud kitchens and food delivery.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop",
    subs: ["Fast Food", "Fine Dining", "Bakeries & Desserts", "Cloud Kitchens"],
  },
  electronics: {
    title: "Electronics & Gadgets",
    slug: "electronics",
    description: "Smartphones, laptops, audio tech and smart appliances.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
    subs: ["Smartphones", "Laptops & PCs", "Headphones & Audio", "Smart Home"],
  },
  beauty: {
    title: "Beauty & Wellness",
    slug: "beauty",
    description: "Salons, spas, skincare, cosmetics and personal care.",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
    subs: ["Makeup", "Skincare", "Salons & Spas", "Fragrance"],
  },
  travel: {
    title: "Travel & Hospitality",
    slug: "travel",
    description: "Flights, luxury hotels, staycations and tour bookings.",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop",
    subs: [
      "Hotels & Resorts",
      "Flight Tickets",
      "Tour Packages",
      "Car Rentals",
    ],
  },
  home: {
    title: "Home & Living",
    slug: "home",
    description: "Furniture, home decor, kitchenware and bedding essentials.",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop",
    subs: ["Furniture", "Home Décor", "Kitchenware", "Furnishings"],
  },
  "home-improvement": {
    title: "Home Improvement",
    slug: "home-improvement",
    description: "Hardware, tools, lighting, fixtures and DIY upgrades.",
    image:
      "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?q=80&w=600&auto=format&fit=crop",
    subs: ["Tiles & Granite", "Hardware & Tools", "Paints", "Electricals"],
  },
  fitness: {
    title: "Fitness & Healthcare",
    slug: "fitness",
    description: "Gym memberships, wellness therapy, supplements and gear.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
    subs: ["Gym Memberships", "Protein & Supplements", "Pharmacies", "Labs"],
  },
  education: {
    title: "Education & Courses",
    slug: "education",
    description: "Online tutorials, certification programs and books.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop",
    subs: ["Coaching Classes", "Online Courses", "Certifications", "Bootcamps"],
  },
  "kids-baby": {
    title: "Kids & Baby Care",
    slug: "kids-baby",
    description: "Baby toys, children's fashion, maternal care and diapers.",
    image:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop",
    subs: ["Toys & Games", "Baby Care", "Kidswear", "Nursery"],
  },
  jewellery: {
    title: "Jewellery & Accessories",
    slug: "jewellery",
    description:
      "Gold, silver, diamonds, fashion jewellery and luxury watches.",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop",
    subs: [
      "Gold & Diamond",
      "Silver Jewellery",
      "Fashion Jewellery",
      "Eyewear",
    ],
  },
  automotive: {
    title: "Automobile & Services",
    slug: "automotive",
    description: "Car repairs, bike accessories, detailing and maintenance.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop",
    subs: ["Car Services", "Auto Spare Parts", "Tyres & Care", "Accessories"],
  },
  entertainment: {
    title: "Gaming & Entertainment",
    slug: "entertainment",
    description: "Video games, OTT streaming, movies, concerts and events.",
    image:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop",
    subs: ["Gaming Consoles", "Peripherals", "Movie Tickets", "Events"],
  },
  grocery: {
    title: "Grocery & Essentials",
    slug: "grocery",
    description: "Fresh farm fruits, dairy, supermarket staples and snacks.",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop",
    subs: ["Daily Grocery", "Organic Produce", "Dairy & Bakery", "Dry Fruits"],
  },
  finance: {
    title: "Finance & Insurance",
    slug: "finance",
    description:
      "Credit card offers, insurance plans, banking and investments.",
    image:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop",
    subs: ["Credit Cards", "Insurance Plans", "Mutual Funds", "Personal Loans"],
  },
};

export default async function CategoriesPage() {
  await connectDB();

  // Parallel database execution (Rule 74 — eliminate request waterfalls)
  const [couponCounts, affiliateCounts] = await Promise.all([
    Coupon.aggregate([
      {
        $match: {
          status: "active",
          expiresAt: { $gt: new Date() },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: 1 },
        },
      },
    ]),
    AffiliateProduct.aggregate([
      {
        $match: {
          status: "active",
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: 1 },
        },
      },
    ]).catch((err) => {
      logger.error({ err }, "Error fetching affiliate category counts");
      return [];
    }),
  ]);

  const couponCountMap = new Map();
  for (const c of couponCounts) {
    if (c._id) couponCountMap.set(c._id, c.total);
  }
  const affiliateCountMap = new Map();
  for (const a of affiliateCounts) {
    if (a._id) affiliateCountMap.set(a._id, a.total);
  }

  // Build 15 categories with accurate live counts & rich photography
  const categories = COUPON_CATEGORIES.filter((s) => s !== "others").map(
    (slug) => {
      const meta = CATEGORY_META[slug] || {
        title: slug,
        slug,
        description: "Explore top verified discount offers.",
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
        subs: [],
      };

      const cCount = couponCountMap.get(slug) || 0;
      const aCount = affiliateCountMap.get(slug) || 0;
      const totalOffers = cCount + aCount;

      return {
        ...meta,
        slug,
        total: totalOffers,
        couponCount: cCount,
        affiliateCount: aCount,
      };
    },
  );

  const totalOffersCount = categories.reduce((a, c) => a + c.total, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#35104A] font-sans selection:bg-[#FFD166]/30 selection:text-[#35104A]">
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-[60vh] bg-[#FFFDF9] flex items-center justify-center text-[#6B4C82] text-sm font-medium">
            Loading categories...
          </div>
        }
      >
        <CategoriesClient
          categories={categories}
          totalCategories={categories.length}
          totalOffers={totalOffersCount}
        />
      </Suspense>
      <Footer />
    </div>
  );
}
