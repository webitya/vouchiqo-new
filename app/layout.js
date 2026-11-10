import localFont from "next/font/local";
import "./globals.css";
import PublicMobileBottomNav from "@/components/layout/PublicMobileBottomNav";
import ClientPrompts from "@/components/shared/ClientPrompts";
import QueryProvider from "@/components/shared/QueryProvider";
import SmoothScrollProvider from "@/components/shared/SmoothScrollProvider";

const inter = localFont({
  src: "../public/fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  display: "swap",
});

const geistSans = localFont({
  src: "../public/fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata = {
  title: "Vouchiqo | Verified Deals. Real Savings.",
  description:
    "Vouchiqo is a trusted offer marketplace and merchant growth platform offering 100% verified deals and analytics.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vouchiqo",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/navbarlogovouchiqo.webp",
  },
  verification: {
    other: {
      "verify-admitad": "af406b1286",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col bg-brand-surface text-brand-text w-full pb-16 md:pb-0"
        suppressHydrationWarning
      >
        <SmoothScrollProvider>
          <QueryProvider>
            {children}
            <ClientPrompts />
            <PublicMobileBottomNav />
          </QueryProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
