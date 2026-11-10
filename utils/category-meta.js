// Shared category metadata used by /categories and /category/[slug] pages

export const CATEGORY_META = {
  food: {
    title: "Food & Dining",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ea580c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 8h1a4 4 0 0 1 0 8h-1'/%3E%3Cpath d='M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z'/%3E%3Cline x1='6' y1='1' x2='6' y2='4'/%3E%3Cline x1='10' y1='1' x2='10' y2='4'/%3E%3Cline x1='14' y1='1' x2='14' y2='4'/%3E%3C/svg%3E",
    slug: "food",
  },
  fashion: {
    title: "Fashion",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ec4899' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z'/%3E%3Cpath d='M3 6h18'/%3E%3Cpath d='M16 10a4 4 0 0 1-8 0'/%3E%3C/svg%3E",
    slug: "fashion",
  },
  electronics: {
    title: "Electronics",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='20' height='14' x='2' y='3' rx='2'/%3E%3Cline x1='8' x2='16' y1='21' y2='21'/%3E%3Cline x1='12' x2='12' y1='17' y2='21'/%3E%3C/svg%3E",
    slug: "electronics",
  },
  beauty: {
    title: "Beauty",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23f43f5e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'/%3E%3C/svg%3E",
    slug: "beauty",
  },
  travel: {
    title: "Travel",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%230284c7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.2c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.1z'/%3E%3C/svg%3E",
    slug: "travel",
  },
  fitness: {
    title: "Health & Fitness",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2316a34a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6.5 6.5 11 11'/%3E%3Cpath d='m21 21-1-1'/%3E%3Cpath d='m3 3 1 1'/%3E%3Cpath d='m18 22 4-4'/%3E%3Cpath d='m2 6 4-4'/%3E%3Cpath d='m3 10 7-7'/%3E%3Cpath d='m14 21 7-7'/%3E%3C/svg%3E",
    slug: "fitness",
  },
  home: {
    title: "Home & Kitchen",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%230d9488' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/%3E%3Cpolyline points='9 22 9 12 15 12 15 22'/%3E%3C/svg%3E",
    slug: "home",
  },
  entertainment: {
    title: "Entertainment",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='5 3 19 12 5 21 5 3'/%3E%3C/svg%3E",
    slug: "entertainment",
  },
  services: {
    title: "Services",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'/%3E%3C/svg%3E",
    slug: "services",
  },
  "home-improvement": {
    title: "Home Improvement",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ca8a04' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9'/%3E%3Cpath d='M17.64 15 22 10.64'/%3E%3Cpath d='m20.91 3.26-1.25-1.25a2 2 0 0 0-2.83 0l-1.8 1.8 4.08 4.08 1.8-1.8a2 2 0 0 0 0-2.83Z'/%3E%3C/svg%3E",
    slug: "home-improvement",
  },
  education: {
    title: "Education",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%234f46e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z'/%3E%3Cpath d='M6 6h10'/%3E%3Cpath d='M6 10h10'/%3E%3C/svg%3E",
    slug: "education",
  },
  finance: {
    title: "Finance",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2315803d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='20' height='14' x='2' y='5' rx='2'/%3E%3Cline x1='2' x2='22' y1='10' y2='10'/%3E%3C/svg%3E",
    slug: "finance",
  },
  gaming: {
    title: "Gaming",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%239333ea' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='6' x2='10' y1='12' y2='12'/%3E%3Cline x1='8' x2='8' y1='10' y2='14'/%3E%3Cline x1='15' x2='15.01' y1='13' y2='13'/%3E%3Cline x1='18' x2='18.01' y1='11' y2='11'/%3E%3Crect width='20' height='12' x='2' y='6' rx='6'/%3E%3C/svg%3E",
    slug: "gaming",
  },
  automotive: {
    title: "Automotive",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23dc2626' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2'/%3E%3Ccircle cx='7' cy='17' r='2'/%3E%3Cpath d='M9 17h6'/%3E%3Ccircle cx='17' cy='17' r='2'/%3E%3C/svg%3E",
    slug: "automotive",
  },
  "kids-baby": {
    title: "Kids & Baby",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23f59e0b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Z'/%3E%3Cpath d='M8 14s1.5 2 4 2 4-2 4-2'/%3E%3Cpath d='M9 9h.01'/%3E%3Cpath d='M15 9h.01'/%3E%3C/svg%3E",
    slug: "kids-baby",
  },
  pets: {
    title: "Pets",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23d97706' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='4' r='2'/%3E%3Ccircle cx='18' cy='8' r='2'/%3E%3Ccircle cx='20' cy='16' r='2'/%3E%3Cpath d='M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z'/%3E%3C/svg%3E",
    slug: "pets",
  },
  organic: {
    title: "Organic",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2316a34a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/%3E%3Cpath d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/%3E%3C/svg%3E",
    slug: "organic",
  },
  grocery: {
    title: "Grocery",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23059669' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='8' cy='21' r='1'/%3E%3Ccircle cx='19' cy='21' r='1'/%3E%3Cpath d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12'/%3E%3C/svg%3E",
    slug: "grocery",
  },
};

