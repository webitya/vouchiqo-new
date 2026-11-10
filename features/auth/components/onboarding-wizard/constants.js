"use client";

import React from "react";

export const CATEGORIES = [
  { id: "fashion", label: "Fashion & Clothing" },
  { id: "food", label: "Food & Dining" },
  { id: "electronics", label: "Electronics & Gadgets" },
  { id: "beauty", label: "Beauty & Wellness" },
  { id: "travel", label: "Travel & Hospitality" },
  { id: "home", label: "Home & Living" },
  { id: "home-improvement", label: "Home Improvement" },
  { id: "fitness", label: "Fitness & Healthcare" },
  { id: "education", label: "Education & Courses" },
  { id: "kids-baby", label: "Kids & Baby Products" },
  { id: "jewellery", label: "Jewellery & Accessories" },
  { id: "automotive", label: "Automobile & Auto Services" },
  { id: "entertainment", label: "Gaming & Entertainment" },
  { id: "grocery", label: "Grocery & Essentials" },
  { id: "finance", label: "Finance & Insurance" },
  { id: "others", label: "Others / Special Category" },
];

export const BUSINESS_CONSTITUTIONS = [
  { id: "proprietorship", label: "Proprietorship" },
  { id: "partnership", label: "Partnership" },
  { id: "llp", label: "Limited Liability Partnership (LLP)" },
  { id: "pvt_ltd", label: "Private Limited Company (Pvt Ltd)" },
  { id: "others", label: "Others" },
];

export const DESIGNATIONS = [
  { id: "owner", label: "Owner / Proprietor" },
  { id: "partner", label: "Managing Partner" },
  { id: "manager", label: "General Manager / Operations Head" },
  { id: "others", label: "Others / Authorized Liaison" },
];

export const COMMISSION_TABLE = [
  { id: "fashion", category: "Fashion & Clothing", rate: "5%", model: "CPA", notes: "Uniform across apparel" },
  { id: "food", category: "Food & Dining", rate: "3% dine-in / 2% delivery", model: "CPA", notes: "Never charge on Zomato-fulfilled orders" },
  { id: "electronics", category: "Electronics & Gadgets", rate: "2.5% blended", model: "CPA", notes: "Accessories 4%, handsets 1.5%" },
  { id: "beauty", category: "Beauty & Wellness", rate: "6% services / 4% retail", model: "CPA", notes: "Split by service vs product" },
  { id: "travel", category: "Travel & Hospitality", rate: "5% hotels / 4% packages", model: "CPA", notes: "Hotels pay less than MakeMyTrip" },
  { id: "home", category: "Home & Living", rate: "5%", model: "CPA", notes: "Furniture and décor" },
  { id: "home-improvement", category: "Home Improvement", rate: "2% products / 3% services", model: "CPA", notes: "In-store attribution via code" },
  { id: "fitness", category: "Fitness & Healthcare", rate: "6% gyms / 2% pharmacy / ₹200 CPL clinics", model: "CPA + CPL", notes: "Two models in one category" },
  { id: "education", category: "Education & Courses", rate: "₹300 CPL local / 8% online", model: "CPL + CPA", notes: "CPL for offline institutes" },
  { id: "kids-baby", category: "Kids & Baby Products", rate: "5%", model: "CPA", notes: "Clean, simple rate" },
  { id: "jewellery", category: "Jewellery & Accessories", rate: "1.5% gold / 6% fashion / 3% blended", model: "CPA", notes: "Split by product type" },
  { id: "automotive", category: "Automobile & Auto Services", rate: "4%", model: "CPA", notes: "White space — you set the standard" },
  { id: "entertainment", category: "Gaming & Entertainment", rate: "4–5%", model: "CPA", notes: "Cafés higher, retail lower" },
  { id: "grocery", category: "Grocery & Essentials", rate: "2% regular / 4% organic", model: "CPA", notes: "Start with premium segment" },
  { id: "finance", category: "Finance & Insurance", rate: "₹150–₹350 CPL", model: "CPL", notes: "Pure lead model" },
];

