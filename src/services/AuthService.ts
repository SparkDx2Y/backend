import { UserRepository } from "../repositories/UserRepository";
import { OtpRepository } from "../repositories/otpRepository";
import { sendOtp, generateOTP } from "../utils/SendOtpEmail";
import bcrypt from 'bcryptjs'
import { generateAccessToken, generateRefreshToken} from "../utils/jwt";


export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private otpRepo: OtpRepository
  ){}

  async signup(email: string, password: string) {
    try {
      
      const existingUser = await this.userRepo.findByEmail(email)
      if(existingUser) {
        throw new Error('User already exists');
      }

      const newUser = await this.userRepo.create({ 
        email, 
        password 
      });
      
      const otp = generateOTP();
      await this.otpRepo.createOtp(newUser._id.toString(), otp);
      await sendOtp(email, otp);
      
      const { password: _, ...userWithoutPassword } = newUser.toObject();
      return userWithoutPassword;

    } catch (error) {
      console.error("Error during signup:", error);
      throw error; 
    }
  }

  async verifyOtp(userId: string, otpCode: string) {
    try {
      const match = await this.otpRepo.findOtp(userId, otpCode)
      if(!match) throw new Error('Invalid or expired OTP')

      await this.userRepo.verifyUser(userId)
      await this.otpRepo.deleteOtp(userId)
      return { message: 'verified'}
    } catch (error) {
      console.error("Error during OTP verification:", error);
      throw error; 
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.userRepo.findByEmail(email)
      if(!user || !user.isVerified) throw new Error('User not found or not verified')

      const isMatch = await bcrypt.compare(password,user.password)
      if(!isMatch) throw new Error("Invalid credentials")

      const accessToken = generateAccessToken(user._id.toString())
      const refreshToken = generateRefreshToken(user._id.toString())
      return { accessToken, refreshToken, user}
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  }

  async resendOtp(email: string) {
    try {

      const user = await this.userRepo.findByEmail(email)
      if(!user) throw new Error('User not found')
      if(user.isVerified) throw new Error('User already verified')

      await this.otpRepo.deleteOtp(user._id.toString())
      const otp = generateOTP();
      await this.otpRepo.createOtp(user._id.toString(), otp);
      await sendOtp(email, otp);

      return { message: "OTP resent" };

    } catch (error: any) {
      console.error('Error during resend otp ',error);
      throw error;
    }
  }

  async forgotPasswordRequest(email: string) {
    try {
      const user = await this.userRepo.findByEmail(email)
      if(!user) throw new Error('User not found')

        await this.otpRepo.deleteOtp(user._id.toString())
        const otp = generateOTP();
        await this.otpRepo.createOtp(user._id.toString(), otp);
        await sendOtp(email, otp);
  
        return { userId: user._id, message: "OTP sent to email" };

    } catch (error: any) {
      console.error('Error during forgot password',error)
      throw error
    }
  }

  async verifyForgotPasswordOtp(userId: string, otpCode: string) {
    try {
      const match = await this.otpRepo.findOtp(userId, otpCode)
      if (!match) throw new Error('Invalid or expired OTP');
      return { message: 'OTP verified'}
    } catch (error: any) {
      console.error('Error during verifyOtp',error)
    }
  }
  
  async resetPassword(userId: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await this.userRepo.updatePassword(userId, hashedPassword)
    await this.otpRepo.deleteOtp(userId)
    return { message: 'Password reset successful'}
  }

}


