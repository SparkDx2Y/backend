import { otp } from '../models/Otp'

export class OtpRepository {
  async createOtp(userId: string, otpValue: string) {
    return await otp.create({ user: userId, otp: otpValue });
  }

  async findOtp(userId: string, otpValue: string) {
    return otp.findOne({ user: userId, otp: otpValue });
  }

  async deleteOtp(userId: string) {
    return otp.deleteMany({ user: userId });
  }
}