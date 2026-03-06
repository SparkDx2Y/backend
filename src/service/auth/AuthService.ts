import { inject, injectable } from "inversify";
import { IAuthService } from "./IAuthService";

import { DI_TYPES } from "../../di/types";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { IOtpRepository } from "../../repositories/otp/IOtpRepository";


import { comparePassword, hashPassword } from "../../utils/password";
import { generateOtp } from "../../utils/generate-otp";
import { sendOtpEmail } from "../../utils/sendEmail";
import { generateRefreshToken, generateResetToken, generateTempToken, generateToken, RefreshPayload, verifyRefreshToken, verifyResetToken } from "../../utils/jwtHelper";
import { OAuth2Client } from "google-auth-library";

import { SignupDto } from "../../dto/request/auth/register.dto";
import { VerifyOtpDto } from "../../dto/request/auth/verify-otp.dto";
import { LoginResponseDto } from "../../dto/response/auth/login-response.dto";
import { LoginDto } from "../../dto/request/auth/login.dto";

import { AuthMapper } from "../../mapper/auth/auth.mapper";
import { ForgotPasswordDto } from "../../dto/request/auth/forgot-password.dto";
import { ForgotPasswordVerifyOtpDto } from "../../dto/request/auth/forgot-password-verify-otp.dto";
import { ResetPasswordDto } from "../../dto/request/auth/reset-password.dto";
import { ChangePasswordDto } from "../../dto/request/auth/change-password.dto";
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
        private _profileService: IProfileService,
        @inject(DI_TYPES.External.GOOGLE_CLIENT)
        private _googleClient: OAuth2Client
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

    async verifySignupOtp(userId: string, data: VerifyOtpDto): Promise<LoginResponseDto> {

        const storedOtp = await this._otpRepo.getOtp(userId);

        if (!storedOtp || storedOtp !== data.otp) {
            throw new AppError(
                AUTH_ERRORS.OTP_INVALID,
                HTTP_STATUS.BAD_REQUEST
            )
        }

        await this._userRepo.markVerified(userId);
        await this._otpRepo.deleteOtp(userId);

        const auth = await this.generateTokens(userId, 'user');

        const user = await this._userRepo.findById(userId);

        if (!user) {
            throw new AppError(AUTH_ERRORS.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        const profile = await this._profileService.getProfileByUserId(userId);
        const profilePhoto = profile?.profilePhoto || profile?.photos?.[0] || null;
        const interests = profile?.interests || [];

        return AuthMapper.toAuthResponseDto(user, auth.accessToken, auth.refreshToken, auth.isProfileCompleted, auth.isInterestsSelected, auth.isLocationCompleted, profilePhoto, interests);
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


        if (user.role !== data.role) {
            throw new AppError(
                AUTH_ERRORS.ROLE_MISMATCH,
                HTTP_STATUS.BAD_REQUEST
            );
        }

        if (!user.password) {
            throw new AppError(
                "This account is linked with social login. Please use Google to sign in.",
                HTTP_STATUS.BAD_REQUEST
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

        const auth = await this.generateTokens(user._id.toString(), user.role);


        const profile = await this._profileService.getProfileByUserId(user._id.toString());
        const profilePhoto = profile?.profilePhoto || profile?.photos?.[0] || null;
        const interests = profile?.interests || [];

        return AuthMapper.toAuthResponseDto(user, auth.accessToken, auth.refreshToken, auth.isProfileCompleted, auth.isInterestsSelected, auth.isLocationCompleted, profilePhoto, interests);
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

    async forgotPasswordVerifyOtp(userId: string, data: ForgotPasswordVerifyOtpDto): Promise<{ resetToken: string; message: string }> {

        const storedOtp = await this._otpRepo.getOtp(userId);

        if (!storedOtp || storedOtp !== data.otp) {
            throw new AppError(
                AUTH_ERRORS.OTP_INVALID,
                HTTP_STATUS.BAD_REQUEST
            );
        }

        await this._otpRepo.deleteOtp(userId);


        const resetToken = generateResetToken(userId);

        return { resetToken, message: 'OTP verified successfully' };
    }



    //* ----------------------------------
    // Resend Forgot Password Otp
    //* ----------------------------------

    async resendForgotPasswordOtp(userId: string): Promise<{ message: string }> {

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
    // Reset Password
    //* ----------------------------------

    async resetPassword(resetToken: string, data: ResetPasswordDto): Promise<{ message: string }> {

        const { userId } = verifyResetToken(resetToken);


        const hashedPassword = await hashPassword(data.newPassword);

        await this._userRepo.updatePassword(userId, hashedPassword);

        return { message: 'Password reset successfully' };
    }

    //* ----------------------------------
    // Get Current User
    //* ----------------------------------

    async getCurrentUser(userId: string): Promise<LoginResponseDto> {
        const user = await this._userRepo.findById(userId);

        if (!user) {
            throw new AppError(AUTH_ERRORS.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        const flags = await this.getProfileStatus(userId, user.role);

        const profile = await this._profileService.getProfileByUserId(userId);
        const profilePhoto = profile?.profilePhoto || profile?.photos?.[0] || null;
        const interests = profile?.interests || [];

        return AuthMapper.toAuthResponseDto(user, "", "", flags.isProfileCompleted, flags.isInterestsSelected, flags.isLocationCompleted, profilePhoto, interests);
    }

    //* ----------------------------------
    // Google Login
    //* ----------------------------------

    async googleLogin(idToken: string): Promise<LoginResponseDto> {

        const ticket = await this._googleClient.verifyIdToken({
            idToken
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            throw new AppError("Invalid Google token", HTTP_STATUS.UNAUTHORIZED);
        }

        const googleUser = {
            email: payload.email,
            name: payload.name || "Google User",
            sub: payload.sub,
        };


        let user = await this._userRepo.findByGoogleId(googleUser.sub);

        if (!user) {

            user = await this._userRepo.findByEmail(googleUser.email);

            if (user) {
                // Link Google ID to existing manual account
                user = await this._userRepo.updateGoogleId(user._id.toString(), googleUser.sub);

                if (!user) {
                    throw new AppError("Failed to link Google account", HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
            } else {
                // 3. Create brand new account
                user = await this._userRepo.create({
                    name: googleUser.name,
                    email: googleUser.email,
                    googleId: googleUser.sub,
                    role: 'user',
                    isVerified: true,
                });
            }
        }

        if (user.isBlocked) {
            throw new AppError(AUTH_ERRORS.USER_BLOCKED, HTTP_STATUS.FORBIDDEN);
        }

        const auth = await this.generateTokens(user._id.toString(), user.role);

        const profile = await this._profileService.getProfileByUserId(user._id.toString());
        const profilePhoto = profile?.profilePhoto || profile?.photos?.[0] || null;
        const interests = profile?.interests || [];

        return AuthMapper.toAuthResponseDto(user, auth.accessToken, auth.refreshToken, auth.isProfileCompleted, auth.isInterestsSelected, auth.isLocationCompleted, profilePhoto, interests);
    }

    //* ----------------------------------
    // Refresh Token
    //* ----------------------------------

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {

        let decoded: RefreshPayload;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch {
            throw new AppError(
                AUTH_ERRORS.INVALID_REFRESH_TOKEN,
                HTTP_STATUS.UNAUTHORIZED
            )
        }

        const flags = await this.getProfileStatus(decoded.id, decoded.role);

        const newAccessToken = generateToken({
            id: decoded.id,
            role: decoded.role,
            ...flags
        });
        return { accessToken: newAccessToken };
    }

    //* ----------------------------------
    // Change Password
    //* ----------------------------------

    async changePassword(userId: string, data: ChangePasswordDto): Promise<{ message: string }> {
        const user = await this._userRepo.findById(userId);

        if (!user) {
            throw new AppError(AUTH_ERRORS.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        if (!user.password) {
            throw new AppError(
                "This account is linked with social login. Please use Google to sign in.",
                HTTP_STATUS.BAD_REQUEST
            );
        }

        const isMatch = await comparePassword(data.oldPassword, user.password);

        if (!isMatch) {
            throw new AppError(AUTH_ERRORS.INCORRECT_PASSWORD, HTTP_STATUS.BAD_REQUEST);
        }

        const hashedPassword = await hashPassword(data.newPassword);
        await this._userRepo.updatePassword(userId, hashedPassword);

        return { message: "Password changed successfully" };
    }

    //* ----------------------------------
    // Private Helper: Get Profile Status
    //* ----------------------------------
    private async getProfileStatus(userId: string, role: string) {

        if (role !== 'user') {
            return {
                isProfileCompleted: true,
                isInterestsSelected: true,
                isLocationCompleted: true
            }
        }

        const isProfileCompleted = await this._profileService.isProfileCompleted(userId);
        const isInterestsSelected = await this._profileService.isInterestsSelected(userId);
        const isLocationCompleted = await this._profileService.isLocationCompleted(userId);

        return {
            isProfileCompleted,
            isInterestsSelected,
            isLocationCompleted
        }
    }

    //* ----------------------------------
    // Generate Tokens (Public)
    //* ----------------------------------
    public async generateTokens(userId: string, role: string) {
        const flags = await this.getProfileStatus(userId, role);
        const accessToken = generateToken({
            id: userId,
            role,
            ...flags
        });
        const refreshToken = generateRefreshToken({ id: userId, role });
        return { accessToken, refreshToken, ...flags };
    }

}
