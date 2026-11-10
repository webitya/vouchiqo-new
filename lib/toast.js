/**
 * @file lib/toast.js
 * Thin wrappers over react-hot-toast with brand-consistent styling.
 *
 * Usage:
 *   import { showSuccess, showError, showLoading, showWarning, dismissToast } from "@/lib/toast";
 *   showSuccess("Offer created!");
 *   const id = showLoading("Saving...");
 *   dismissToast(id);
 */

import toast from "react-hot-toast";

/** @type {import("react-hot-toast").ToastOptions} */
const BASE_OPTS = {
  duration: 3500,
  position: "top-right",
  style: {
    fontFamily: "var(--font-sans, sans-serif)",
    fontSize: "13px",
    fontWeight: 500,
    borderRadius: "8px",
    padding: "10px 14px",
    boxShadow:
      "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  },
};

/**
 * Show a success toast.
 * @param {string} message
 * @param {import("react-hot-toast").ToastOptions} [opts]
 * @returns {string} toast id
 */
export function showSuccess(message, opts = {}) {
  return toast.success(message, {
    ...BASE_OPTS,
    style: {
      ...BASE_OPTS.style,
      background: "#f0fdf4",
      color: "#15803d",
      border: "1px solid #bbf7d0",
    },
    iconTheme: { primary: "#16a34a", secondary: "#f0fdf4" },
    ...opts,
  });
}

/**
 * Show an error toast.
 * @param {string} message
 * @param {import("react-hot-toast").ToastOptions} [opts]
 * @returns {string} toast id
 */
export function showError(message, opts = {}) {
  return toast.error(message, {
    ...BASE_OPTS,
    duration: 5000,
    style: {
      ...BASE_OPTS.style,
      background: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
    iconTheme: { primary: "#ef4444", secondary: "#fef2f2" },
    ...opts,
  });
}

/**
 * Show a persistent loading toast. Call dismissToast(id) when done.
 * @param {string} message
 * @param {import("react-hot-toast").ToastOptions} [opts]
 * @returns {string} toast id
 */
export function showLoading(message, opts = {}) {
  return toast.loading(message, {
    ...BASE_OPTS,
    duration: Infinity,
    style: {
      ...BASE_OPTS.style,
      background: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    },
    ...opts,
  });
}

/**
 * Show a warning toast.
 * @param {string} message
 * @param {import("react-hot-toast").ToastOptions} [opts]
 * @returns {string} toast id
 */
export function showWarning(message, opts = {}) {
  return toast(message, {
    ...BASE_OPTS,
    icon: "⚠️",
    style: {
      ...BASE_OPTS.style,
      background: "#fffbeb",
      color: "#92400e",
      border: "1px solid #fde68a",
    },
    ...opts,
  });
}

/**
 * Update a loading toast to success.
 * @param {string} id - toast id from showLoading
 * @param {string} message
 */
export function resolveLoading(id, message) {
  toast.success(message, {
    id,
    ...BASE_OPTS,
    style: {
      ...BASE_OPTS.style,
      background: "#f0fdf4",
      color: "#15803d",
      border: "1px solid #bbf7d0",
    },
    iconTheme: { primary: "#16a34a", secondary: "#f0fdf4" },
  });
}

/**
 * Update a loading toast to error.
 * @param {string} id - toast id from showLoading
 * @param {string} message
 */
export function rejectLoading(id, message) {
  toast.error(message, {
    id,
    ...BASE_OPTS,
    duration: 5000,
    style: {
      ...BASE_OPTS.style,
      background: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
    iconTheme: { primary: "#ef4444", secondary: "#fef2f2" },
  });
}

/**
 * Dismiss a toast by id or all toasts.
 * @param {string} [id]
 */
export function dismissToast(id) {
  toast.dismiss(id);
}
