/**
 * Client-side API fetcher for Vouchiqo.
 *
 * Single source of truth for hitting Next.js route handlers from React.
 * Replaces the scattered raw `fetch("/api/...")` + hand-rolled `!res.ok`
 * + `res.json()` boilerplate that was duplicated across merchant & admin pages.
 *
 * Use this inside TanStack Query hooks (hooks/use-*.js), not directly in
 * components — components should call the hooks.
 */

/**
 * Perform a JSON API request. Throws an Error with the server message on
 * non-2xx responses, otherwise returns the parsed JSON body.
 *
 * @param {string} url      Route handler path, e.g. "/api/merchants/me"
 * @param {RequestInit} opts  Standard fetch options. `body` may be an object
 *                            and will be JSON-stringified automatically.
 * @returns {Promise<any>}   Parsed JSON response
 */
export async function apiFetch(url, opts = {}) {
  const { body, headers, ...rest } = opts;

  const finalHeaders = { "Content-Type": "application/json", ...headers };
  const finalBody =
    body && typeof body === "object" && !(body instanceof FormData)
      ? JSON.stringify(body)
      : body;

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const error = new Error(
      errorBody.message || `Request to ${url} failed with status ${res.status}`,
    );
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

/**
 * Upload a single file to the /api/uploads route.
 * Uses multipart/form-data, so it deliberately does NOT set Content-Type
 * (the browser sets the boundary automatically).
 *
 * @param {File} file       The file to upload
 * @param {string} folder   "logo" | "banner" | etc. — passed as a form field
 * @returns {Promise<string>} The uploaded image URL
 */
export async function uploadFile(file, folder) {
  const data = new FormData();
  data.append("file", file);
  data.append("folder", folder);

  const res = await fetch("/api/uploads", { method: "POST", body: data });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || "Failed to upload image");
  }

  const json = await res.json();
  return json.data?.url;
}
