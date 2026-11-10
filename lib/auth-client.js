import {
  emailOTPClient,
  inferAdditionalFields,
  oneTapClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client — use this in all React components and hooks.
 *
 * Provides:
 *   authClient.signUp.email()
 *   authClient.signIn.email()
 *   authClient.signOut()
 *   authClient.useSession()         ← reactive session hook
 *   authClient.forgetPassword()
 *   authClient.resetPassword()
 *   authClient.oneTap()
 */
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const googleClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.GOOGLE_CLIENT_ID ||
  "";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  plugins: [
    // Makes role + isActive fields available on the client session
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          defaultValue: "customer",
        },
        isActive: {
          type: "boolean",
          defaultValue: true,
        },
      },
    }),
    emailOTPClient(),
    ...(!isLocalhost && googleClientId
      ? [
          oneTapClient({
            clientId: googleClientId,
            autoSelect: false,
            cancelOnTapOutside: true,
          }),
        ]
      : []),
  ],
});

export const requestPasswordReset =
  authClient.requestPasswordReset ?? authClient.forgetPassword;

export const forgetPassword = (args) => {
  if (typeof authClient.requestPasswordReset === "function") {
    return authClient.requestPasswordReset(args);
  }
  return authClient.forgetPassword(args);
};

export const { signIn, signUp, signOut, useSession, resetPassword } =
  authClient;
