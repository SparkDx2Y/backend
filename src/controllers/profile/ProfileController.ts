import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/responseHelper";
import { COMMON_MESSAGES } from "../../constants/common.messages";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IProfileService } from "../../service/profile/IProfileService";
import { IAuthService } from "../../service/auth/IAuthService";
import { IMatchService } from "../../service/match/IMatchService";


import { completeProfileSchema } from "../../dto/request/profile/complete-profile.dto";
import { updateProfileSchema } from "../../dto/request/profile/update-profile.dto";
import { updateInterestsSchema } from "../../dto/request/profile/update-interests.dto";
import { IInterestService } from "../../service/interest/IInterestService";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";
import { updateLocationSchema } from "../../dto/request/profile/update-location.dto";
import { setAuthCookies } from "../../utils/cookieHelper";

@injectable()
export class ProfileController {

    constructor(
        @inject(DI_TYPES.SERVICES.PROFILE_SERVICE) private readonly _profileService: IProfileService,
        @inject(DI_TYPES.SERVICES.INTEREST_SERVICE) private readonly _interestService: IInterestService,
        @inject(DI_TYPES.SERVICES.AUTH_SERVICE) private readonly _authService: IAuthService,
        @inject(DI_TYPES.SERVICES.MATCH_SERVICE) private readonly _matchService: IMatchService
    ) { }


    // ----------------------------------
    // Complete profile (onboarding)
    // ----------------------------------
    completeProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const userId = req.user.id;
            const userRole = req.user.role;
            //  BLOCK ADMINS FROM PROFILE FLOW
            if (userRole === "admin") {
                return sendResponse(res, HTTP_STATUS.FORBIDDEN, "Admins do not have profiles");
            }

            const data = completeProfileSchema.parse(req.body);

            // Complete profile
            const { profile, isCompleted } = await this._profileService.completeProfile(userId, data);

            // If profile is NOT completed yet
            if (!isCompleted) {
                return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.PROFILE_PARTIAL, { isCompleted: false, profile });
            }

            // Profile completed → issue auth tokens
            const { accessToken, refreshToken } = await this._authService.generateTokens(userId, userRole);

            // Set auth cookies
            setAuthCookies(res, accessToken, refreshToken);
            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.PROFILE_COMPLETED, { isCompleted, profile });

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
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }
            const userId = req.user.id;

            const profile = await this._profileService.getProfileByUserId(userId);

            if (!profile) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Profile not found");
            }
            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FETCHED_SUCCESSFULLY, profile);

        } catch (error) {
            next(error)
        }
    };

    // ----------------------------------
    // Update my profile (settings)
    // ----------------------------------
    updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                // return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const data = updateProfileSchema.parse(req.body);
            const updatedProfile = await this._profileService.updateProfile(req.user.id, data);

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.PROFILE_UPDATED, { profile: updatedProfile });
        } catch (error) {
            next(error);
        }
    };

    getInterests = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const interests = await this._interestService.getActiveInterests();
            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FETCHED_SUCCESSFULLY, interests);
        } catch (error) {
            next(error);
        }
    };

    // ----------------------------------
    // Update user interests
    // ----------------------------------
    updateInterests = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const { interests } = updateInterestsSchema.parse(req.body);
            const updatedProfile = await this._profileService.updateInterests(req.user.id, interests);

            // Re-issue tokens
            const { accessToken, refreshToken } = await this._authService.generateTokens(req.user.id, req.user.role);

            setAuthCookies(res, accessToken, refreshToken);

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.INTERESTS_UPDATED, { isInterestsSelected: true, profile: updatedProfile });
        } catch (error) {
            next(error);
        }
    };

    // ----------------------------------
    // Update user location
    // ----------------------------------
    updateLocation = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const { latitude, longitude } = updateLocationSchema.parse(req.body);
            await this._profileService.updateLocation(req.user.id, latitude, longitude);

            // Re-issue tokens
            const { accessToken, refreshToken } = await this._authService.generateTokens(req.user.id, req.user.role);

            setAuthCookies(res, accessToken, refreshToken);

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.LOCATION_UPDATED, { isLocationCompleted: true });
        } catch (error) {
            next(error);
        }
    };

    // ----------------------------------
    // Get public profile (for preview)
    // ----------------------------------
    getPublicProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params;

            if (!userId) {
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, "User ID is required");
            }

            const profile = await this._profileService.getProfileByUserId(userId);


            if (!profile) {
                return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Profile not found");
            }

            // CHECK IF AUTHENTICATED USER HAS ALREADY SWIPED ON THIS PROFILE
            if (req.user) {
                profile.hasSwiped = await this._matchService.hasUserSwipedOn(req.user.id, userId);
            }

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FETCHED_SUCCESSFULLY, profile);

        } catch (error) {
            next(error)
        }
    };
}

