import { Request, Response, NextFunction } from "express";
import container from "../di";
import { DI_TYPES } from "../di/types";
import { IProfileService } from "../service/profile/IProfileService";

export const profileCompleteGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // authMiddleware already set req.user
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: User not authenticated" });
        }
        const userId = req.user.id;

        const profileService = container.get<IProfileService>(
            DI_TYPES.SERVICES.PROFILE_SERVICE
        );

        const isCompleted = await profileService.isProfileCompleted(userId);

        if (!isCompleted) {
            return res.status(403).json({
                message: "Profile not completed",
                code: "PROFILE_INCOMPLETE",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Profile check failed",
        });
    }
};
