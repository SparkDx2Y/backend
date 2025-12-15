import { z } from "zod";

export const verifyOtpSchema = z.object({
  otp: z.string().min(6, 'OTP must be at least 6 characters'),
});


export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
