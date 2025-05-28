import nodemailer from 'nodemailer'

export const generateOTP = () => {                                                          
  return Math.floor(100000 + Math.random() * 900000).toString(); 
};

export const sendOtp = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP code',
    html: `
        <h1>Email Verification</h1>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
  })
}