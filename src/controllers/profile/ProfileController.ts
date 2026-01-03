import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IProfileService } from "../../service/profile/IProfileService";
import { verifyTempToken, verifyToken } from "../../utils/jwtHelper";
import { generateToken, generateRefreshToken } from "../../utils/jwtHelper";
import { completeProfileSchema } from "../../dto/request/profile/complete-profile.dto";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";

@injectable()
export class ProfileController {

    constructor(
        @inject(DI_TYPES.SERVICES.PROFILE_SERVICE) private readonly _profileService: IProfileService
    ) { }

    // ----------------------------------
    // Complete profile (onboarding)
    // ----------------------------------
    completeProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1️⃣ Get userId from tempToken or accessToken
            const tempToken = req.cookies.temp_token;
            const accessTokenFromCookie = req.cookies.accessToken;
            let userId: string | undefined;
            let userRole: "user" | "admin" = "user";

            if (tempToken) {
                const decoded = verifyTempToken(tempToken);
                userId = decoded.userId;
            } else if (accessTokenFromCookie) {
                try {
                    const decoded = verifyToken(accessTokenFromCookie);
                    userId = decoded.id;
                    userRole = decoded.role as "user" | "admin";
                } catch (err) {
                    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                        message: COMMON_ERRORS.UNAUTHORIZED
                    });
                }
            }

            if (!userId) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    message: COMMON_ERRORS.UNAUTHORIZED
                });
            }
            // ❌ BLOCK ADMINS FROM PROFILE FLOW
            if (userRole === "admin") {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    message: "Admins do not have profiles",
                });
            }

            const data = completeProfileSchema.parse(req.body);

            // Complete profile
            const { profile, isCompleted } = await this._profileService.completeProfile(userId, data);

            // If profile is NOT completed yet
            if (!isCompleted) {
                return res.status(HTTP_STATUS.OK).json({
                    message: "Profile saved partially",
                    isCompleted: false,
                    profile
                });
            }

            // Profile completed → issue auth tokens
            const accessToken = generateToken({ id: userId, role: userRole, isProfileCompleted: true });
            const refreshToken = generateRefreshToken({ id: userId, role: userRole });

            // Clear temp token
            res.clearCookie("temp_token");

            // Set auth cookies
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 15 * 60 * 1000,
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.status(HTTP_STATUS.OK).json({
                message: "Profile completed successfully",
                isCompleted: true,
                profile
            });

        } catch (error) {
            next(error)
        }
    };

    // ----------------------------------
    // Get my profile (after login)
    // ----------------------------------
    getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // req.user is set by auth middleware (access token)
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }
            const userId = req.user.id;

            const profile = await this._profileService.getProfileByUserId(userId);

            return res.status(HTTP_STATUS.OK).json(profile);

        } catch (error) {
            next(error)
        }
    };
}
