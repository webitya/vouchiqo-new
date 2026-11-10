import ExpiredCouponRevival from "./revival-client";

export const metadata = {
  title: "Expired Offer Revival System | Vouchiqo",
  description:
    "Missed an amazing discount? Vote to revive expired promo codes on Vouchiqo. We negotiate directly with merchants to restore active offer codes and savings.",
  openGraph: {
    title: "Expired Offer Revival System | Vouchiqo",
    description:
      "Missed an amazing discount? Vote to revive expired promo codes on Vouchiqo. We negotiate directly with merchants to restore active offer codes and savings.",
    type: "website",
  },
};

export default function Page() {
  return <ExpiredCouponRevival />;
}
