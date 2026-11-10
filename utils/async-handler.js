import { containsMongoOperator, sanitizeObject } from "@/lib/security";
import { handleError } from "@/utils/api-response";
import { AppError } from "@/utils/app-error";

/**
 * Wraps an async Next.js App Router route handler with centralized error handling.
 *
 * Usage:
 *   export const GET = asyncHandler(async (req, ctx) => { ... });
 *
 * Without this wrapper, any thrown error will result in a 500 with no body in production.
 *
 * @param {Function} fn - Async route handler (req, ctx) => Response
 * @returns {Function} - Handler with error catching
 */
export function asyncHandler(fn) {
  return async (request, context) => {
    // Intercept request.json() to sanitize HTML and detect NoSQL injection
    if (request && typeof request.json === "function") {
      const originalJson = request.json.bind(request);
      request.json = async () => {
        try {
          const body = await originalJson();
          if (!body) return body;

          // Check for MongoDB operators (NoSQL injection prevention)
          if (containsMongoOperator(body)) {
            throw new AppError(
              "Invalid input parameters: MongoDB operators are not allowed",
              400,
              "BAD_REQUEST",
            );
          }

          // Recursively sanitize all HTML tags from strings (XSS prevention)
          return sanitizeObject(body);
        } catch (err) {
          if (err instanceof AppError) throw err;
          throw err;
        }
      };
    }

    try {
      return await fn(request, context);
    } catch (err) {
      return handleError(err);
    }
  };
}
