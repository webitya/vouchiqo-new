"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { DEFAULT_PLACEHOLDER, getOptimizedImageUrl } from "@/lib/image-utils";

/**
 * Production-ready resilient Image wrapper.
 * - Automatically injects Cloudinary (f_auto, q_auto, responsive width) transformations
 * - Optimizes Unsplash parameters
 * - Prevents layout shift (CLS) with intrinsic dimensions and responsive sizes
 * - Graceful fallback to lightweight placeholder upon network error
 *
 * @param {import("next/image").ImageProps} props
 */
export default function SafeImage({
  src,
  alt = "Image",
  fallbackSrc = DEFAULT_PLACEHOLDER,
  className = "",
  fill = false,
  width,
  height,
  priority = false,
  loading,
  fetchPriority,
  sizes,
  style,
  unoptimized,
  quality,
  ...rest
}) {
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  // Transform remote Cloudinary/Unsplash image if dimensions provided
  const optimizedSrc = useMemo(() => {
    if (!src || typeof src !== "string") return fallbackSrc;
    // For fixed width/height, calculate 2x retina target
    const targetWidth = width ? width * 2 : undefined;
    const targetHeight = height ? height * 2 : undefined;

    return getOptimizedImageUrl(src, {
      width: targetWidth,
      height: targetHeight,
      crop: fill ? "fill" : "limit",
    });
  }, [src, width, height, fill, fallbackSrc]);

  const finalSrc = hasError ? fallbackSrc : optimizedSrc || fallbackSrc;

  // Determine if image should bypass Next.js image optimization (data URI, blob, or svg)
  const isDataOrBlob =
    typeof finalSrc === "string" &&
    (finalSrc.startsWith("data:") ||
      finalSrc.startsWith("blob:") ||
      finalSrc.endsWith(".svg") ||
      finalSrc.includes("data:image"));

  // Cloudinary images already have f_auto, q_auto injected by getOptimizedImageUrl.
  // Delivering them directly avoids Next.js server Sharp re-encoding overhead and quality 400 errors.
  const isCloudinary =
    typeof finalSrc === "string" && finalSrc.includes("res.cloudinary.com");

  const shouldBeUnoptimized =
    typeof unoptimized === "boolean"
      ? unoptimized
      : isDataOrBlob || isCloudinary;

  // Default responsive sizes for fill images if not explicitly specified
  const effectiveSizes =
    sizes ||
    (fill
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      : undefined);

  return (
    <Image
      src={finalSrc}
      alt={alt || "Image"}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
      loading={priority ? "eager" : loading || "lazy"}
      fetchPriority={fetchPriority || (priority ? "high" : "auto")}
      sizes={effectiveSizes}
      unoptimized={shouldBeUnoptimized}
      className={className}
      style={style}
      quality={quality || 75}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
      {...rest}
    />
  );
}
