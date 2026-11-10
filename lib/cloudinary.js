import { v2 as cloudinary } from "cloudinary";
import { env } from "../utils/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer or base64 string to Cloudinary.
 *
 * @param {string} file - Base64 data URI or file path
 * @param {object} options - Cloudinary upload options
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadImage(file, options = {}) {
  const result = await cloudinary.uploader.upload(file, {
    folder: "vouchiqo",
    ...options,
  });

  return {
    url: result.secure_url,
    secure_url: result.secure_url,
    publicId: result.public_id,
    public_id: result.public_id,
  };
}

export async function deleteImage(publicId) {
  await cloudinary.uploader.destroy(publicId);
}

export { cloudinary };
