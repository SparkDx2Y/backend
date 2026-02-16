import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/responseHelper";
import { HTTP_STATUS } from "../constants/http-status.constants";
import { COMMON_ERRORS } from "../constants/errors/common.erros";

/**
 * Guard to ensure the user has completed all onboarding steps:
 * 1. Profile Completion (Basic Info)
 * 2. Interest Selection
 * 3. Location Setup
 * 
 * This uses the JWT Token Payload (req.user).
 */
export const onboardingGuard = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
        }

        // Admin doesn't need onboarding
        if (req.user.role !== 'user') {
            return next();
        }

        // 1. Check Profile
        if (!req.user.isProfileCompleted) {
            return sendResponse(res, HTTP_STATUS.FORBIDDEN, "Profile not completed. Please complete your profile basics first.", { code: "PROFILE_INCOMPLETE" });
        }

        // 2. Check Interests
        if (!req.user.isInterestsSelected) {
            return sendResponse(res, HTTP_STATUS.FORBIDDEN, "Interests not selected. Please select your interests.", { code: "INTERESTS_PENDING" });
        }

        // 3. Check Location
        if (!req.user.isLocationCompleted) {
            return sendResponse(res, HTTP_STATUS.FORBIDDEN, "Location not set. Please enable location services.", { code: "LOCATION_PENDING" });
        }

        next();
    } catch (error) {
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, COMMON_ERRORS.SOMETHING_WENT_WRONG);
    }
};