export const DEFAULT_COMMITMENTS = [
  { id: "commit1", key: "commit1", text: "All submitted business information is accurate and real.", required: true },
  { id: "commit2", key: "commit2", text: "I will honour every verified offer published on Vouchiqo.", required: true },
  { id: "commit3", key: "commit3", text: "I will submit only genuine, working offer codes and deals.", required: true },
  { id: "commit4", key: "commit4", text: "I will enter actual transaction values when confirming codes.", required: true },
  { id: "commit5", key: "commit5", text: "I understand Vouchiqo earns performance commission.", required: true },
  { id: "commit6", key: "commit6", text: "I will keep counter staff informed about active offers.", required: true },
  { id: "commit7", key: "commit7", text: "I will pause offers if stock runs out or terms change.", required: true },
];

export const DEFAULT_POLICIES = [
  { id: "merchant_agreement", key: "policy1", title: "Agree to Merchant Agreement", link: "https://drive.google.com/file/d/1_sample_merchant_agreement/view?usp=sharing", required: true },
  { id: "terms_of_service", key: "policy2", title: "Agree to Terms of Service", link: "https://drive.google.com/file/d/1_sample_terms_of_service/view?usp=sharing", required: true },
  { id: "privacy_policy", key: "policy3", title: "Agree to Privacy Policy", link: "https://drive.google.com/file/d/1_sample_privacy_policy/view?usp=sharing", required: true },
  { id: "verification_policy", key: "policy4", title: "Agree to Verification Policy", link: "https://drive.google.com/file/d/1_sample_verification_policy/view?usp=sharing", required: true },
  { id: "refund_cancellation", key: "policy5", title: "Agree to Refund & Cancellation Policy", link: "https://drive.google.com/file/d/1_sample_refund_policy/view?usp=sharing", required: true },
];

