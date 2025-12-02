import { ForgotPasswordVerifyOtpDto } from "../../dto/request/auth/forgot-password-verify-otp.dto";
import { ForgotPasswordDto } from "../../dto/request/auth/forgot-password.dto";
import { LoginDto } from "../../dto/request/auth/login.dto";
import { SignupDto } from "../../dto/request/auth/register.dto";
import { ResendOtpDto } from "../../dto/request/auth/resend-otp.dto";
import { ResetPasswordDto } from "../../dto/request/auth/reset-password.dto";
import { VerifyOtpDto } from "../../dto/request/auth/verify-otp.dto";
import { LoginResponseDto } from "../../dto/response/auth/login-response.dto";




export interface IAuthService {

  signup(data: SignupDto): Promise<{userId: string, message: string}>

  verifySignupOtp(data: VerifyOtpDto): Promise<{message: string}>

  resendSignupOtp(data: ResendOtpDto): Promise<{message: string}>

  login(data: LoginDto): Promise<LoginResponseDto>

  forgotPassword(data: ForgotPasswordDto): Promise<{userId: string, message: string}>

  forgotPasswordVerifyOtp(data: ForgotPasswordVerifyOtpDto): Promise<{message: string}>

  resetPassword(data: ResetPasswordDto): Promise<{message: string}>

}
