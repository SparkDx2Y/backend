import { z } from "zod";

export const forgotPasswordVerifyOtpSchema = z.object({
    otp: z.string().min(6, 'OTP must be at least 6 characters'),
});

export type ForgotPasswordVerifyOtpDto = z.infer<typeof forgotPasswordVerifyOtpSchema>;
