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
import { clearAuthCookies, clearTempCookie, setAuthCookies, setTempCookie } from "../../utils/cookieHelper";



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
            //^ setting userId in the cookie for verifying the user in the next request
            setTempCookie(res, 'temp_token', tempToken);

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
            // Clear the signup session token
            clearTempCookie(res, 'temp_token');

            setAuthCookies(res, result.token, result.refreshToken);


            return res.status(HTTP_STATUS.OK).json({
                message: "OTP Verified. Please complete your profile",
                user: result.user
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

            setAuthCookies(res, result.token, result.refreshToken);



            return res.status(HTTP_STATUS.OK).json({
                message: "Login successful",
                user: result.user
            });


        } catch (error) {
            next(error)
        }
    }

    googleLogin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token } = req.body;
            const result = await this._authService.googleLogin(token);

            setAuthCookies(res, result.token, result.refreshToken);

            return res.status(HTTP_STATUS.OK).json({
                message: "Login successful",
                user: result.user
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
            //^ setting userId in the cookie for verifying the user in the next request
            setTempCookie(res, 'otp_userId', userId);

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
            const { resetToken, message } = await this._authService.forgotPasswordVerifyOtp(userId, data);

            // Set the secure reset token
            setTempCookie(res, 'reset_token', resetToken);

            // Clean up the previous step's cookie
            clearTempCookie(res, 'otp_userId');

            return res.status(HTTP_STATUS.OK).json({ message })
        } catch (error) {
            next(error)
        }
    }

    //* // // // // // //   resetPassword  // // // // // // // *//

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = resetPasswordSchema.parse(req.body);

            const resetToken = req.cookies.reset_token;

            if (!resetToken) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Reset session expired' })
            }

            const result = await this._authService.resetPassword(resetToken, data);

            clearTempCookie(res, 'reset_token');

            return res.status(HTTP_STATUS.OK).json(result)
        } catch (error) {
            next(error)
        }
    }

    //* // // // // // //   logout  // // // // // // // *//

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            clearAuthCookies(res);
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
            let isProfileCompleted = true;
            let isInterestsSelected = true;
            let isLocationCompleted = true;

            if (decoded.role === 'user') {
                isProfileCompleted = await this._profileService.isProfileCompleted(decoded.id);
                isInterestsSelected = await this._profileService.isInterestsSelected(decoded.id);
                isLocationCompleted = await this._profileService.isLocationCompleted(decoded.id);
            }

            //^ generate new access token
            const newAccessToken = generateToken({
                id: decoded.id,
                role: decoded.role,
                isProfileCompleted,
                isInterestsSelected,
                isLocationCompleted
            });
            const newRefreshToken = generateRefreshToken({ id: decoded.id, role: decoded.role });

            setAuthCookies(res, newAccessToken, newRefreshToken);

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
                user: result.user
            });
        } catch (error) {
            next(error);
        }
    }
}