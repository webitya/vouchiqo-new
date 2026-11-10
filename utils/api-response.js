import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { AppError } from "@/utils/app-error";
import { HTTP } from "@/utils/constants";

/**
 * Standard success response.
 * @param {*} data - Response payload
 * @param {string} message - Success message
 * @param {number} status - HTTP status code
 */
export function ok(data, message = "Success", status = HTTP.OK) {
  return NextResponse.json({ success: true, message, data }, { status });
}

/**
 * Standard 201 Created response.
 */
export function created(data, message = "Created successfully") {
  return ok(data, message, HTTP.CREATED);
}

/**
 * Standard 204 No Content response.
 */
export function noContent() {
  return new NextResponse(null, { status: HTTP.NO_CONTENT });
}

/**
 * Standard error response.
 * @param {string} message - Error message safe to show the client
 * @param {number} status - HTTP status code
 * @param {string|null} code - Machine-readable error code
 */
export function error(message, status = HTTP.INTERNAL_ERROR, code = null) {
  return NextResponse.json({ success: false, message, code }, { status });
}

export const errorResponse = error;

/**
 * Central error handler — converts any thrown error into the right HTTP response.
 * Call this in catch blocks inside route handlers.
 *
 * @param {unknown} err - The caught error
 */
export function handleError(err) {
  // Only log unexpected internal errors (500+) to keep terminal clean of expected 404s/401s
  if (
    !err?.isOperational &&
    (err?.statusCode === undefined || err?.statusCode >= 500)
  ) {
    console.error("API Route Error Caught:", err);
  }

  // Known operational errors — safe to expose
  if (err instanceof AppError) {
    return error(err.message, err.statusCode, err.code);
  }

  // Mongoose duplicate key (e.g. unique email / phone / gstin)
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    return error(
      `${field} is already registered to another account`,
      HTTP.CONFLICT,
      "DUPLICATE_KEY",
    );
  }

  // Mongoose CastError (invalid ObjectId format)
  if (err?.name === "CastError") {
    return error(
      `Invalid identifier: ${err.value}`,
      HTTP.BAD_REQUEST,
      "INVALID_ID",
    );
  }

  // Mongoose document validation errors
  if (err?.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return error(message, HTTP.UNPROCESSABLE, "VALIDATION_ERROR");
  }

  // Zod parse errors
  if (err?.name === "ZodError" || err?.issues) {
    const issues = err.issues || err.errors || [];
    const first = issues[0];
    const message = first
      ? `${first.path?.join(".") || "field"}: ${first.message}`
      : "Invalid input provided";
    return error(message, HTTP.BAD_REQUEST, "INVALID_INPUT");
  }

  // Unknown errors — log internally and return actual error message
  logger.error({ err }, "Unhandled server error");
  const message =
    err?.message || "An unexpected error occurred while processing request.";
  return error(message, HTTP.INTERNAL_ERROR, "INTERNAL_ERROR");
}
