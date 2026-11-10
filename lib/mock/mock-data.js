// Mock/seed data for listing pages (brands, categories, merchants, campaigns)
// Extracted from client components to keep UI code focused

// ── Brands ──────────────────────────────────────────────────────────────────
export const POPULAR_BRANDS = [
  {
    slug: "samsung",
    businessName: "Samsung",
    logo: "/brandlogos/10005.jpg",
    coupons: 1,
    offers: 52,
  },
  {
    slug: "oneplus",
    businessName: "OnePlus",
    logo: "/brandlogos/10006.jpg",
    coupons: 1,
    offers: 31,
  },
  {
    slug: "adidas",
    businessName: "Adidas",
    logo: "/brandlogos/10012.jpg",
    coupons: 1,
    offers: 31,
  },
  {
    slug: "lenovo",
    businessName: "Lenovo",
    logo: "/brandlogos/10017.jpg",
    coupons: 4,
    offers: 31,
  },
  {
    slug: "apple",
    businessName: "Apple",
    logo: "/brandlogos/10013.jpg",
    coupons: 2,
    offers: 45,
  },
];

export const MOCK_BRANDS_SEED = [
  { businessName: "Samsung", slug: "samsung", logo: "/brandlogos/10005.jpg" },
  { businessName: "Sony", slug: "sony", logo: "/brandlogos/10035.jpg" },
  { businessName: "Sparx", slug: "sparx", logo: "/brandlogos/10036.jpg" },
  {
    businessName: "SOME BY MI",
    slug: "some-by-mi",
    logo: "/brandlogos/10037.jpg",
  },
  { businessName: "Adidas", slug: "adidas", logo: "/brandlogos/10012.jpg" },
  { businessName: "Apple", slug: "apple", logo: "/brandlogos/10013.jpg" },
  { businessName: "Asus", slug: "asus", logo: "/brandlogos/10008.jpg" },
  { businessName: "Dell", slug: "dell", logo: "/brandlogos/10007.jpg" },
  { businessName: "HP", slug: "hp", logo: "/brandlogos/10009.jpg" },
  { businessName: "Lenovo", slug: "lenovo", logo: "/brandlogos/10017.jpg" },
  { businessName: "Nike", slug: "nike", logo: "/brandlogos/10010.jpg" },
  { businessName: "Puma", slug: "puma", logo: "/brandlogos/10011.jpg" },
];

// ── Merchants ───────────────────────────────────────────────────────────────
export const TRENDING_STORES = [
  {
    slug: "lenskart",
    businessName: "Lenskart",
    logo: "/brandlogos/10012.jpg",
    coupons: 34,
    offers: 22,
  },
  {
    slug: "sonata",
    businessName: "Sonata",
    logo: "/brandlogos/10035.jpg",
    coupons: 48,
    offers: 30,
  },
  {
    slug: "techgadgets",
    businessName: "Dell",
    logo: "/brandlogos/10007.jpg",
    coupons: 8,
    offers: 6,
  },
  {
    slug: "starbucks-coffee",
    businessName: "Starbucks",
    logo: "/brandlogos/10026.jpg",
    coupons: 34,
    offers: 13,
  },
];

