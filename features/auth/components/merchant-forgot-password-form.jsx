"use client";

import { ForgotPasswordForm } from "./forgot-password-form";

/**
 * Merchant Partner Forgot Password Form.
 * Reuses the core ForgotPasswordForm component with merchant-specific configuration.
 */
export function MerchantForgotPasswordForm() {
  return (
    <ForgotPasswordForm
      userRole="merchant"
      title="Merchant Partner Password Recovery"
      subtitle="Enter your registered business email and we'll send a password recovery link."
      loginHref="/merchant-login"
      redirectTo="/merchant-reset-password"
    />
  );
}
