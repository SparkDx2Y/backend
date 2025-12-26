import { Request, Response, NextFunction } from "express";
import container from "../di";
import { DI_TYPES } from "../di/types";
import { IProfileService } from "../service/profile/IProfileService";
import { HTTP_STATUS } from "../constants/http-status.constants";
import { COMMON_ERRORS } from "../constants/errors/common.erros";

export const profileCompleteGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // authMiddleware already set req.user
        if (!req.user || !req.user.id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
        }
        const userId = req.user.id;

        const profileService = container.get<IProfileService>(
            DI_TYPES.SERVICES.PROFILE_SERVICE
        );

        // Check if profile is completed
        const isCompleted = await profileService.isProfileCompleted(userId);

        // If profile is NOT completed yet
        if (!isCompleted) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                message: "Profile not completed"
            });
        }

        next();
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message: COMMON_ERRORS.SOMETHING_WENT_WRONG,
        });
    }
};
