import { inject, injectable } from "inversify";
import { IMatchService } from "./IMatchService";
import { DI_TYPES } from "../../di/types";
import { IMatchRepository } from "../../repositories/match/IMatchRepository";
import { IProfileRepository } from "../../repositories/profile/IProfileRepository";
import { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";
import { ProfileMapper } from "../../mapper/auth/profile.mapper";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/http-status.constants";

@injectable()
export class MatchService implements IMatchService {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.MATCH_REPOSITORY)
        private readonly _matchRepo: IMatchRepository,
        @inject(DI_TYPES.REPOSITORIES.PROFILE_REPOSITORY)
        private readonly _profileRepo: IProfileRepository
    ) { }

    // ----------------------------------
    // Get Potential Matches (Feed)
    // ----------------------------------
    async getDiscoverProfiles(userId: string): Promise<ProfileResponseDto[]> {
        // 1. Get current user's preferences
        const userProfile = await this._profileRepo.findByUserId(userId);
        if (!userProfile || !userProfile.interestedIn) {
            return [];
        }

        // 2. Get IDs of users already acted upon (History)
        const swipedUserIds = await this._matchRepo.getSwipedUserIds(userId);

        // Doing this to exclude current user from potential matches
        const excludeIds = [...swipedUserIds, userId];

        const MAX_DISTANCE_KM = 20;

        if (!userProfile.location) {
            throw new AppError("User location not found", HTTP_STATUS.BAD_REQUEST);
        }

        // 3. Find profiles matching preference AND sharing interests
        const profiles = await this._profileRepo.findPotentialMatches({
            excludeUserIds: excludeIds,
            interestedIn: userProfile.interestedIn,
            userGender: userProfile.gender,
            interests: userProfile.interests.map((interest: any) => interest._id ? interest._id.toString() : interest.toString()),
            location: {
                longitude: userProfile.location.coordinates[0],
                latitude: userProfile.location.coordinates[1]
            },
            maxDistanceKm: MAX_DISTANCE_KM
        });

        return profiles.map((profile) => ProfileMapper.toProfileResponse(profile));
    }

    // ----------------------------------
    // Swipe Action
    // ----------------------------------
    async swipe(fromUserId: string, toUserId: string, action: 'like' | 'pass'): Promise<{ isMatch: boolean }> {

        // 1. Prevent duplicate swipe action
        const existing = await this._matchRepo.hasUserAlreadySwiped(fromUserId, toUserId);

        if (existing) {
            throw new AppError("You have already swiped on this user", HTTP_STATUS.CONFLICT);
        }

        // 2. Save swipe action
        await this._matchRepo.createSwipe({
            fromUserId,
            toUserId,
            action
        });

        // 3. Check for Match (only if it's a 'like')
        if (action === 'like') {
            const targetAction = await this._matchRepo.getAction(toUserId, fromUserId);

            // 3.1. Check if target user also liked back. If so, it's a match!
            if (targetAction && targetAction.action === 'like') {
                return { isMatch: true };
            }
        }

        return { isMatch: false };
    }
}