export const MOCK_MERCHANTS_SEED = [
  { businessName: "Zomato", slug: "zomato", coupons: 26, offers: 8 },
  { businessName: "Zivame", slug: "zivame", coupons: 57, offers: 15 },
  { businessName: "ZoomCar", slug: "zoomcar", coupons: 7, offers: 5 },
  { businessName: "Zappfresh", slug: "zappfresh", coupons: 18, offers: 4 },
  { businessName: "Zoomin", slug: "zoomin", coupons: 48, offers: 12 },
  { businessName: "ZOROY", slug: "zoroy", coupons: 7, offers: 3 },
  { businessName: "7NetLive", slug: "7netlive", coupons: 12, offers: 6 },
  { businessName: "Zestpics", slug: "zestpics", coupons: 18, offers: 9 },
  {
    businessName: "Vouchiqo Nutrition",
    slug: "vouchiqo-nutrition",
    coupons: 9,
    offers: 4,
  },
  { businessName: "Zyppys", slug: "zyppys", coupons: 11, offers: 5 },
  { businessName: "Zymrat", slug: "zymrat", coupons: 12, offers: 6 },
  { businessName: "Zoe", slug: "zoe", coupons: 10, offers: 4 },
  { businessName: "Zooty", slug: "zooty", coupons: 7, offers: 3 },
  { businessName: "Zostel", slug: "zostel", coupons: 18, offers: 9 },
  { businessName: "Zara", slug: "zara", coupons: 13, offers: 6 },
  { businessName: "Zebpay", slug: "zebpay", coupons: 7, offers: 3 },
  { businessName: "Zodiac", slug: "zodiac", coupons: 11, offers: 5 },
  { businessName: "Zoludio", slug: "zoludio", coupons: 13, offers: 6 },
  { businessName: "ZEE5", slug: "zee5", coupons: 8, offers: 3 },
  { businessName: "ZestMoney", slug: "zestmoney", coupons: 11, offers: 5 },
  { businessName: "ZoloStays", slug: "zolostays", coupons: 10, offers: 4 },
  { businessName: "Zoomcar Zap", slug: "zoomcar-zap", coupons: 11, offers: 5 },
  { businessName: "Zomato Gold", slug: "zomato-gold", coupons: 12, offers: 6 },
  { businessName: "ZALORA", slug: "zalora", coupons: 14, offers: 7 },
  { businessName: "Zoff Foods", slug: "zoff-foods", coupons: 8, offers: 4 },
  { businessName: "Zapvi", slug: "zapvi", coupons: 29, offers: 11 },
  { businessName: "Zebronics", slug: "zebronics", coupons: 16, offers: 7 },
  { businessName: "Zandu Care", slug: "zandu-care", coupons: 40, offers: 18 },
  { businessName: "Zarlin", slug: "zarlin", coupons: 13, offers: 6 },
  { businessName: "Zyro", slug: "zyro", coupons: 7, offers: 3 },
  { businessName: "Zingavita", slug: "zingavita", coupons: 11, offers: 5 },
  { businessName: "Zunpulse", slug: "zunpulse", coupons: 13, offers: 6 },
  { businessName: "Zool Retail", slug: "zool-retail", coupons: 9, offers: 4 },
  { businessName: "Zerodha", slug: "zerodha", coupons: 9, offers: 4 },
  { businessName: "Zingbus", slug: "zingbus", coupons: 14, offers: 7 },
  { businessName: "Zopto", slug: "zopto", coupons: 27, offers: 11 },
  { businessName: "Zouk", slug: "zouk", coupons: 32, offers: 15 },
  { businessName: "Zigly", slug: "zigly", coupons: 5, offers: 2 },
  { businessName: "Zoomcar Host", slug: "zoomcar-host", coupons: 9, offers: 4 },
  { businessName: "Zap Cricket", slug: "zap-cricket", coupons: 9, offers: 4 },
  { businessName: "Zety", slug: "zety", coupons: 10, offers: 4 },
  { businessName: "Zavya", slug: "zavya", coupons: 8, offers: 3 },
  { businessName: "Zeroharm", slug: "zeroharm", coupons: 13, offers: 6 },
  { businessName: "Zomunk", slug: "zomunk", coupons: 8, offers: 3 },
  { businessName: "Zulutrade", slug: "zulutrade", coupons: 8, offers: 4 },
  { businessName: "ZoogVPN", slug: "zoogvpn", coupons: 7, offers: 3 },
  { businessName: "Zoviz", slug: "zoviz", coupons: 11, offers: 5 },
  { businessName: "Zlade", slug: "zlade", coupons: 9, offers: 4 },
  { businessName: "Zink London", slug: "zink-london", coupons: 8, offers: 4 },
  {
    businessName: "Zonka Feedback",
    slug: "zonka-feedback",
    coupons: 8,
    offers: 4,
  },
  { businessName: "Zeligate", slug: "zeligate", coupons: 7, offers: 3 },
  { businessName: "Zop", slug: "zop", coupons: 9, offers: 4 },
  { businessName: "ZipWP", slug: "zipwp", coupons: 7, offers: 3 },
  { businessName: "Zoominfo", slug: "zoominfo", coupons: 8, offers: 4 },
  { businessName: "Zendesk", slug: "zendesk", coupons: 8, offers: 4 },
  { businessName: "Zapier", slug: "zapier", coupons: 7, offers: 3 },
  { businessName: "Zeemo", slug: "zeemo", coupons: 7, offers: 3 },
  { businessName: "Zoho", slug: "zoho", coupons: 7, offers: 3 },
  { businessName: "Zibaa", slug: "zibaa", coupons: 7, offers: 3 },
];

