import { inject, injectable } from "inversify";
import { Request, Response } from "express";

import { DI_TYPES } from "../../di/types";
import { IAuthService } from "../../service/auth/IAuthService";
import { signupSchema } from "../../dto/request/auth/register.dto";
import { verifyOtpSchema } from "../../dto/request/auth/verify-otp.dto";
import { loginSchema } from "../../dto/request/auth/login.dto";
import { forgotPasswordSchema } from "../../dto/request/auth/forgot-password.dto";
import { forgotPasswordVerifyOtpSchema } from "../../dto/request/auth/forgot-password-verify-otp.dto";
import { resetPasswordSchema } from "../../dto/request/auth/reset-password.dto";
import { generateRefreshToken, generateToken, verifyRefreshToken } from "../../utils/jwtHelper";



export class AuthController {

    constructor(
        @inject(DI_TYPES.SERVICES.AUTH_SERVICE) private _authService: IAuthService
    ) {}

    //* // // // // // //   signup  // // // // // // // *//

    signup = async (req: Request, res: Response) => {
        try {
            const data = signupSchema.parse(req.body);
            const { userId, message} = await this._authService.signup(data);
            
            //^ setting userId in the cookie for verifying the user in the next request
            res.cookie('otp_userId', userId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 5 * 60 * 1000
            });

            return res.status(201).json({ message })
        } catch (error: any) {
            return res.status(400).json({message: error.message})
        }
    }

    //* // // // // // //   verifySignupOtp  // // // // // // // *//

    verifySignupOtp = async (req: Request, res: Response) => {
        try {
            const data = verifyOtpSchema.parse(req.body);

            //^ getting userId from the cookie
            const userId = req.cookies.otp_userId;

            if(!userId) {
                return res.status(401).json({message: 'OTP Session expired'})
            }

            //^ verifying the otp
            const result = await this._authService.verifySignupOtp(userId, data);

            //^ clearing the cookie after verifying the otp
            res.clearCookie('otp_userId');

            return res.status(200).json(result)
        } catch (error: any) {
            return res.status(400).json({message: error.message})
        }
    }

    //* // // // // // //   resendSignupOtp  // // // // // // // *//

    resendSignupOtp = async (req: Request, res: Response) => {
        try {
            const userId = req.cookies.otp_userId

        if(!userId) {
            return res.status(401).json({message: 'OTP Session expired'})
        }

        const result = await this._authService.resendSignupOtp(userId);
        return res.status(200).json(result)
        } catch (error: any) {
            return res.status(400).json({message: error.message})
        }
    }

    //* // // // // // //   login  // // // // // // // *//

    login = async (req: Request, res: Response) => {
        try {
            const data = loginSchema.parse(req.body);
            const result = await this._authService.login(data);

            res.cookie('accessToken', result.token, {
                httpOnly: true,
                secure:true,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000
            })
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure:true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            return res.status(200).json({
                message: 'Login successful',
                user: result.user
            })

        } catch (error: any) {
            return res.status(400).json({message: error.message})
        }
    }

    //* // // // // // //   forgotPassword  // // // // // // // *//

    forgotPassword = async (req: Request, res: Response) => {
        try {
            const data = forgotPasswordSchema.parse(req.body);
            const {userId, message} = await this._authService.forgotPassword(data);
            
            //^ setting userId in the cookie for verifying the user in the next request
            res.cookie('otp_userId', userId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 5 * 60 * 1000
            });

            return res.status(200).json({message})
        } catch (error: any) {
            return res.status(400).json({message: error.message})
        }
    }

    //* // // // // // //   forgotPasswordVerifyOtp  // // // // // // // *//

    forgotPasswordVerifyOtp = async (req: Request, res: Response) => {
        try {
            const data = forgotPasswordVerifyOtpSchema.parse(req.body);

            const   userId = req.cookies.otp_userId;
            if(!userId) {
                return res.status(401).json({message: 'OTP Session expired'})
            }
            const result = await this._authService.forgotPasswordVerifyOtp(userId, data);

            res.cookie('otp_verified', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 5 * 60 * 1000
            });


            return res.status(200).json(result)
        } catch (error: any) {
            return res.status(400).json({message: error.message})
        }
    }

    //* // // // // // //   resetPassword  // // // // // // // *//

    resetPassword = async (req: Request, res: Response) => {
        try {
            const data = resetPasswordSchema.parse(req.body);
            
            const userId = req.cookies.otp_userId;
            const otpVerified = req.cookies.otp_verified;

            if(!userId || !otpVerified) {
                return res.status(401).json({message: 'OTP Session expired or not verified'})
            }
            const result = await this._authService.resetPassword(userId, data);

            res.clearCookie('otp_userId');
            res.clearCookie('otp_verified');

            return res.status(200).json(result)
        } catch (error: any) {
            return res.status(400).json({message: error.message})
        }
    }

    //* // // // // // //   logout  // // // // // // // *//

    logout = async (req: Request, res: Response) => {
        try {
            res.clearCookie('accessToken')
            res.clearCookie('refreshToken')
            return res.status(200).json({message: 'Logout successful'})
        } catch (error: any) {
            return res.status(400).json({message: error.message})
        }
    }


    //* // // // // // //  refreshToken  // // // // // // // *//

    refreshToken = async (req: Request, res: Response) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if(!refreshToken) {
                return res.status(401).json({message: 'Refresh token not found'})
            }

            const decoded = verifyRefreshToken(refreshToken);
            if(!decoded) {
                return res.status(401).json({message: 'Invalid refresh token'})
            }

            //^ generate new access token
            const newAccessToken = generateToken({id: decoded.id, role: decoded.role});
            const newRefreshToken = generateRefreshToken({id: decoded.id, role: decoded.role});

            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure:true,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000
            });
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure:true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({ message: 'Token refreshed successfully' })
        } catch (error: any) {
            return res.status(400).json({message: 'Refresh token Faile'})
        }
    }
}