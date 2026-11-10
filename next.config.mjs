/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [50, 75, 80, 85, 90, 100],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "*.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/**" },
      { protocol: "https", hostname: "commons.wikimedia.org", pathname: "/**" },
      { protocol: "https", hostname: "companieslogo.com", pathname: "/**" },
      { protocol: "https", hostname: "ui-avatars.com", pathname: "/**" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "radix-ui",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-label",
      "@radix-ui/react-slot",
      "@tanstack/react-query",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
      "date-fns",
      "react-day-picker",
      "@hookform/resolvers",
      "input-otp",
    ],
  },
  async headers() {
    // In development mode, disable custom headers to avoid blocking dev webviews or popups
    if (!isProd) {
      return [];
    }

    // Allowed origins: production domain + localhost for dev
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];

    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            // In dev we allow both; in prod the env var controls this
            value: allowedOrigins[0],
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          ...(isProd ? [{ key: "X-Frame-Options", value: "SAMEORIGIN" }] : []),
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), payment=*",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} https://checkout.razorpay.com https://*.razorpay.com https://maps.googleapis.com https://unpkg.com https://www.gstatic.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://*.razorpay.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://maps.googleapis.com https://maps.gstatic.com https://*.tile.openstreetmap.org https://unpkg.com https://images.unsplash.com https://companieslogo.com https://upload.wikimedia.org https://commons.wikimedia.org https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://*.razorpay.com",
              `connect-src 'self' https://api.razorpay.com https://*.razorpay.com https://lumberjack.razorpay.com https://lumberjack-cx.razorpay.com https://maps.googleapis.com https://nominatim.openstreetmap.org https://fcmregistrations.googleapis.com https://*.firebaseio.com https://firebase.googleapis.com https://firebaseinstallations.googleapis.com${isProd ? " wss://vouchiqo.com wss://www.vouchiqo.com" : " ws://localhost:3000 ws://127.0.0.1:3000"}`,
              "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com https://maps.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/admin%20login",
        destination: "/admin-login",
        permanent: true,
      },
      {
        source: "/admin login",
        destination: "/admin-login",
        permanent: true,
      },
      {
        source: "/explore-offers",
        destination: "/",
        permanent: true,
      },
      {
        source: "/explore",
        destination: "/",
        permanent: true,
      },
      {
        source: "/explore%20offers",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        // Serve the dynamically-configured Firebase service worker from root scope.
        // Static files in /public cannot access process.env, so we inject the
        // NEXT_PUBLIC_FIREBASE_* config at runtime via an API route.
        source: "/firebase-messaging-sw.js",
        destination: "/api/push/sw",
      },
    ];
  },
};

export default nextConfig;
