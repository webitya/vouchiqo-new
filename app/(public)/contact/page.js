import ContactPage from "./contact-client";

export const metadata = {
  title: "Contact Support | Vouchiqo Help Desk",
  description:
    "Get in touch with the Vouchiqo team. Submit support inquiries about claim verification issues, coupon revival requests, and merchant partnership options.",
  openGraph: {
    title: "Contact Support | Vouchiqo Help Desk",
    description:
      "Get in touch with the Vouchiqo team. Submit support inquiries about claim verification issues, coupon revival requests, and merchant partnership options.",
    type: "website",
  },
};

export default function Page() {
  return <ContactPage />;
}
