import { uploadImage } from "@/lib/cloudinary";
import { rateLimit, requireAuth } from "@/modules/auth/auth.middleware";
import { ok } from "@/utils/api-response";
import { AppError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/uploads
 * Upload an image to Cloudinary. Returns the secure URL and public ID.
 *
 * Accepts multipart/form-data with a "file" field.
 * Validates: file type, file size, auth.
 */
export const POST = asyncHandler(async (request) => {
  // Rate limit: max 20 uploads per hour per IP for guests.
  await rateLimit(request, "POST:/api/uploads", 20, 3600);

  try {
    await requireAuth(request);
  } catch {
    // Allow guest uploads during merchant registration
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder") ?? "general";

  if (!file || typeof file === "string") {
    throw new AppError("No file provided", 400, "NO_FILE");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new AppError(
      "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
      400,
      "INVALID_FILE_TYPE",
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new AppError("File size exceeds 5 MB limit", 400, "FILE_TOO_LARGE");
  }

  // Convert file to base64 data URI for Cloudinary upload
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await uploadImage(dataUri, {
    folder: `vouchiqo/${folder}`,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return ok(result, "File uploaded successfully");
});
