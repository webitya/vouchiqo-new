"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import SafeImage from "@/components/shared/SafeImage";

export function PopupBannerModal({ banners = [] }) {
  const [open, setOpen] = useState(false);
  const [activeBanner, setActiveBanner] = useState(null);

  useEffect(() => {
    // Find active popup banner
    const popupBanners = (banners || []).filter(
      (b) => b.slot === "popup" || b.slot === "popup-modal",
    );

    if (popupBanners.length === 0) return;

    // Pick top priority popup banner
    const selected = popupBanners[0];
    const bannerId = selected._id || "default";

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem(
      `popup-banner-dismissed-${bannerId}`,
    );
    if (!isDismissed) {
      setActiveBanner(selected);
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [banners]);

  const handleClose = useCallback(() => {
    setOpen(false);
    if (activeBanner?._id) {
      sessionStorage.setItem(
        `popup-banner-dismissed-${activeBanner._id}`,
        "true",
      );
    }
  }, [activeBanner]);

  // Close modal on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  const [imageRatio, setImageRatio] = useState(null);

  if (!open || !activeBanner) return null;

  const isExternal =
    activeBanner.link?.startsWith("http://") ||
    activeBanner.link?.startsWith("https://");
  const targetUrl =
    activeBanner.link && activeBanner.link !== "#"
      ? activeBanner.link
      : "/deals";

  const posterImageSrc =
    activeBanner.image ||
    activeBanner.imageUrl ||
    activeBanner.desktopImage ||
    "";

  // Calculate dynamic style based on image's natural aspect ratio:
  // If natural ratio is known, use it; otherwise default to standard 3:2 (1.5)
  const currentRatio = imageRatio || 1.5;

  const modalBody = (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-700/50 group transition-transform duration-300 hover:scale-[1.01]"
      style={{
        aspectRatio: `${currentRatio}`,
        maxHeight: "82vh",
      }}
    >
      {/* Pure Banner Image */}
      <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
        <SafeImage
          src={posterImageSrc}
          alt={activeBanner.title || "Promotional Banner"}
          fill
          priority
          sizes="(max-width: 640px) 95vw, (max-width: 1024px) 80vw, 680px"
          className="object-cover cursor-pointer"
          onLoad={(e) => {
            const nw = e.target?.naturalWidth;
            const nh = e.target?.naturalHeight;
            if (nw && nh && nh > 0) {
              setImageRatio(nw / nh);
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-300">
      {/* Backdrop click to dismiss */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Poster Container with responsive max constraints */}
      <div
        className="relative z-10 w-full max-w-[92vw] sm:max-w-xl md:max-w-2xl flex flex-col items-center justify-center"
        style={{
          maxHeight: "85vh",
          maxWidth:
            currentRatio < 1 ? `calc(82vh * ${currentRatio})` : undefined,
        }}
      >
        {/* Elegant Floating Close button (positioned outside top-right to never obscure artwork) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
          className="absolute -top-3.5 -right-2 sm:-top-4 sm:-right-4 z-40 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-slate-800 hover:bg-slate-100 shadow-xl border border-slate-200/90 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Close Popup"
        >
          <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
        </button>

        {isExternal ? (
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="block w-full"
          >
            {modalBody}
          </a>
        ) : (
          <Link href={targetUrl} onClick={handleClose} className="block w-full">
            {modalBody}
          </Link>
        )}
      </div>
    </div>
  );
}

export default PopupBannerModal;
