import { inject, injectable } from "inversify";
import { Request, Response, NextFunction } from "express";

import { DI_TYPES } from "../../di/types";
import { IAuthService } from "../../service/auth/IAuthService";
import { signupSchema } from "../../dto/request/auth/register.dto";
import { verifyOtpSchema } from "../../dto/request/auth/verify-otp.dto";
import { loginSchema } from "../../dto/request/auth/login.dto";
import { forgotPasswordSchema } from "../../dto/request/auth/forgot-password.dto";
import { forgotPasswordVerifyOtpSchema } from "../../dto/request/auth/forgot-password-verify-otp.dto";
import { resetPasswordSchema } from "../../dto/request/auth/reset-password.dto";
import { generateRefreshToken, generateToken, generateTempToken, verifyRefreshToken, verifyTempToken } from "../../utils/jwtHelper";
import { IProfileService } from "../../service/profile/IProfileService";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";



@injectable()
export class AuthController {

    constructor(
        @inject(DI_TYPES.SERVICES.AUTH_SERVICE) private _authService: IAuthService,
        @inject(DI_TYPES.SERVICES.PROFILE_SERVICE) private _profileService: IProfileService
    ) { }

    //* // // // // // //   signup  // // // // // // // *//

    signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = signupSchema.parse(req.body);
            const { tempToken, message } = await this._authService.signup(data);

            //^ setting userId in the cookie for verifying the user in the next request
            res.cookie('temp_token', tempToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 30 * 60 * 1000
            });

            return res.status(HTTP_STATUS.CREATED).json({ message })
        } catch (error) {
            next(error)
        }
    }

    //* // // // // // //   verifySignupOtp  // // // // // // // *//

    verifySignupOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = verifyOtpSchema.parse(req.body);

            //^ getting userId from the cookie
            const token = req.cookies.temp_token;

            if (!token) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.SESSION_EXPIRED })
            }

            const { userId } = verifyTempToken(token)

            //^ verifying the otp
            const result = await this._authService.verifySignupOtp(userId, data);

            // Clear the signup session token
            res.clearCookie('temp_token');

            // Set cookies akin to login
            res.cookie('accessToken', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000
            });
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });


            return res.status(HTTP_STATUS.OK).json({
                message: "OTP Verified. Please complete your profile",
                user: result.user,
                isProfileCompleted: result.isProfileCompleted
            });
        } catch (error) {
            next(error)
        }
    }

    //* // // // // // //   resendSignupOtp  // // // // // // // *//

    resendSignupOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.temp_token;
            if (!token) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.SESSION_EXPIRED });
            }

            const { userId } = verifyTempToken(token);

            const result = await this._authService.resendSignupOtp(userId);
            return res.status(HTTP_STATUS.OK).json(result);

        } catch (error) {
            next(error)
        }
    };


    //* // // // // // //   login  // // // // // // // *//

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = loginSchema.parse(req.body);
            const result = await this._authService.login(data);

            res.cookie('accessToken', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000
            })
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })



            return res.status(HTTP_STATUS.OK).json({
                message: "Login successful",
                user: result.user,
                isProfileCompleted: result.isProfileCompleted,
            });


        } catch (error) {
            next(error)
        }
    }

    googleLogin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token } = req.body;
            const result = await this._authService.googleLogin(token);

            res.cookie('accessToken', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000
            })
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            return res.status(HTTP_STATUS.OK).json({
                message: "Login successful",
                user: result.user,
                isProfileCompleted: result.isProfileCompleted,
            });
        } catch (error) {
            next(error)
        }
    }

    //* // // // // // //   forgotPassword  // // // // // // // *//

    forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = forgotPasswordSchema.parse(req.body);
            const { userId, message } = await this._authService.forgotPassword(data);

            //^ setting userId in the cookie for verifying the user in the next request
            res.cookie('otp_userId', userId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 5 * 60 * 1000
            });

            return res.status(HTTP_STATUS.OK).json({ message })
        } catch (error) {
            next(error)
        }
    }

    //* // // // // // //   forgotPasswordVerifyOtp  // // // // // // // *//

    forgotPasswordVerifyOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = forgotPasswordVerifyOtpSchema.parse(req.body);

            const userId = req.cookies.otp_userId;
            if (!userId) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'OTP Session expired' })
            }
            const result = await this._authService.forgotPasswordVerifyOtp(userId, data);

            res.cookie('otp_verified', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 5 * 60 * 1000
            });


            return res.status(HTTP_STATUS.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    //* // // // // // //   resetPassword  // // // // // // // *//

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = resetPasswordSchema.parse(req.body);

            const userId = req.cookies.otp_userId;
            const otpVerified = req.cookies.otp_verified;

            if (!userId || !otpVerified) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'OTP Session expired or not verified' })
            }
            const result = await this._authService.resetPassword(userId, data);

            res.clearCookie('otp_userId');
            res.clearCookie('otp_verified');

            return res.status(HTTP_STATUS.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    //* // // // // // //   logout  // // // // // // // *//

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.clearCookie('accessToken')
            res.clearCookie('refreshToken')
            return res.status(HTTP_STATUS.OK).json({ message: 'Logout successful' })
        } catch (error) {
            next(error)
        }
    }


    //* // // // // // //  refreshToken  // // // // // // // *//

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Refresh token not valid" })
            }

            const decoded = verifyRefreshToken(refreshToken);
            if (!decoded) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid refresh token' })
            }

            //^ fetch profile status
            const isProfileCompleted = await this._profileService.isProfileCompleted(decoded.id);

            //^ generate new access token
            const newAccessToken = generateToken({
                id: decoded.id,
                role: decoded.role,
                isProfileCompleted
            });
            const newRefreshToken = generateRefreshToken({ id: decoded.id, role: decoded.role });

            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000
            });
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(HTTP_STATUS.OK).json({ message: 'Token refreshed successfully' })
        } catch (error) {
            next(error)
        }
    }

    getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }

            const result = await this._authService.getCurrentUser(req.user.id);

            return res.status(HTTP_STATUS.OK).json({
                user: result.user,
                isProfileCompleted: result.isProfileCompleted
            });
        } catch (error) {
            next(error);
        }
    }
}