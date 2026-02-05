import { inject, injectable } from "inversify";
import { IMatchService } from "./IMatchService";
import { DI_TYPES } from "../../di/types";
import { IMatchRepository } from "../../repositories/match/IMatchRepository";
import { IMatchedUsersRepository } from "../../repositories/match/IMatchedUsersRepository";
import { INotificationRepository } from "../../repositories/notification/INotificationRepository";
import { IProfileRepository } from "../../repositories/profile/IProfileRepository";
import { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";
import { ProfileMapper } from "../../mapper/auth/profile.mapper";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/http-status.constants";

import { ISocketService } from "../socket/ISocketService";

@injectable()
export class MatchService implements IMatchService {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.MATCH_REPOSITORY)
        private readonly _matchRepo: IMatchRepository,
        @inject(DI_TYPES.REPOSITORIES.MATCHED_USERS_REPOSITORY)
        private readonly _matchedUsersRepo: IMatchedUsersRepository,
        @inject(DI_TYPES.REPOSITORIES.NOTIFICATION_REPOSITORY)
        private readonly _notificationRepo: INotificationRepository,
        @inject(DI_TYPES.REPOSITORIES.PROFILE_REPOSITORY)
        private readonly _profileRepo: IProfileRepository,
        @inject(DI_TYPES.SERVICES.SOCKET_SERVICE)
        private readonly _socketService: ISocketService
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
    async swipe(fromUserId: string, toUserId: string, action: 'like' | 'pass'): Promise<{ isMatch: boolean; matchId?: string }> {

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

        // 3. If it's a LIKE, create notification for the person being liked
        if (action === 'like') {
            const notification = await this._notificationRepo.create({
                userId: toUserId,
                type: 'like',
                fromUserId: fromUserId
            });

            // EMIT REAL-TIME NOTIFICATION
            this._socketService.sendNotification(toUserId, {
                type: 'like',
                message: 'Someone liked you!',
                data: notification
            });

            // 4. Check for mutual match
            const targetAction = await this._matchRepo.getAction(toUserId, fromUserId);

            // 4.1. If target user also liked back, create Match and notifications
            if (targetAction && targetAction.action === 'like') {
                // Prevent duplicate match record creation
                const alreadyMatched = await this._matchedUsersRepo.hasMatch(fromUserId, toUserId);
                if (alreadyMatched) {
                    return { isMatch: true }; // Already matched, just return success
                }

                // Create Match record
                const match = await this._matchedUsersRepo.createMatch([fromUserId, toUserId]);


                // Create match notifications for BOTH users
                const matchNotification1 = await this._notificationRepo.create({
                    userId: toUserId,
                    type: 'match',
                    fromUserId: fromUserId,
                    matchId: match._id.toString()
                });

                const matchNotification2 = await this._notificationRepo.create({
                    userId: fromUserId,
                    type: 'match',
                    fromUserId: toUserId,
                    matchId: match._id.toString()
                });

                // EMIT REAL-TIME MATCH NOTIFICATIONS TO BOTH USERS
                this._socketService.sendMatch(toUserId, {
                    type: 'match',
                    message: "It's a Match!",
                    matchId: match._id.toString(),
                    data: matchNotification1
                });

                this._socketService.sendMatch(fromUserId, {
                    type: 'match',
                    message: "It's a Match!",
                    matchId: match._id.toString(),
                    data: matchNotification2
                });

                return { isMatch: true, matchId: match._id.toString() };
            }
        }

        return { isMatch: false };
    }

    async hasUserSwipedOn(fromUserId: string, toUserId: string): Promise<boolean> {
        return this._matchRepo.hasUserAlreadySwiped(fromUserId, toUserId);
    }
}


