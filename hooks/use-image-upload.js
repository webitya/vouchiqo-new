"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { uploadFile } from "@/lib/fetcher";

/**
 * Reusable image-upload hook. Wraps the `handleImageUpload` logic that was
 * previously inlined in the merchant profile page.
 *
 * @param {string} field - "logo" | "banner" | any folder name the API expects
 * @param {Function} onUploaded - callback receiving the returned URL
 * @returns {{ uploading: boolean, handleUpload: (e: Event) => Promise<void> }}
 */
export function useImageUpload(field, onUploaded) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file, field);
      onUploaded?.(url);
      toast.success(`${field === "logo" ? "Logo" : "Cover banner"} uploaded!`);
    } catch (err) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  return { uploading, handleUpload };
}
