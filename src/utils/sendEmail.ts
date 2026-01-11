import { transporter } from "../config/nodemailerConfig"

export const sendOtpEmail = async (email: string, otp: string) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER, 
        to: email,
        subject: "Your OTP Code",
        html: `
          <h1>Email Verification</h1>
          <p>Your OTP code is: <strong>${otp}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        `, 
    })
}