// Extended metadata used by /category/[slug] page (includes banners, emojis, sub-categories)
export const CATEGORY_DETAIL_META = {
  food: {
    title: "Food & Dining",
    emoji: "🍔",
    banner: "bg-gradient-to-r from-amber-500 to-blue-600",
    subs: ["Fast Food", "Fine Dining", "Bakeries", "Beverages"],
  },
  fashion: {
    title: "Fashion & Apparel",
    emoji: "🛍️",
    banner: "bg-gradient-to-r from-pink-500 to-rose-500",
    subs: ["Footwear", "Apparel", "Watches", "Accessories"],
  },
  electronics: {
    title: "Electronics & Gadgets",
    emoji: "💻",
    banner: "bg-gradient-to-r from-blue-500 to-indigo-500",
    subs: ["Mobiles", "Laptops", "Accessories", "Smart Home"],
  },
  beauty: {
    title: "Beauty & Skincare",
    emoji: "💄",
    banner: "bg-gradient-to-r from-rose-400 to-pink-500",
    subs: ["Makeup", "Skincare", "Fragrance", "Hair Care"],
  },
  travel: {
    title: "Travel & Hotels",
    emoji: "✈️",
    banner: "bg-gradient-to-r from-blue-500 to-teal-500",
    subs: ["Hotels", "Flights", "Cabs", "Luggage"],
  },
  fitness: {
    title: "Health & Fitness",
    emoji: "💪",
    banner: "bg-gradient-to-r from-red-500 to-blue-600",
    subs: ["Gyms", "Supplements", "Equipment", "Wearables"],
  },
  home: {
    title: "Home & Décor",
    emoji: "🏠",
    banner: "bg-gradient-to-r from-teal-500 to-blue-600",
    subs: ["Furniture", "Sanitary Ware", "Tiles", "Lighting"],
  },
  entertainment: {
    title: "SaaS & Productivity",
    emoji: "💼",
    banner: "bg-gradient-to-r from-indigo-500 to-purple-600",
    subs: ["SaaS Tools", "Streaming", "Gaming", "Subscriptions"],
  },
  services: {
    title: "Local Services",
    emoji: "🛠️",
    banner: "bg-gradient-to-r from-violet-500 to-fuchsia-600",
    subs: ["Repairs", "Catering", "Spa", "On-Demand"],
  },
  "home-improvement": {
    title: "Home Improvement",
    emoji: "🏗️",
    banner: "bg-gradient-to-r from-amber-500 to-blue-600",
    subs: [
      "Tiles & Sanitary",
      "Granite & Marble",
      "Flooring",
      "Paint & Hardware",
      "Tools",
    ],
  },
  education: {
    title: "Education & Learning",
    emoji: "🎓",
    banner: "bg-gradient-to-r from-cyan-500 to-blue-600",
    subs: [
      "Online Courses",
      "Certifications",
      "Test Prep",
      "Books & Stationery",
    ],
  },
  finance: {
    title: "Finance & Insurance",
    emoji: "💵",
    banner: "bg-gradient-to-r from-blue-500 to-green-600",
    subs: ["Credit Cards", "Loans", "Insurance", "Investments"],
  },
  gaming: {
    title: "Gaming & Consoles",
    emoji: "🎮",
    banner: "bg-gradient-to-r from-purple-500 to-indigo-600",
    subs: ["PC Games", "Console Keys", "Gaming Gear", "Mobile Gaming"],
  },
  automotive: {
    title: "Automotive & Car Care",
    emoji: "🚗",
    banner: "bg-gradient-to-r from-slate-600 to-zinc-800",
    subs: ["Car Accessories", "Tires", "Servicing", "Cleaning Kits"],
  },
  "kids-baby": {
    title: "Kids & Baby",
    emoji: "👶",
    banner: "bg-gradient-to-r from-pink-400 to-blue-400",
    subs: ["Baby Clothing", "Toys", "Baby Care", "Diapers"],
  },
  pets: {
    title: "Pet Supplies",
    emoji: "🐾",
    banner: "bg-gradient-to-r from-amber-500 to-red-500",
    subs: ["Dog Food", "Cat Treats", "Pet Toys", "Grooming"],
  },
  organic: {
    title: "Organic & Wellness",
    emoji: "🌿",
    banner: "bg-gradient-to-r from-green-400 to-blue-500",
    subs: ["Organic Food", "Herbal Beauty", "Health Supplements"],
  },
  grocery: {
    title: "Groceries & Supermarket",
    emoji: "🛒",
    banner: "bg-gradient-to-r from-blue-400 to-lime-500",
    subs: ["Fresh Vegetables", "Beverages", "Snacks", "Household Items"],
  },
};
