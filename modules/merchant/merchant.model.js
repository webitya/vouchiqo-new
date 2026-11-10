import mongoose, { Schema } from "mongoose";
import {
  COUPON_CATEGORIES,
  MERCHANT_STATUS,
  normalizeCategory,
} from "../../utils/constants.js";

/**
 * Merchant profile.
 *
 * One merchant per user (enforced via authId unique index).
 * Status controls visibility: only "approved" merchants can have active coupons.
 *
 * Collection: merchants
 */
const merchantSchema = new Schema(
  {
    // Better Auth user ID of the merchant owner
    authId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      maxlength: [100, "Business name cannot exceed 100 characters"],
    },

    // URL-friendly identifier — e.g. "pizza-hut"
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    logo: { type: String }, // Cloudinary URL
    banner: { type: String }, // Cloudinary URL

    category: {
      type: String,
      enum: COUPON_CATEGORIES,
      required: true,
      set: (val) => normalizeCategory(val),
    },

    customCategoryNotes: {
      type: String,
      trim: true,
    },

    // Sub-Category Tags / Chips added during onboarding or profile editing
    subCategoryTags: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],

    location: {
      address: { type: String, trim: true },
      pincode: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: "IN" },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    contactEmail: { type: String, lowercase: true, trim: true },
    website: { type: String, trim: true },

    // Official Social Links & External Profiles
    socialLinks: {
      instagram: { type: String, trim: true, default: "" },
      facebook: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      youtube: { type: String, trim: true, default: "" },
    },

    status: {
      type: String,
      enum: Object.values(MERCHANT_STATUS),
      default: MERCHANT_STATUS.PENDING,
      index: true,
    },

    // Subscription & Plan gating
    plan: {
      type: String,
      default: "starter",
      index: true,
    },
    planExpiry: { type: Date, default: null },
    // Free Merchant 1-Time Flash Sale Campaign Pass (₹799)
    flashSalePurchased: { type: Boolean, default: false },
    flashSalePurchasedAt: { type: Date, default: null },
    flashSaleCampaignUsed: { type: Boolean, default: false },

    // Commission Structure
    commissionRate: { type: String, trim: true },
    commissionModel: { type: String, trim: true },
    commissionAgreed: { type: Boolean, default: false },

    // Brand Page details
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    longDescription: {
      type: String,
      trim: true,
      maxlength: [1000, "Long description cannot exceed 1000 characters"],
    },
    contactPhone: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    businessType: {
      type: String,
      enum: ["online", "physical", "both"],
      default: "both",
    },
    operatingHours: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // Analytics KPIs
    tickerImpressions: { type: Number, default: 0 },
    brandPageViews: { type: Number, default: 0 },
    revivalCredits: { type: Number, default: 0 },
    revivalCreditsUsed: { type: Number, default: 0 },

    // Denormalized counters — updated via background jobs or atomic $inc
    totalCoupons: { type: Number, default: 0 },
    totalRedemptions: { type: Number, default: 0 },
    totalClaims: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    totalImpressions: { type: Number, default: 0 },
    storePageViews: { type: Number, default: 0 },
    followerCount: { type: Number, default: 0 },

    autoApproveRevival: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    rejectionReason: { type: String },

    // KYC Compliance & Statutory Fields
    constitution: {
      type: String,
      enum: [
        "proprietorship",
        "partnership",
        "llp",
        "pvt_ltd",
        "private_limited",
        "public_limited",
        "others",
        "",
      ],
      default: "proprietorship",
      set: (val) =>
        !val || typeof val !== "string" || !val.trim()
          ? undefined
          : val.trim().toLowerCase(),
    },
    liaisonName: { type: String, trim: true },
    liaisonDesignation: {
      type: String,
      enum: ["owner", "partner", "manager", "director", "others", ""],
      default: "owner",
      set: (val) =>
        !val || typeof val !== "string" || !val.trim()
          ? undefined
          : val.trim().toLowerCase(),
    },
    liaisonPhone: { type: String, trim: true },
    regionalHubCity: {
      type: String,
      enum: ["ranchi", "jamshedpur", "dhanbad", "bokaro", ""],
      default: "ranchi",
      set: (val) =>
        !val || typeof val !== "string" || !val.trim()
          ? undefined
          : val.trim().toLowerCase(),
    },
    gmapsLink: { type: String, trim: true },
    docType: { type: String, trim: true },
    docImage: { type: String }, // Cloudinary URL for primary identity document
    gstin: { type: String, uppercase: true, trim: true },
    isGstExempt: { type: Boolean, default: false },
    shopImage: { type: String }, // Cloudinary URL for storefront photo

    // Bank & Payout Details
    bankDetails: {
      holderName: { type: String, trim: true },
      bankName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifsc: { type: String, trim: true, uppercase: true },
      accountType: {
        type: String,
        enum: ["savings", "current", ""],
        default: "current",
      },
      isVerified: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    collection: "merchants",
  },
);

