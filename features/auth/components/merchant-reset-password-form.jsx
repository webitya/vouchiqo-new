"use client";

import { ResetPasswordForm } from "./reset-password-form";

/**
 * Merchant Partner Reset Password Form.
 * Reuses the core ResetPasswordForm component with merchant-specific configuration.
 */
export function MerchantResetPasswordForm({ token }) {
  return (
    <ResetPasswordForm
      token={token}
      title="Set Merchant Password"
      loginHref="/merchant-login"
    />
  );
}
