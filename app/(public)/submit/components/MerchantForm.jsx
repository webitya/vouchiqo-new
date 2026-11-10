"use client";

import { Link2, Mail, Phone, Store } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

/**
 * Merchant submission form.
 */
export default function MerchantForm() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !url) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Thank you! The merchant details have been submitted.");
    setName("");
    setUrl("");
    setEmail("");
    setMobile("");
  };

  return (
    <div className="bg-white border border-brand-border rounded-2xl p-6 md:p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          icon={<Store />}
          label="Merchant Name"
          required
          placeholder="Enter store/company name"
          value={name}
          onChange={setName}
        />
        <InputField
          icon={<Link2 />}
          label="Merchant Website URL"
          required
          placeholder="https://example.com"
          value={url}
          onChange={setUrl}
          type="url"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            icon={<Mail />}
            label="Contact Email"
            placeholder="e.g. partner@store.com"
            value={email}
            onChange={setEmail}
            type="email"
          />
          <InputField
            icon={<Phone />}
            label="Contact Phone"
            placeholder="e.g. +91 98765 43210"
            value={mobile}
            onChange={setMobile}
            type="tel"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#2563eb] hover:bg-[#2563eb]/90 text-white font-bold py-3.5 rounded-xl text-[13px] uppercase tracking-wider transition-colors cursor-pointer border-none shadow-md shadow-blue-600/20"
        >
          Submit Merchant
        </button>
      </form>
    </div>
  );
}

function InputField({
  icon,
  label,
  required,
  placeholder,
  value,
  onChange,
  type = "text",
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
          required={required}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/5 text-[13px] font-medium"
        />
      </div>
    </div>
  );
}
