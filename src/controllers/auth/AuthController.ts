import { inject, injectable } from "inversify";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/responseHelper";
import { COMMON_MESSAGES } from "../../constants/common.messages";

import { DI_TYPES } from "../../di/types";
import { IAuthService } from "../../service/auth/IAuthService";
import { signupSchema } from "../../dto/request/auth/register.dto";
import { verifyOtpSchema } from "../../dto/request/auth/verify-otp.dto";
import { loginSchema } from "../../dto/request/auth/login.dto";
import { forgotPasswordSchema } from "../../dto/request/auth/forgot-password.dto";
import { forgotPasswordVerifyOtpSchema } from "../../dto/request/auth/forgot-password-verify-otp.dto";
import { resetPasswordSchema } from "../../dto/request/auth/reset-password.dto";
import { changePasswordSchema } from "../../dto/request/auth/change-password.dto";
import { verifyTempToken } from "../../utils/jwtHelper";
import { IProfileService } from "../../service/profile/IProfileService";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";
import { clearAuthCookies, clearTempCookie, setAccessTokenCookie, setAuthCookies, setTempCookie } from "../../utils/cookieHelper";



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
            setTempCookie(res, 'temp_token', tempToken);

            return sendResponse(res, HTTP_STATUS.CREATED, message);
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
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.SESSION_EXPIRED);
            }

            const { userId } = verifyTempToken(token)

            //^ verifying the otp
            const result = await this._authService.verifySignupOtp(userId, data);


            // Clear the signup session token
            clearTempCookie(res, 'temp_token');

            setAuthCookies(res, result.accessToken, result.refreshToken);
            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.OTP_VERIFIED_COMPLETE_PROFILE, { user: result.user });
        } catch (error) {
            next(error)
        }
    }

    //* // // // // // //   resendSignupOtp  // // // // // // // *//

    resendSignupOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.temp_token;
            if (!token) {
                // return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.SESSION_EXPIRED });
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.SESSION_EXPIRED);
            }

            const { userId } = verifyTempToken(token);

            const result = await this._authService.resendSignupOtp(userId);
            return sendResponse(res, HTTP_STATUS.OK, result.message);

        } catch (error) {
            next(error)
        }
    };


    //* // // // // // //   login  // // // // // // // *//

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = loginSchema.parse(req.body);
            const result = await this._authService.login(data);

            setAuthCookies(res, result.accessToken, result.refreshToken);
            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.LOGIN_SUCCESSFUL, { user: result.user });


        } catch (error) {
            next(error)
        }
    }

    googleLogin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token } = req.body;
            const result = await this._authService.googleLogin(token);

            setAuthCookies(res, result.accessToken, result.refreshToken);

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.LOGIN_SUCCESSFUL, { user: result.user });
        } catch (error) {
            next(error)
        }
    }

    //* // // // // // //   forgotPassword  // // // // // // // *//

    forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = forgotPasswordSchema.parse(req.body);
            const { userId, message } = await this._authService.forgotPassword(data);


            setTempCookie(res, 'otp_userId', userId);

            return sendResponse(res, HTTP_STATUS.OK, message);
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
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_MESSAGES.OTP_SESSION_EXPIRED);
            }
            const { resetToken, message } = await this._authService.forgotPasswordVerifyOtp(userId, data);


            setTempCookie(res, 'reset_token', resetToken);


            clearTempCookie(res, 'otp_userId');

            return sendResponse(res, HTTP_STATUS.OK, message);
        } catch (error) {
            next(error)
        }
    }

    //* // // // // // //   resendForgotPasswordOtp  // // // // // // // *//

    resendForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.cookies.otp_userId;

            if (!userId) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_MESSAGES.OTP_SESSION_EXPIRED);
            }

            const result = await this._authService.resendForgotPasswordOtp(userId);
            return sendResponse(res, HTTP_STATUS.OK, result.message);

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
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_MESSAGES.RESET_SESSION_EXPIRED);
            }

            const result = await this._authService.resetPassword(resetToken, data);

            clearTempCookie(res, 'reset_token');

            return sendResponse(res, HTTP_STATUS.OK, result.message);
        } catch (error) {
            next(error)
        }
    }


    //* // // // // // //   changePassword  // // // // // // // *//

    changePassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const data = changePasswordSchema.parse(req.body);

            const result = await this._authService.changePassword(req.user.id, data);

            return sendResponse(res, HTTP_STATUS.OK, result.message);
        } catch (error) {
            next(error)
        }
    }

    //* // // // // // //   logout  // // // // // // // *//

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            clearAuthCookies(res);
            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.LOGOUT_SUCCESSFUL);
        } catch (error) {
            next(error)
        }
    }


    //* // // // // // //  refreshToken  // // // // // // // *//

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.SESSION_EXPIRED);
            }

            const result = await this._authService.refreshToken(refreshToken);

            setAccessTokenCookie(res, result.accessToken);

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.TOKEN_REFRESHED);
        } catch (error) {
            next(error)
        }
    }

    getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const result = await this._authService.getCurrentUser(req.user.id);

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FETCHED_SUCCESSFULLY, { user: result.user });
        } catch (error) {
            next(error);
        }
    }
}