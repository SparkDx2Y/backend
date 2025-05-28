import { otp } from '../models/Otp'

export class OtpRepository {
  async createOtp(emailId: string, otpValue: string) {
    return await otp.create({ email: emailId, otp: otpValue });
  }

  async findOtp(emailId: string, otpValue: string) {
    return otp.findOne({ email: emailId, otp: otpValue });
  }

  async deleteOtp(emailId: string) {
    return otp.deleteMany({ email: emailId });
  }
}