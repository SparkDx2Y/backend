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
    async getPotentialMatches(userId: string): Promise<ProfileResponseDto[]> {
        // 1. Get current user's preferences
        const userProfile = await this._profileRepo.findByUserId(userId);
        if (!userProfile || !userProfile.interestedIn) {
            return []; // Or throw error demanding profile completion
        }

        // 2. Get IDs of users already acted upon (History)
        const historyIds = await this._matchRepo.getUserHistory(userId);

        // Add current user ID to exclusion list
        const excludeIds = [...historyIds, userId];

        // 3. Find profiles matching preference AND NOT in history
        const profiles = await this._profileRepo.findPotentialMatches(excludeIds, userProfile.interestedIn);

        return profiles.map((p: any) => ProfileMapper.toProfileResponse(p));
    }

    // ----------------------------------
    // Swipe Action
    // ----------------------------------
    async swipe(actorId: string, targetId: string, action: 'like' | 'pass'): Promise<{ isMatch: boolean }> {
        // 1. Prevent duplicate actions
        const existing = await this._matchRepo.hasUserActedOn(actorId, targetId);
        if (existing) {
            throw new AppError("Already acted on this user", HTTP_STATUS.CONFLICT);
        }

        // 2. Record the action
        await this._matchRepo.create({
            actorId: actorId as any,
            targetId: targetId as any,
            action
        });

        // 3. Check for Match (only if it's a 'like')
        if (action === 'like') {
            const targetAction = await this._matchRepo.getAction(targetId, actorId);
            if (targetAction && targetAction.action === 'like') {
                // IT'S A MATCH!
                // TODO: Create a 'Match' record in a separate collection for chat purposes later
                return { isMatch: true };
            }
        }

        return { isMatch: false };
    }
}
