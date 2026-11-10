import "./globals.css";
import PublicMobileBottomNav from "@/components/layout/PublicMobileBottomNav";
import ClientPrompts from "@/components/shared/ClientPrompts";
import QueryProvider from "@/components/shared/QueryProvider";
import SmoothScrollProvider from "@/components/shared/SmoothScrollProvider";

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
      className="antialiased font-sans"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen flex flex-col bg-brand-surface text-brand-text w-full pb-16 md:pb-0 font-sans"
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
