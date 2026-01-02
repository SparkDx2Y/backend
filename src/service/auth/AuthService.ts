import { inject, injectable } from "inversify";
import { IAuthService } from "./IAuthService";

import { DI_TYPES } from "../../di/types";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { IOtpRepository } from "../../repositories/otp/IOtpRepository";


import { comparePassword, hashPassword } from "../../utils/password";
import { generateOtp } from "../../utils/generate-otp";
import { sendOtpEmail } from "../../utils/sendEmail";
import { generateRefreshToken, generateTempToken, generateToken } from "../../utils/jwtHelper";

import { SignupDto } from "../../dto/request/auth/register.dto";
import { VerifyOtpDto } from "../../dto/request/auth/verify-otp.dto";
import { LoginResponseDto } from "../../dto/response/auth/login-response.dto";
import { LoginDto } from "../../dto/request/auth/login.dto";

import { AuthMapper } from "../../mapper/auth/auth.mapper";
import { ForgotPasswordDto } from "../../dto/request/auth/forgot-password.dto";
import { ForgotPasswordVerifyOtpDto } from "../../dto/request/auth/forgot-password-verify-otp.dto";
import { ResetPasswordDto } from "../../dto/request/auth/reset-password.dto";
import { IProfileService } from "../profile/IProfileService";
import { AppError } from "../../utils/AppError";
import { AUTH_ERRORS } from "../../constants/errors/auth.errors";
import { HTTP_STATUS } from '../../constants/http-status.constants'




@injectable()
export class AuthService implements IAuthService {

    constructor(
        @inject(DI_TYPES.REPOSITORIES.USER_REPOSITORY) private _userRepo: IUserRepository,
        @inject(DI_TYPES.REPOSITORIES.OTP_REPOSITORY) private _otpRepo: IOtpRepository,
        @inject(DI_TYPES.SERVICES.PROFILE_SERVICE)
        private _profileService: IProfileService
    ) { }


    //* ----------------------------------
    // Signup
    //* ----------------------------------

    async signup(data: SignupDto): Promise<{ tempToken: string; message: string; }> {

        const existingUser = await this._userRepo.findByEmail(data.email);

        if (existingUser) {
            throw new AppError(
                AUTH_ERRORS.EMAIL_EXISTS,
                HTTP_STATUS.BAD_REQUEST
            )
        }

        const hashedPassword = await hashPassword(data.password);

        const newUser = await this._userRepo.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: 'user',
            isVerified: false,
        });

        const otp = generateOtp();
        await this._otpRepo.saveOtp(newUser._id.toString(), otp, 300);

        await sendOtpEmail(newUser.email, otp);

        const tempToken = generateTempToken({ userId: newUser._id.toString() });

        return { tempToken, message: 'OTP sent to your email' };
    }


    //* ----------------------------------
    // Verify Signup Otp
    //* ----------------------------------

    async verifySignupOtp(userId: string, data: VerifyOtpDto): Promise<{ message: string }> {

        const storedOtp = await this._otpRepo.getOtp(userId);

        if (!storedOtp || storedOtp !== data.otp) {
            throw new AppError(
                AUTH_ERRORS.OTP_INVALID,
                HTTP_STATUS.BAD_REQUEST
            )
        }

        await this._userRepo.markVerified(userId);
        await this._otpRepo.deleteOtp(userId);

        return { message: 'Otp verified successfully' };
    }




    //* // // // // // //   resendSignupOtp  // // // // // // // *//

    async resendSignupOtp(userId: string): Promise<{ message: string }> {

        const user = await this._userRepo.findById(userId);

        if (!user) {
            throw new AppError(
                AUTH_ERRORS.USER_NOT_FOUND,
                HTTP_STATUS.NOT_FOUND
            );
        }

        const newOtp = generateOtp();

        await this._otpRepo.deleteOtp(userId);
        await this._otpRepo.saveOtp(userId, newOtp, 300);
        await sendOtpEmail(user.email, newOtp);

        return { message: 'OTP resent successfully. Please check your email' };
    }


    //* ----------------------------------
    // Login
    //* ----------------------------------

    async login(data: LoginDto): Promise<LoginResponseDto> {

        const user = await this._userRepo.findByEmail(data.email);

        if (!user) {
            throw new AppError(
                AUTH_ERRORS.USER_NOT_FOUND,
                HTTP_STATUS.NOT_FOUND
            );
        }

        const isMatch = await comparePassword(data.password, user.password);

        if (!isMatch) {
            throw new AppError(
                AUTH_ERRORS.INVALID_CREDENTIALS,
                HTTP_STATUS.UNAUTHORIZED
            );
        }

        if (user.isBlocked) {
            throw new AppError(
                AUTH_ERRORS.USER_BLOCKED,
                HTTP_STATUS.FORBIDDEN
            );
        }

        if (!user.isVerified) {
            throw new AppError(
                AUTH_ERRORS.USER_NOT_VERIFIED,
                HTTP_STATUS.FORBIDDEN
            );
        }

        let isProfileCompleted = true;

        if (user.role === 'user') {
            isProfileCompleted = await this._profileService.isProfileCompleted(user._id.toString());
        }

        const token = generateToken({
            id: user._id.toString(),
            role: user.role,
            isProfileCompleted
        });
        const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

        return AuthMapper.toAuthResponseDto(user, token, refreshToken, isProfileCompleted);
    }

    //* ----------------------------------
    // Forgot Password
    //* ----------------------------------

    async forgotPassword(data: ForgotPasswordDto): Promise<{ userId: string, message: string }> {

        const user = await this._userRepo.findByEmail(data.email)

        if (!user) {
            throw new AppError(
                AUTH_ERRORS.USER_NOT_FOUND,
                HTTP_STATUS.NOT_FOUND
            );
        }

        const otp = generateOtp();
        await this._otpRepo.saveOtp(user._id.toString(), otp, 300);

        await sendOtpEmail(user.email, otp);
        return {
            userId: user._id.toString(),
            message: 'OTP sent to your email'
        }
    }


    //* ----------------------------------
    // Forgot Password Verify Otp
    //* ----------------------------------

    async forgotPasswordVerifyOtp(userId: string, data: ForgotPasswordVerifyOtpDto): Promise<{ message: string }> {

        const storedOtp = await this._otpRepo.getOtp(userId);

        if (!storedOtp || storedOtp !== data.otp) {
            throw new AppError(
                AUTH_ERRORS.OTP_INVALID,
                HTTP_STATUS.BAD_REQUEST
            );
        }

        await this._otpRepo.deleteOtp(userId);

        return { message: 'OTP verified successfully' };
    }


    //* ----------------------------------
    // Reset Password
    //* ----------------------------------

    async resetPassword(userId: string, data: ResetPasswordDto): Promise<{ message: string }> {
        const hashedPassword = await hashPassword(data.newPassword);

        await this._userRepo.updatePassword(userId, hashedPassword);

        return { message: 'Password reset successfully' };
    }

}



