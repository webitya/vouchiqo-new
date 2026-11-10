import { PAGINATION } from "./constants.js";

/**
 * Parse and clamp page/limit from URL search params.
 *
 * @param {URLSearchParams} searchParams
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function parsePagination(searchParams) {
  const page = Math.max(
    1,
    Number(searchParams.get("page")) || PAGINATION.DEFAULT_PAGE,
  );
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, Number(searchParams.get("limit")) || PAGINATION.DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build pagination metadata to include in list responses.
 *
 * @param {number} total - Total document count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
export function buildMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Parse sort direction from URL search params.
 * Only allows sorting by fields explicitly provided in allowedFields.
 *
 * @param {URLSearchParams} searchParams
 * @param {string[]} allowedFields - Whitelist of sortable fields
 * @returns {object} - Mongoose sort object e.g. { createdAt: -1 }
 */
export function parseSort(searchParams, allowedFields = []) {
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

  const field =
    allowedFields.length === 0 || allowedFields.includes(sortBy)
      ? sortBy
      : "createdAt";

  return { [field]: sortOrder };
}
