import { Request, Response } from "express";
import { inject } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IProfileService } from "../../service/profile/IProfileService";
import { verifyTempToken, verifyToken } from "../../utils/jwtHelper";
import { generateToken, generateRefreshToken } from "../../utils/jwtHelper";
import { completeProfileSchema } from "../../dto/request/profile/complete-profile.dto";

export class ProfileController {

    constructor(
        @inject(DI_TYPES.SERVICES.PROFILE_SERVICE) private readonly _profileService: IProfileService
    ) { }

    // ----------------------------------
    // Complete profile (onboarding)
    // ----------------------------------
    completeProfile = async (req: Request, res: Response) => {
        try {
            // 1️⃣ Get userId from tempToken or accessToken
            const tempToken = req.cookies.temp_token;
            const accessTokenFromCookie = req.cookies.accessToken;
            let userId: string | undefined;

            if (tempToken) {
                const decoded = verifyTempToken(tempToken);
                userId = decoded.userId;
            } else if (accessTokenFromCookie) {
                try {
                    const decoded = verifyToken(accessTokenFromCookie);
                    userId = decoded.id;
                } catch (err) {
                    return res.status(401).json({ message: "Invalid access token" });
                }
            }

            if (!userId) {
                return res.status(401).json({ message: "Session expired" });
            }

            const data = completeProfileSchema.parse(req.body);

            // 3️⃣ Complete profile
            const { profile, isCompleted } =
                await this._profileService.completeProfile(userId, data);

            // 4️⃣ If profile is NOT completed yet
            if (!isCompleted) {
                return res.status(200).json({
                    message: "Profile saved partially",
                    isCompleted: false,
                    profile
                });
            }

            // 5️⃣ Profile completed → issue auth tokens
            const accessToken = generateToken({ id: userId, role: "user" });
            const refreshToken = generateRefreshToken({ id: userId, role: "user" });

            // 6️⃣ Clear temp token
            res.clearCookie("temp_token");

            // 7️⃣ Set auth cookies
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
            });

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.status(200).json({
                message: "Profile completed successfully",
                isCompleted: true,
                profile
            });

        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    };

    // ----------------------------------
    // Get my profile (after login)
    // ----------------------------------
    getMyProfile = async (req: Request, res: Response) => {
        try {
            // req.user is set by auth middleware (access token)
            if (!req.user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const userId = req.user.id;

            const profile = await this._profileService.getProfileByUserId(userId);

            if (!profile) {
                return res.status(404).json({ message: "Profile not found" });
            }

            return res.status(200).json(profile);

        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    };
}
