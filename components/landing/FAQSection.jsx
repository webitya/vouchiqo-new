"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { HOME_FAQS } from "@/utils/home-data";

function FaqItem({ faq, index, isMobile }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="faq-item rounded-xl overflow-hidden"
      style={{
        border: "1px solid #e2e8f0",
        background: "#fff",
        transition: "box-shadow 0.2s ease",
        boxShadow: open
          ? "0 4px 16px rgba(70,133,232,0.10)"
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
        style={{
          padding: isMobile ? "12px 14px" : "16px 20px",
          background: "transparent",
          border: "none",
        }}
        aria-expanded={open}
      >
        <span
          style={{
            fontSize: isMobile ? "12px" : "13px",
            fontWeight: 500,
            color: "#1e293b",
            lineHeight: 1.4,
          }}
        >
          {faq.q}
        </span>
        <ChevronDown
          style={{
            width: isMobile ? "15px" : "16px",
            height: isMobile ? "15px" : "16px",
            color: "#F72853",
            flexShrink: 0,
            transition: "transform 0.3s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Answer — smooth expand */}
      <div
        style={{
          maxHeight: open ? "300px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <p
          style={{
            fontSize: isMobile ? "11px" : "12px",
            color: "#64748b",
            lineHeight: 1.6,
            paddingLeft: isMobile ? "14px" : "20px",
            paddingRight: isMobile ? "14px" : "20px",
            paddingBottom: isMobile ? "12px" : "16px",
            paddingTop: "10px",
            margin: 0,
            borderTop: "1px solid #f1f5f9",
            fontWeight: 400,
          }}
        >
          {faq.a}
        </p>
      </div>
    </div>
  );
}

export function FaqSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Split 10 FAQs into two columns of 5
  const col1 = HOME_FAQS.slice(0, 5);
  const col2 = HOME_FAQS.slice(5, 10);

  return (
    <section className="w-full text-center animate-fade-in-up stagger-1 px-0 md:px-0">
      <h2
        className="font-medium tracking-tight mb-3 sm:mb-4 px-4 md:px-0 text-[#F72853] text-base sm:text-lg md:text-xl"
      >
        Frequently Asked Questions
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          gap: "10px",
          alignItems: "start",
          textAlign: "left",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Column 1 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {col1.map((faq, idx) => (
            <FaqItem key={idx} faq={faq} index={idx} isMobile={isMobile} />
          ))}
        </div>

        {/* Column 2 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {col2.map((faq, idx) => (
            <FaqItem
              key={idx + 5}
              faq={faq}
              index={idx + 5}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
