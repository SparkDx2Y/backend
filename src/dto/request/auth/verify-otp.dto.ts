import { z } from "zod";

export const verifyOtpSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
});


export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
