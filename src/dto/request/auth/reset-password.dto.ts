import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    userId: z.string().min(1, "User ID is required").trim(),

    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .max(50, "Password must be less than 50 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
        "Password must contain uppercase, lowercase, number, and special character"
      )
      .trim(),

  })
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
