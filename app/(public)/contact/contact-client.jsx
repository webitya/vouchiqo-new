"use client";

import { CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    // Simulate API request
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSubmitted(true);
    toast.success("Support request sent successfully!");
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50 text-gray-900"
      style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
    >
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-screen">
        {/* Left Side: Contact Info */}
        <section className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight leading-tight">
              Get in touch
            </h1>
            <p className="text-[13px] text-gray-500 font-normal leading-relaxed">
              Have questions about claim verification, coupon revival, or
              partner billing plans? Fill out the form or reach out via our
              direct channels.
            </p>
          </div>

          <div className="space-y-4">
            {/* Email Contact Card */}
            <div className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Email Address
                </h3>
                <a
                  href="mailto:contact@vouchiqo.com"
                  className="text-[14px] font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  contact@vouchiqo.com
                </a>
                <p className="text-[11px] text-gray-400 font-normal">
                  Estimated reply within 24 hours
                </p>
              </div>
            </div>

            {/* Phone Contact Card */}
            <div className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Call Support
                </h3>
                <a
                  href="tel:+917997443334"
                  className="text-[14px] font-medium text-gray-900 hover:text-blue-600 transition-colors"
                >
                  +91-7997443334
                </a>
                <p className="text-[11px] text-gray-400 font-normal">
                  Mon-Fri from 9:00 AM to 6:00 PM IST
                </p>
              </div>
            </div>

            {/* Address / Office Contact Card */}
            <div className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Office Address
                </h3>
                <p className="text-[14px] font-medium text-gray-900 leading-snug">
                  Vouchiqo
                </p>
                <p className="text-[11px] text-gray-400 font-normal">
                  Ranchi, Jharkhand, India
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Form Panel */}
        <section className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Thank you for reaching out!
                </h2>
                <p className="text-[13px] text-gray-500 font-normal max-w-sm mx-auto leading-relaxed">
                  Your support request has been received. One of our support
                  representatives will contact you shortly via email at{" "}
                  <span className="font-semibold text-gray-900">
                    {formData.email}
                  </span>
                  .
                </p>
              </div>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    subject: "",
                    message: "",
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium py-2 px-6 rounded-lg border-0 cursor-pointer transition-colors"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="border-gray-200 bg-white text-[13px] h-10 px-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="border-gray-200 bg-white text-[13px] h-10 px-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone (optional)"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="border-gray-200 bg-white text-[13px] h-10 px-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                    Subject
                  </label>
                  <Input
                    type="text"
                    placeholder="What can we help you with?"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="border-gray-200 bg-white text-[13px] h-10 px-3 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                  Message Details <span className="text-red-500">*</span>
                </label>
                <Textarea
                  required
                  rows={4}
                  placeholder="Describe your issue or questions in detail..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="border-gray-200 bg-white text-[13px] p-3 focus-visible:ring-offset-0 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[13px] py-2.5 font-medium border-0 h-auto cursor-pointer shadow-sm flex items-center justify-center gap-2 rounded-lg"
              >
                <span>
                  {loading ? "Submitting ticket..." : "Submit Support Request"}
                </span>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