export const DEFAULT_PLANS = [
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

export const MASTER_STEPS = [
  { stepNum: 1, title: "Business & Location", label: "Sections A & B" },
  { stepNum: 2, title: "Documents & Plan", label: "Sections C & D" },
  { stepNum: 3, title: "Hours & Submit", label: "Sections E & F" },
];

export const INITIAL_FORM_DATA = {
  // Section A: Business Identity & Location
  registeredName: "",
  tradingName: "",
  constitution: "proprietorship",
  category: "food",
  customCategoryNotes: "",
  businessType: "Physical Store / Retail Shop",
  address: "",
  city: "Ranchi",
  state: "Jharkhand",
  pincode: "834001",
  latitude: "",
  longitude: "",

  // Section B: Contact & Account Setup
  contactName: "",
  designation: "owner",
  mobile: "",
  whatsapp: "",
  email: "",
  password: "",
  websiteUrl: "",
  instagramHandle: "",
  facebookUrl: "",
  googleUrl: "",

  // Section C: Documents & Uploads
  docType: "GST Registration Certificate",
  docFileUrl: "",
  shopPhotoUrl: "",
  logoUrl: "",
  bannerUrl: "",
  signatureUrl: "",

  // Section D: Plan
  selectedPlan: "starter",
  referralCode: "",

  // Section E: Commission & Hours
  commissionAgreed: false,
  openingTime: "10:00 AM",
  closingTime: "08:00 PM",
  operatingHours: {
    Monday: { isOpen: true, openTime: "10:00 AM", closeTime: "08:00 PM" },
    Tuesday: { isOpen: true, openTime: "10:00 AM", closeTime: "08:00 PM" },
    Wednesday: { isOpen: true, openTime: "10:00 AM", closeTime: "08:00 PM" },
    Thursday: { isOpen: true, openTime: "10:00 AM", closeTime: "08:00 PM" },
    Friday: { isOpen: true, openTime: "10:00 AM", closeTime: "08:00 PM" },
    Saturday: { isOpen: true, openTime: "10:00 AM", closeTime: "08:00 PM" },
    Sunday: { isOpen: true, openTime: "10:00 AM", closeTime: "11:00 PM" },
  },

  // Section F: Declarations
  commit1: false,
  commit2: false,
  commit3: false,
  commit4: false,
  commit5: false,
  commit6: false,
  commit7: false,
  policy1: false,
  policy2: false,
  policy3: false,
  policy4: false,
  policy5: false,
  signatoryName: "",
  digitalInitials: "",
};

export const SHADOW_INPUT_CLASS =
  "pl-8 bg-white border-2 border-blue-300/80 shadow-[0_2px_6px_rgba(37,99,235,0.08)] hover:shadow-[0_3px_10px_rgba(37,99,235,0.14)] hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 focus:shadow-[0_2px_12px_rgba(37,99,235,0.22)] focus:outline-none transition-all duration-150 text-xs h-9 rounded-lg font-normal text-slate-900 placeholder:text-slate-400";

export const SHADOW_SELECT_CLASS =
  "w-full bg-white border-2 border-blue-300/80 shadow-[0_2px_6px_rgba(37,99,235,0.08)] hover:shadow-[0_3px_10px_rgba(37,99,235,0.14)] hover:border-blue-400 rounded-lg text-xs h-9 px-3 font-normal text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 focus:shadow-[0_2px_12px_rgba(37,99,235,0.22)] focus:outline-none transition-all duration-150";

export const SHADOW_TEXTAREA_CLASS =
  "w-full bg-white border-2 border-blue-300/80 shadow-[0_2px_6px_rgba(37,99,235,0.08)] hover:shadow-[0_3px_10px_rgba(37,99,235,0.14)] hover:border-blue-400 rounded-lg text-xs p-3 font-normal text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 focus:shadow-[0_2px_12px_rgba(37,99,235,0.22)] focus:outline-none transition-all duration-150";

export const InstagramIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const FacebookIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const FieldTip = ({ text }) => (
  <p className="text-[10px] text-blue-600 font-medium mt-0.5 leading-tight text-left">
    {text}
  </p>
);

export const getLabelClass = (
  fieldName,
  fieldErrors = {},
  defaultClass = "text-xs font-medium text-slate-700",
) => {
  if (fieldErrors[fieldName]) {
    return "text-xs font-bold text-slate-900 transition-all";
  }
  return defaultClass;
};

export const getInputClass = (
  fieldName,
  fieldErrors = {},
  defaultClass = SHADOW_INPUT_CLASS,
) => {
  if (fieldErrors[fieldName]) {
    return "pl-8 bg-rose-50/30 border-2 border-rose-500 text-slate-900 shadow-[0_2px_8px_rgba(244,63,94,0.12)] focus:border-rose-600 focus:ring-2 focus:ring-rose-500/25 text-xs h-9 rounded-lg font-normal placeholder:text-slate-400 focus:outline-none transition-all";
  }
  return defaultClass;
};

export const getSelectClass = (
  fieldName,
  fieldErrors = {},
  defaultClass = SHADOW_SELECT_CLASS,
) => {
  if (fieldErrors[fieldName]) {
    return "w-full bg-rose-50/30 border-2 border-rose-500 text-slate-900 shadow-[0_2px_8px_rgba(244,63,94,0.12)] focus:border-rose-600 focus:ring-2 focus:ring-rose-500/25 text-xs h-9 px-3 font-normal focus:outline-none transition-all";
  }
  return defaultClass;
};

export const getTextareaClass = (
  fieldName,
  fieldErrors = {},
  defaultClass = SHADOW_TEXTAREA_CLASS,
) => {
  if (fieldErrors[fieldName]) {
    return "bg-rose-50/30 border-2 border-rose-500 text-slate-900 shadow-[0_2px_8px_rgba(244,63,94,0.12)] text-xs rounded-lg font-normal placeholder:text-slate-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/25 transition-all";
  }
  return defaultClass;
};
