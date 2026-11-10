"use client";

import {
  AlignLeft,
  Calendar,
  FileText,
  Heading,
  Link2,
  Mail,
  Phone,
  Store,
  Ticket,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { FormInput, FormTextarea } from "@/components/shared/form";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showError, showSuccess } from "@/lib/toast";

const MOCK_MERCHANTS = [
  "Amazon",
  "Myntra",
  "Air India",
  "Dell",
  "AJIO",
  "UBER",
  "MakeMyTrip",
  "Udemy",
  "Samsung",
  "BigRock",
  "Nykaa",
  "HP Shopping",
  "Starbucks",
  "Dominos Pizza",
  "Adidas",
  "Zara",
  "JioMart",
  "KFC",
  "Puma",
  "Nike",
  "Swiggy",
  "Zomato",
  "Pharmeasy",
  "Tata CLiQ",
];

const LEADERBOARD = [
  { rank: 1, name: "armory texas", points: 100, medal: true },
  { rank: 2, name: "Bhuvan S raj", points: 10, medal: true },
  { rank: 3, name: "govinda AF", points: 10, medal: true },
  { rank: 4, name: "Rohit Singh", points: 10, medal: false },
];

export default function SubmitClient() {
  const [couponMerchant, setCouponMerchant] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [terms, setTerms] = useState("");
  const [couponTitle, setCouponTitle] = useState("");
  const [couponDesc, setCouponDesc] = useState("");

  const [merchantName, setMerchantName] = useState("");
  const [merchantUrl, setMerchantUrl] = useState("");
  const [merchantEmail, setMerchantEmail] = useState("");
  const [merchantMobile, setMerchantMobile] = useState("");

  const filteredMerchants = MOCK_MERCHANTS.filter((m) =>
    m.toLowerCase().includes(couponMerchant.toLowerCase()),
  );

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponMerchant || !couponCode) {
      return showError("Please fill in all required fields.");
    }
    showSuccess("Thank you! Your offer has been submitted for verification.");
    setCouponMerchant("");
    setCouponCode("");
    setExpiryDate("");
    setTerms("");
    setCouponTitle("");
    setCouponDesc("");
  };

  const handleMerchantSubmit = (e) => {
    e.preventDefault();
    if (!merchantName || !merchantUrl) {
      return showError("Please fill in all required fields.");
    }
    showSuccess("Thank you! The merchant details have been submitted.");
    setMerchantName("");
    setMerchantUrl("");
    setMerchantEmail("");
    setMerchantMobile("");
  };

  return (
    <div className="w-full flex flex-col max-w-7xl mx-auto px-4 text-left font-sans">
      {/* Page Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Submit Offer &amp; Merchant Leads
          </h1>
          <p className="text-xs text-slate-500 font-semibold">
            Verified Community Submissions &bull; Earn Points &amp; Badges
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
            <span className="text-xl font-black text-blue-600 block">
              12,358
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Offer Submissions
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
            <span className="text-xl font-black text-blue-600 block">
              2,976
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Merchant Submissions
            </span>
          </div>
        </div>
      </section>

      {/* Form Content & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="coupon" className="w-full">
            <TabsList className="bg-blue-50 p-1 rounded-xl w-full max-w-md mb-6 flex">
              <TabsTrigger
                value="coupon"
                className="flex-1 text-xs font-bold rounded-lg py-2 flex items-center justify-center gap-1.5"
              >
                <Ticket className="w-4 h-4" /> Submit Offer
              </TabsTrigger>
              <TabsTrigger
                value="merchant"
                className="flex-1 text-xs font-bold rounded-lg py-2 flex items-center justify-center gap-1.5"
              >
                <Store className="w-4 h-4" /> Submit Merchant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="coupon">
              <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6">
                <form onSubmit={handleCouponSubmit} className="space-y-4">
                  <div className="relative">
                    <FormInput
                      name="merchant"
                      label="Store / Merchant Name"
                      icon={Store}
                      placeholder="Type store name (e.g. Amazon, Myntra)..."
                      value={couponMerchant}
                      onChange={(e) => {
                        setCouponMerchant(e.target.value);
                        setShowSuggestions(true);
                      }}
                      required
                    />
                    {showSuggestions &&
                      couponMerchant &&
                      filteredMerchants.length > 0 && (
                        <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                          {filteredMerchants.map((m) => (
                            <li
                              key={m}
                              onClick={() => {
                                setCouponMerchant(m);
                                setShowSuggestions(false);
                              }}
                              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 cursor-pointer"
                            >
                              {m}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>

                  <FormInput
                    name="code"
                    label="Offer Code"
                    icon={Ticket}
                    placeholder="e.g. SAVE50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    required
                  />
                  <FormInput
                    name="expiry"
                    label="Expiry Date"
                    icon={Calendar}
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                  <FormInput
                    name="title"
                    label="Offer Title"
                    icon={Heading}
                    placeholder="e.g. 50% Off First Order"
                    value={couponTitle}
                    onChange={(e) => setCouponTitle(e.target.value)}
                  />
                  <FormTextarea
                    name="desc"
                    label="Offer Description / Details"
                    icon={AlignLeft}
                    rows={2}
                    placeholder="Explain terms, min order value..."
                    value={couponDesc}
                    onChange={(e) => setCouponDesc(e.target.value)}
                  />
                  <FormTextarea
                    name="terms"
                    label="Terms & Conditions"
                    icon={FileText}
                    rows={2}
                    placeholder="e.g. Valid once per user..."
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="w-full bg-[#e85d04] hover:bg-orange-600 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Submit Offer
                  </button>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="merchant">
              <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-6">
                <form onSubmit={handleMerchantSubmit} className="space-y-4">
                  <FormInput
                    name="mName"
                    label="Merchant Business Name"
                    icon={Store}
                    placeholder="e.g. Burger House"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    required
                  />
                  <FormInput
                    name="mUrl"
                    label="Website URL"
                    icon={Link2}
                    placeholder="https://..."
                    value={merchantUrl}
                    onChange={(e) => setMerchantUrl(e.target.value)}
                    required
                  />
                  <FormInput
                    name="mEmail"
                    label="Contact Email"
                    icon={Mail}
                    type="email"
                    placeholder="contact@brand.com"
                    value={merchantEmail}
                    onChange={(e) => setMerchantEmail(e.target.value)}
                  />
                  <FormInput
                    name="mPhone"
                    label="Contact Phone Number"
                    icon={Phone}
                    type="tel"
                    placeholder="10-digit mobile"
                    value={merchantMobile}
                    onChange={(e) => setMerchantMobile(e.target.value)}
                  />

                  <button
                    type="submit"
                    className="w-full bg-[#e85d04] hover:bg-orange-600 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                  >
                    Submit Merchant
                  </button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Leaderboard */}
        <div className="space-y-6">
          <Card className="border-slate-200/80 shadow-xs rounded-2xl bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Trophy className="w-4 h-4 text-amber-500" /> Community
              Contributor Leaderboard
            </h3>
            <div className="divide-y divide-slate-100">
              {LEADERBOARD.map((item) => (
                <div
                  key={item.rank}
                  className="py-3 flex items-center justify-between text-xs font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${item.rank === 1 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}
                    >
                      #{item.rank}
                    </span>
                    <span className="text-slate-800 font-bold">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-blue-600 font-bold font-mono">
                    {item.points} pts
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
