import { Suspense } from "react";
import { redis } from "@/lib/redis";
import { REDIS_KEYS, REDIS_TTL } from "@/utils/constants";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { connectDB } from "@/lib/mongodb";
import Coupon from "@/modules/coupon/coupon.model";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import { COUPON_CATEGORIES } from "@/utils/constants";
import CategoryClient from "./category-client";

export const dynamic = "force-dynamic";

// Category metadata with sub-categories
export const CATEGORY_META = {
  fashion: {
    title: "Fashion & Clothing",
    subs: ["Men's Fashion", "Women's Wear", "Footwear", "Watches & Accessories"],
  },
  food: {
    title: "Food & Dining",
    subs: ["Fast Food", "Fine Dining", "Bakeries & Desserts", "Cloud Kitchens"],
  },
  electronics: {
    title: "Electronics & Gadgets",
    subs: ["Smartphones", "Laptops & PCs", "Headphones & Audio", "Smart Home"],
  },
  beauty: {
    title: "Beauty & Wellness",
    subs: ["Makeup", "Skincare", "Salons & Spas", "Fragrance"],
  },
  travel: {
    title: "Travel & Hospitality",
    subs: ["Hotels & Resorts", "Flight Tickets", "Tour Packages", "Car Rentals"],
  },
  home: {
    title: "Home & Living",
    subs: ["Furniture", "Home Décor", "Kitchenware", "Furnishings"],
  },
  "home-improvement": {
    title: "Home Improvement",
    subs: ["Tiles & Granite", "Hardware & Tools", "Paints", "Electricals"],
  },
  fitness: {
    title: "Fitness & Healthcare",
    subs: ["Gym Memberships", "Protein & Supplements", "Pharmacies", "Labs"],
  },
  education: {
    title: "Education & Courses",
    subs: ["Coaching Classes", "Online Courses", "Certifications", "Skill Bootcamps"],
  },
  "kids-baby": {
    title: "Kids & Baby Care",
    subs: ["Toys & Games", "Baby Care", "Kidswear", "Nursery"],
  },
  jewellery: {
    title: "Jewellery & Accessories",
    subs: ["Gold & Diamond", "Silver Jewellery", "Fashion Jewellery", "Eyewear"],
  },
  automotive: {
    title: "Automobile & Services",
    subs: ["Car Services", "Auto Spare Parts", "Tyres & Care", "Car Accessories"],
  },
  entertainment: {
    title: "Gaming & Entertainment",
    subs: ["Gaming Consoles", "Peripherals", "Movie Tickets", "Events"],
  },
  grocery: {
    title: "Grocery & Essentials",
    subs: ["Daily Grocery", "Organic Produce", "Dairy & Bakery", "Dry Fruits"],
  },
  finance: {
    title: "Finance & Insurance",
    subs: ["Credit Cards", "Insurance Plans", "Mutual Funds", "Personal Loans"],
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase();
  const categoryInfo = CATEGORY_META[cleanSlug] || {
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
  };

  return {
    title: `Verified ${categoryInfo.title} Deals, Offers & Promo Codes | Vouchiqo`,
    description: `Discover verified discount offers, promotional codes, and price drops in ${categoryInfo.title} on Vouchiqo.`,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase();

  // Validate category slug
  const validSlugs = COUPON_CATEGORIES.filter((s) => s !== "others");
  if (!validSlugs.includes(cleanSlug)) {
    notFound();
  }

  await connectDB();

  const categoryInfo = CATEGORY_META[cleanSlug] || {
    title: cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1),
    subs: [],
  };

  const safeCategoryTitle = String(categoryInfo.title || cleanSlug);
  const categoryRegex = new RegExp(cleanSlug.replace(/-/g, "|"), "i");

  // Fetch active coupons in category
  const rawCoupons = await Coupon.find({
    status: "active",
    expiresAt: { $gt: new Date() },
    $or: [
      { category: cleanSlug },
      { category: safeCategoryTitle },
      { category: categoryRegex },
    ],
  })
    .populate("merchantId", "businessName slug logo")
    .sort({ totalClaims: -1, createdAt: -1 })
    .lean();

  const coupons = JSON.parse(JSON.stringify(rawCoupons || []));

  // Fetch active affiliate products in category
  const rawAffiliates = await AffiliateProduct.find({
    status: "active",
    $or: [
      { category: cleanSlug },
      { category: safeCategoryTitle },
      { category: categoryRegex },
    ],
  })
    .populate("merchantId", "businessName slug logo")
    .sort({ createdAt: -1 })
    .lean();

  const affiliateProducts = JSON.parse(JSON.stringify(rawAffiliates || []));

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-slate-50" />}><CategoryClient
        categoryInfo={{
          ...categoryInfo,
          slug: cleanSlug,
        }}
        coupons={coupons}
        affiliateProducts={affiliateProducts}
      />
      </Suspense>
      <Footer />
    </div>
  );
}
