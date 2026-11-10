import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Must be a valid 10-digit Indian mobile number (starts with 6-9)",
    )
    .or(z.literal(""))
    .optional(),
  location: z
    .object({
      city: z.string().max(100).optional(),
      state: z.string().max(100).optional(),
      country: z.string().max(100).optional(),
    })
    .optional(),
  interests: z.array(z.string()).optional(),
  gender: z.enum(["men", "women", "not_preferred"]).nullable().optional(),
  isOnboarded: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  expiryAlerts: z.boolean().optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  role: z.enum(["customer", "merchant", "admin"]).optional(),
  isActive: z.coerce.boolean().optional(),
});