// ── Categories ─────────────────────────────────────────────────────────────
export const POPULAR_CATEGORIES = [
  {
    slug: "fashion",
    title: "Fashion",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ec4899' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z'/%3E%3Cpath d='M3 6h18'/%3E%3C/svg%3E",
    coupons: "1,371",
    offers: "5,324",
  },
  {
    slug: "food",
    title: "Food & Dining",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ea580c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 8h1a4 4 0 0 1 0 8h-1'/%3E%3Cpath d='M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z'/%3E%3C/svg%3E",
    coupons: "850",
    offers: "3,120",
  },
  {
    slug: "electronics",
    title: "Electronics",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='20' height='14' x='2' y='3' rx='2'/%3E%3C/svg%3E",
    coupons: "402",
    offers: "2,025",
  },
  {
    slug: "beauty",
    title: "Beauty",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23f43f5e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/%3E%3C/svg%3E",
    coupons: "1,345",
    offers: "4,650",
  },
  {
    slug: "travel",
    title: "Travel",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%230284c7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m12 2 3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z'/%3E%3C/svg%3E",
    coupons: "491",
    offers: "794",
  },
];

// ── Campaigns / Festivals ──────────────────────────────────────────────────
export const POPULAR_FESTIVALS = [
  {
    title: "Amazon Prime Day",
    slug: "amazon-prime-day",
    coupons: 0,
    offers: 12,
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Friendship Day",
    slug: "friendship-day",
    coupons: 9,
    offers: 9,
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Independence Day",
    slug: "independence-day",
    coupons: 8,
    offers: 14,
    image:
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Onam",
    slug: "onam",
    coupons: 8,
    offers: 10,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop",
  },
];

export const ALL_FESTIVALS = [
  {
    title: "Amazon Prime Day",
    slug: "amazon-prime-day",
    coupons: 0,
    offers: 12,
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Friendship Day",
    slug: "friendship-day",
    coupons: 9,
    offers: 9,
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Independence Day",
    slug: "independence-day",
    coupons: 8,
    offers: 14,
    image:
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Onam",
    slug: "onam",
    coupons: 8,
    offers: 10,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Raksha Bandhan",
    slug: "rakshabandhan",
    coupons: 15,
    offers: 26,
    image:
      "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Ganesh Chaturthi",
    slug: "ganeshchaturthi",
    coupons: 5,
    offers: 12,
    image:
      "https://images.unsplash.com/photo-1567591414240-e221379c13e5?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Amazon Great Indian Sale",
    slug: "amazongreatindiansale",
    coupons: 4,
    offers: 8,
    image:
      "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Flipkart Big Billion Day Sale",
    slug: "flipkartbigbilliondaysale",
    coupons: 3,
    offers: 9,
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Dussehra",
    slug: "dussehra",
    coupons: 18,
    offers: 23,
    image:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Black Friday",
    slug: "blackfriday",
    coupons: 10,
    offers: 23,
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "New Year",
    slug: "newyear",
    coupons: 8,
    offers: 14,
    image:
      "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Cyber Monday",
    slug: "cyber-monday",
    coupons: 2,
    offers: 4,
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Valentines Day",
    slug: "valentinesday",
    coupons: 5,
    offers: 9,
    image:
      "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Christmas",
    slug: "christmas",
    coupons: 6,
    offers: 12,
    image:
      "https://images.unsplash.com/photo-1543258103-a62bdc069871?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Flash Sale",
    slug: "flashsale",
    coupons: 15,
    offers: 33,
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Ugadi",
    slug: "ugadi",
    coupons: 8,
    offers: 16,
    image:
      "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "OMG Sale",
    slug: "omgsale",
    coupons: 3,
    offers: 4,
    image:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Diwali",
    slug: "diwali",
    coupons: 5,
    offers: 12,
    image:
      "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Paytm Sale",
    slug: "paytmsale",
    coupons: 2,
    offers: 5,
    image:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Children's Day",
    slug: "childrensday",
    coupons: 4,
    offers: 6,
    image:
      "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Pongal",
    slug: "pongal",
    coupons: 8,
    offers: 16,
    image:
      "https://images.unsplash.com/photo-1576867757603-05b134ebc379?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Republic Day",
    slug: "republicday",
    coupons: 6,
    offers: 12,
    image:
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Ramzan",
    slug: "ramzan",
    coupons: 7,
    offers: 14,
    image:
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Mother's Day",
    slug: "mothersday",
    coupons: 15,
    offers: 24,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Women's Day",
    slug: "womensday",
    coupons: 5,
    offers: 11,
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Holi",
    slug: "holi",
    coupons: 8,
    offers: 17,
    image:
      "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Fathers Day",
    slug: "fathersday",
    coupons: 18,
    offers: 36,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
  },
];
