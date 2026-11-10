"use client";

import ConfirmDeleteModal from "./ConfirmDeleteModal";

/**
 * @deprecated DeleteConfirmDialog is deprecated in favor of ConfirmDeleteModal.
 * This wrapper is kept for backwards compatibility.
 */
export default function DeleteConfirmDialog(props) {
  return <ConfirmDeleteModal {...props} />;
}
