import {
  Coffee,
  Heart,
  Laptop,
  Plane,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Zap,
} from "lucide-react";

// Mock data for featured coupons
export const FEATURED_COUPONS = [
  {
    _id: "c1",
    title: "Get 50% off your next 5 food orders",
    discountValue: 50,
    discountType: "percentage",
    description:
      "Valid on all restaurant deliveries above $15. Maximum discount cap of $10 per order.",
    category: "Food",
    successRate: 99,
    isMerchantVerified: true,
    isVouchiqoVerified: true,
    workedToday: true,
    merchantId: { name: "Zomato Delivery" },
  },
  {
    _id: "c2",
    title: "Save $20 on luxury stays globally",
    discountValue: 20,
    discountType: "fixed",
    description:
      "Book verified apartments and villas with no minimum night limits. Excludes service tax.",
    category: "Travel",
    successRate: 97,
    isMerchantVerified: true,
    isVouchiqoVerified: true,
    workedToday: true,
    merchantId: { name: "Airbnb Stays" },
  },
  {
    _id: "c3",
    title: "Exclusive Notion Plus Plan: $50 Free Credits",
    discountValue: 50,
    discountType: "fixed",
    description:
      "Upgrade your team workspace or personal workspace with $50 billing credits automatically applied.",
    category: "SaaS",
    successRate: 98,
    isMerchantVerified: true,
    isVouchiqoVerified: true,
    workedToday: false,
    merchantId: { name: "Notion Workspace" },
  },
];

// Trending Brands
export const TRENDING_BRANDS = [
  { name: "Stripe", category: "Payments", count: 8 },
  { name: "Shopify", category: "E-Commerce", count: 14 },
  { name: "Linear", category: "Productivity", count: 4 },
  { name: "Notion", category: "Productivity", count: 9 },
  { name: "Airbnb", category: "Travel", count: 11 },
  { name: "Swiggy", category: "Food Delivery", count: 16 },
];

// Trending Categories
export const HOME_CATEGORIES = [
  { name: "Food & Drink", icon: Coffee, color: "text-amber-500 bg-amber-50" },
  {
    name: "Fashion & Apparel",
    icon: ShoppingBag,
    color: "text-pink-500 bg-pink-50",
  },
  { name: "Tech & SaaS", icon: Laptop, color: "text-blue-500 bg-blue-50" },
  {
    name: "Travel & Hotels",
    icon: Plane,
    color: "text-blue-500 bg-blue-50",
  },
  { name: "Health & Care", icon: Heart, color: "text-rose-500 bg-rose-50" },
];

// Popular Revival Requests
export const POPULAR_REVIVAL_REQUESTS = [
  {
    brand: "Shopify Premium Store",
    discount: "20% OFF",
    votes: 489,
    pct: 90,
  },
  {
    brand: "Uber Premier Airport",
    discount: "$15 OFF",
    votes: 312,
    pct: 75,
  },
  {
    brand: "Notion Enterprise Plan",
    discount: "$100 CREDITS",
    votes: 219,
    pct: 60,
  },
];

// How It Works Steps
export const HOW_IT_WORKS_STEPS = [
  {
    title: "100% Brand Verification",
    desc: "Merchants authenticate directly on Vouchiqo. We cryptographically lock coupon validation keys.",
    icon: ShieldCheck,
  },
  {
    title: "Real-Time Success Metrics",
    desc: "We analyze client-side checkout inputs to dynamically display coupon claim success metrics.",
    icon: Zap,
  },
  {
    title: "Decentralized Restorations",
    desc: "Customers request revival of beloved expired deals, unlocking community-driven campaigns.",
    icon: RotateCcw,
  },
];

// Customer Testimonials
export const CUSTOMER_TESTIMONIALS = [
  {
    quote:
      "Vouchiqo is the first coupon website where the codes actually work on the first try. The dual-verification badges are a game changer.",
    author: "Sarah Jenkins",
    role: "Developer",
    rating: 5,
    savings: "Saved ₹4,500",
  },
  {
    quote:
      "As a small business owner, listing deals on Vouchiqo has helped us re-engage cart abandoners and double our checkout conversion rate.",
    author: "Marcus Vance",
    role: "Shopify Merchant",
    rating: 5,
    savings: "Saved ₹12,800",
  },
  {
    quote:
      "The coupon revival feature is amazing. We requested a discount extension from Starbucks and it was reactivated within two days!",
    author: "Jessica Croft",
    role: "Bargain Hunter",
    rating: 5,
    savings: "Saved ₹2,200",
  },
  {
    quote:
      "I saved over ₹5,000 on Home Improvement items for my new house in Ranchi using Marbella's coupons. 100% verified!",
    author: "Anish Sharma",
    role: "Homeowner",
    rating: 5,
    savings: "Saved ₹5,400",
  },
  {
    quote:
      "Finding working codes for flights and stays used to take hours. On Vouchiqo, I booked a trip to Goa and saved instantly. High trust, zero hassle.",
    author: "Pooja Roy",
    role: "Travel Vlogger",
    rating: 5,
    savings: "Saved ₹8,900",
  },
  {
    quote:
      "Revived an expired Notion credits offer. The system is extremely simple and actually gets the merchant to approve extensions. Unbelievable!",
    author: "Rohan Das",
    role: "Startup Founder",
    rating: 5,
    savings: "Saved ₹15,000",
  },
];

// Frequently Asked Questions
export const HOME_FAQS = [
  {
    q: "How does Vouchiqo verify coupon codes?",
    a: "We work directly with verified merchants. Code validity keys are integrated with their web stores. We also track client-side checkout conversion logs to ensure no stale discount codes exist.",
  },
  {
    q: "What is the Expired Coupon Revival System?",
    a: "If a specific offer has expired, customers can submit a revival vote. When a threshold is met, the system alerts the merchant, offering them conversion projections to incentivize reactivating the deal.",
  },
  {
    q: "Is Vouchiqo free to use for customers?",
    a: "Absolutely! Vouchiqo is completely free for members to discover, claim, and save coupons. Merchants pay a small monthly subscription to list campaign dashboards.",
  },
  {
    q: "How do I redeem a coupon on Vouchiqo?",
    a: "Simply click on the coupon you want, copy the code shown, and paste it at the checkout page of the respective brand's website. Some offers are click-to-activate and apply automatically.",
  },
  {
    q: "Can merchants list their own deals on Vouchiqo?",
    a: "Yes! Merchants can register and create a verified brand profile. After approval, they can list deals, track coupon usage analytics, and run revival campaigns directly from their dashboard.",
  },
  {
    q: "Are the deals on Vouchiqo location-specific?",
    a: "Yes, Vouchiqo supports geo-targeted offers. Based on your detected city, we surface deals from nearby brands and local merchants first, so you always see the most relevant offers.",
  },
  {
    q: "How often are new coupons added?",
    a: "New coupons and deals are added daily. Merchants update their campaigns in real time, and our system automatically removes expired codes to keep the listings fresh and reliable.",
  },
  {
    q: "What categories of deals does Vouchiqo cover?",
    a: "Vouchiqo covers 15+ categories including Fashion, Food & Dining, Electronics, Travel, Beauty, Home & Living, Grocery, Finance, Education, Gaming, and more.",
  },
  {
    q: "Does Vouchiqo have a mobile app?",
    a: "A dedicated mobile app is currently in development. In the meantime, our website is fully responsive and works seamlessly on all smartphones and tablets.",
  },
  {
    q: "How do I report a coupon that doesn't work?",
    a: "You can click the 'Report' button on any coupon card. Our team reviews reported codes within 24 hours and either updates or removes them to maintain high success rates.",
  },
];
