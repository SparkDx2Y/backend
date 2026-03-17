import type { Request, Response, NextFunction } from "express";
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

        if (req.user.role !== 'user') {
            return next();
        }


        if (!req.user.isProfileCompleted) {
            return sendResponse(res, HTTP_STATUS.FORBIDDEN, COMMON_ERRORS.PROFILE_INCOMPLETE, { code: "PROFILE_INCOMPLETE" });
        }


        if (!req.user.isInterestsSelected) {
            return sendResponse(res, HTTP_STATUS.FORBIDDEN, COMMON_ERRORS.INTERESTS_PENDING, { code: "INTERESTS_PENDING" });
        }


        if (!req.user.isLocationCompleted) {
            return sendResponse(res, HTTP_STATUS.FORBIDDEN, COMMON_ERRORS.LOCATION_PENDING, { code: "LOCATION_PENDING" });
        }

        next();
    } catch {
        return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, COMMON_ERRORS.SOMETHING_WENT_WRONG);
    }
};
