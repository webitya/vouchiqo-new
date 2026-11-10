import { z } from "zod";
import { isDisposableEmail } from "@/utils/disposable-emails";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

export const merchantLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const adminLoginSchema = z.object({
  username: z
    .string()
    .min(1, "Username or email is required")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Full name is required").max(100),
    email: z
      .string()
      .min(1, "Email is required")
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address")
      .refine((val) => !isDisposableEmail(val), {
        message:
          "Temporary or disposable email addresses are not permitted. Please use a real email.",
      }),
    phoneNumber: z
      .string()
      .min(1, "Mobile number is required")
      .refine(
        (val) => {
          if (!val || typeof val !== "string") return false;
          const clean = val.replace(/[\s-()]/g, "");
          return /^\+?\d{10,15}$/.test(clean);
        },
        { message: "Please enter a valid mobile number (10–15 digits)." },
      ),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    agreed: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the Terms of Service." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const merchantRegisterSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required").max(100),
  email: z
    .string()
    .min(1, "Email is required")
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .refine((val) => !isDisposableEmail(val), {
      message:
        "Temporary or disposable email addresses are not permitted. Please use a real email.",
    }),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  agreed: z.literal(true, {
    errorMap: () => ({
      message: "You must agree to the Merchant Terms of Service.",
    }),
  }),
});