merchantSchema.pre("save", function () {
  if (
    !this.plan ||
    this.plan === "starter" ||
    String(this.plan).toLowerCase().includes("starter") ||
    String(this.plan).toLowerCase().includes("free")
  ) {
    if (!this.paymentStatus || this.paymentStatus === "pending") {
      this.paymentStatus = "completed";
    }
    if (!this.subscriptionStatus || this.subscriptionStatus === "pending") {
      this.subscriptionStatus = "active";
    }
  }

  if (this.constitution !== undefined) {
    const cleanCons = String(this.constitution || "")
      .trim()
      .toLowerCase();
    if (!cleanCons) {
      this.constitution = undefined;
    } else {
      this.constitution = cleanCons;
    }
  }

  if (this.liaisonDesignation !== undefined) {
    const cleanDesig = String(this.liaisonDesignation || "")
      .trim()
      .toLowerCase();
    if (!cleanDesig) {
      this.liaisonDesignation = undefined;
    } else {
      this.liaisonDesignation = cleanDesig;
    }
  }

  if (this.regionalHubCity !== undefined) {
    const cleanCity = String(this.regionalHubCity || "")
      .trim()
      .toLowerCase();
    if (!cleanCity) {
      this.regionalHubCity = undefined;
    } else {
      this.regionalHubCity = cleanCity;
    }
  }

  if (this.gstin !== undefined) {
    const cleanGstin = String(this.gstin || "")
      .trim()
      .toUpperCase();
    if (!cleanGstin) {
      this.gstin = undefined;
    } else {
      this.gstin = cleanGstin;
    }
  }

  if (this.contactEmail !== undefined) {
    const cleanEmail = String(this.contactEmail || "")
      .trim()
      .toLowerCase();
    if (!cleanEmail) {
      this.contactEmail = undefined;
    } else {
      this.contactEmail = cleanEmail;
    }
  }

  if (this.contactPhone !== undefined) {
    const cleanPhone = String(this.contactPhone || "").trim();
    if (!cleanPhone) {
      this.contactPhone = undefined;
    } else {
      this.contactPhone = cleanPhone;
    }
  }

  if (this.liaisonPhone !== undefined) {
    const cleanLiaison = String(this.liaisonPhone || "").trim();
    if (!cleanLiaison) {
      this.liaisonPhone = undefined;
    } else {
      this.liaisonPhone = cleanLiaison;
    }
  }

  if (this.docImage !== undefined) {
    const cleanDoc = String(this.docImage || "").trim();
    if (!cleanDoc) {
      this.docImage = undefined;
    } else {
      this.docImage = cleanDoc;
    }
  }

  if (this.shopImage !== undefined) {
    const cleanShop = String(this.shopImage || "").trim();
    if (!cleanShop) {
      this.shopImage = undefined;
    } else {
      this.shopImage = cleanShop;
    }
  }
});

merchantSchema.index({ status: 1, category: 1 });
merchantSchema.index({ status: 1, businessName: 1 });
merchantSchema.index({ status: 1, createdAt: -1 });
merchantSchema.index({
  status: 1,
  totalCoupons: -1,
  totalRedemptions: -1,
  createdAt: -1,
});
merchantSchema.index({ "location.city": 1, status: 1 });
merchantSchema.index({ tags: 1 });
merchantSchema.index({ subCategoryTags: 1 });
merchantSchema.index({ contactEmail: 1 }, { unique: true, sparse: true });
merchantSchema.index({ contactPhone: 1 }, { unique: true, sparse: true });
merchantSchema.index({ liaisonPhone: 1 }, { unique: true, sparse: true });
merchantSchema.index({ gstin: 1 }, { unique: true, sparse: true });

const Merchant =
  mongoose.models.Merchant || mongoose.model("Merchant", merchantSchema);

export default Merchant;
