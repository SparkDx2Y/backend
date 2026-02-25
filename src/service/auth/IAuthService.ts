import type { ForgotPasswordVerifyOtpDto } from "../../dto/request/auth/forgot-password-verify-otp.dto";
import type { ForgotPasswordDto } from "../../dto/request/auth/forgot-password.dto";
import type { LoginDto } from "../../dto/request/auth/login.dto";
import type { SignupDto } from "../../dto/request/auth/register.dto";
import type { ResetPasswordDto } from "../../dto/request/auth/reset-password.dto";
import type { VerifyOtpDto } from "../../dto/request/auth/verify-otp.dto";
import type { LoginResponseDto } from "../../dto/response/auth/login-response.dto";




export interface IAuthService {

  signup(data: SignupDto): Promise<{ tempToken: string; message: string; }>

  verifySignupOtp(userId: string, data: VerifyOtpDto): Promise<LoginResponseDto>

  resendSignupOtp(userId: string): Promise<{ message: string }>

  login(data: LoginDto): Promise<LoginResponseDto>

  forgotPassword(data: ForgotPasswordDto): Promise<{ userId: string, message: string }>

  forgotPasswordVerifyOtp(userId: string, data: ForgotPasswordVerifyOtpDto): Promise<{ resetToken: string; message: string }>

  resetPassword(resetToken: string, data: ResetPasswordDto): Promise<{ message: string }>

  resendForgotPasswordOtp(userId: string): Promise<{ message: string }>

  googleLogin(token: string): Promise<LoginResponseDto>

  getCurrentUser(userId: string): Promise<LoginResponseDto>

  refreshToken(refreshToken: string): Promise<{ accessToken: string }>

  generateTokens(userId: string, role: string): Promise<{ accessToken: string; refreshToken: string; isProfileCompleted: boolean; isInterestsSelected: boolean; isLocationCompleted: boolean; }>

}
