import { resend } from "../config/resendConfig"

export const sendOtpEmail = async (email: string, otp: string) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: email,
            subject: "Your OTP Code",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #333;">Email Verification</h1>
                <p>Your OTP code is: <strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
              </div>
            `,
        });

        if (error) {
            console.error("Resend error:", error);
            return null;
        }

        return data;
    } catch (err) {
        console.error("Email sending failed:", err);
        return null
    }
}