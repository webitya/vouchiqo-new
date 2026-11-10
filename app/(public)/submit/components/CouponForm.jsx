"use client";

import { format } from "date-fns";
import {
  AlignLeft,
  Calendar as CalendarIcon,
  FileText,
  Heading,
  Store,
  Ticket,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

/**
 * Coupon submission form with merchant autocomplete.
 */
export default function CouponForm() {
  const [merchant, setMerchant] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [code, setCode] = useState("");
  const [expiry, setExpiry] = useState("");
  const [title, setTitle] = useState("");
  const [terms, setTerms] = useState("");
  const [desc, setDesc] = useState("");

  const filtered = MOCK_MERCHANTS.filter((m) =>
    m.toLowerCase().includes(merchant.toLowerCase()),
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!merchant || !code) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success(
      "Thank you! Your offer has been submitted for verification.",
    );
    setMerchant("");
    setCode("");
    setExpiry("");
    setTitle("");
    setTerms("");
    setDesc("");
  };

  return (
    <div className="bg-white border border-brand-border rounded-2xl p-6 md:p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-brand-blue" /> Merchant Name{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search or enter store name (e.g. Amazon, Nike)"
              value={merchant}
              onChange={(e) => {
                setMerchant(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
              required
            />
          </div>
          {showSuggestions && merchant && filtered.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto divide-y divide-slate-50">
              {filtered.map((m) => (
                <div
                  key={m}
                  onClick={() => {
                    setMerchant(m);
                    setShowSuggestions(false);
                  }}
                  className="px-4 py-2.5 hover:bg-slate-50 text-[13px] text-slate-700 font-medium cursor-pointer"
                >
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            icon={<Ticket />}
            label="Offer Code"
            required
            placeholder="e.g. SAVE50, EXTRA20"
            value={code}
            onChange={setCode}
            type="text"
            uppercase
          />
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
              <span className="[&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-brand-blue shrink-0">
                <CalendarIcon />
              </span>
              <span>Expiry Date</span>
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium text-left flex items-center justify-between bg-white text-slate-700 cursor-pointer h-[46px]"
                >
                  <span>
                    {expiry ? format(new Date(expiry), "PPP") : "Select date"}
                  </span>
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 border-brand-border bg-white"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={expiry ? new Date(expiry) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setExpiry(date.toISOString().split("T")[0]);
                    } else {
                      setExpiry("");
                    }
                  }}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <FormField
          icon={<Heading />}
          label="Title / Deal Line"
          placeholder="e.g. Flat 50% OFF on all orders"
          value={title}
          onChange={setTitle}
        />
        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-brand-blue" /> Terms & Conditions
          </label>
          <textarea
            placeholder="List any offer terms, minimum purchase limits..."
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
            <AlignLeft className="w-4 h-4 text-brand-blue" /> Description
          </label>
          <textarea
            placeholder="Add a detailed description about how to use this offer..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#2563eb] hover:bg-[#2563eb]/90 text-white font-bold py-3.5 rounded-xl text-[13px] uppercase tracking-wider transition-colors cursor-pointer border-none shadow-md shadow-blue-600/20"
        >
          Submit Offer
        </button>
      </form>
    </div>
  );
}

function FormField({
  icon,
  label,
  required,
  placeholder,
  value,
  onChange,
  type = "text",
  uppercase,
  min,
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[13px] font-bold text-brand-navy mb-2 flex items-center gap-1.5">
        <span className="[&>svg]:w-4 [&>svg]:h-4 [&>svg]:text-brand-blue shrink-0">
          {icon}
        </span>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          required={required}
          className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium ${uppercase ? "uppercase" : ""}`}
        />
      </div>
    </div>
  );
}
