import { inject, injectable } from "inversify";
import { IMatchService } from "./IMatchService";
import { DI_TYPES } from "../../di/types";
import { IMatchRepository } from "../../repositories/match/IMatchRepository";
import { IMatchedUsersRepository } from "../../repositories/match/IMatchedUsersRepository";
import { INotificationRepository } from "../../repositories/notification/INotificationRepository";
import { IProfileRepository } from "../../repositories/profile/IProfileRepository";
import { IProfileViewRepository } from "../../repositories/profile-view/IProfileViewRepository";
import { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";
import { ProfileMapper } from "../../mapper/auth/profile.mapper";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/http-status.constants";

import { ISocketService } from "../socket/ISocketService";
import { MatchActionWithUsersDto } from "../../dto/response/match/match-history.dto";
import { NotificationMapper } from "../../mapper/notification/notification.mapper";
import { NotificationResponseDto } from "../../dto/response/notification/notification-response.dto";

import { IUserSubscriptionService } from "../subscription/IUserSubscriptionService";

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
        @inject(DI_TYPES.REPOSITORIES.PROFILE_VIEW_REPOSITORY)
        private readonly _profileViewRepo: IProfileViewRepository,
        @inject(DI_TYPES.SERVICES.SOCKET_SERVICE)
        private readonly _socketService: ISocketService,
        @inject(DI_TYPES.SERVICES.USER_SUBSCRIPTION_SERVICE)
        private readonly _userSubService: IUserSubscriptionService
    ) { }

    // ----------------------------------
    // Get Potential Matches (Feed)
    // ----------------------------------
    async getDiscoverProfiles(userId: string): Promise<ProfileResponseDto[]> {

        const userProfile = await this._profileRepo.findByUserId(userId);
        if (!userProfile || !userProfile.interestedIn) {
            return [];
        }


        const swipedUserIds = await this._matchRepo.getSwipedUserIds(userId);


        const excludeIds = [...swipedUserIds, userId];

        const MAX_DISTANCE_KM = 20;

        if (!userProfile.location) {
            throw new AppError("User location not found", HTTP_STATUS.BAD_REQUEST);
        }


        const profiles = await this._profileRepo.findPotentialMatches({
            excludeUserIds: excludeIds,
            interestedIn: userProfile.interestedIn,
            userGender: userProfile.gender,
            interests: userProfile.interests.map((interest) => interest._id.toString()),
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

        const existing = await this._matchRepo.hasUserAlreadySwiped(fromUserId, toUserId);

        if (existing) {
            throw new AppError("You have already swiped on this user", HTTP_STATUS.CONFLICT);
        }

        if (action === 'like') {
            const limits = await this._userSubService.getUserLimits(fromUserId);
            if (limits.swipeLimit !== -1) {
                const todaySwipes = await this._matchRepo.getTodaySwipeCount(fromUserId, 'like');
                if (todaySwipes >= limits.swipeLimit) {
                    throw new AppError("Daily swipe limit reached. Upgrade for unlimited swipes!", HTTP_STATUS.FORBIDDEN);
                }
            }
        }


        await this._matchRepo.createSwipe({
            fromUserId,
            toUserId,
            action
        });


        if (action === 'like') {
            const notification = await this._notificationRepo.create({
                userId: toUserId,
                type: 'like',
                fromUserId: fromUserId
            });


            const dto = NotificationMapper.toResponse(notification);
            const targetLimits = await this._userSubService.getUserLimits(toUserId);

            if (!targetLimits.seeWhoLikedYou) {
                dto.fromUser = { userId: "hidden", name: "Hidden User", profilePhoto: undefined };
                (dto as NotificationResponseDto & { isPremiumLocked?: boolean }).isPremiumLocked = true;
            }

            this._socketService.sendNotification(toUserId, {
                type: 'like',
                message: !targetLimits.seeWhoLikedYou ? 'Someone liked you! Upgrade to premium to see who it is!' : 'Someone liked you!',
                data: dto
            });


            const targetAction = await this._matchRepo.getAction(toUserId, fromUserId);


            if (targetAction && targetAction.action === 'like') {

                const alreadyMatched = await this._matchedUsersRepo.hasMatch(fromUserId, toUserId);
                if (alreadyMatched) {
                    return { isMatch: true };
                }


                const match = await this._matchedUsersRepo.createMatch([fromUserId, toUserId]);



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


                this._socketService.sendMatch(toUserId, {
                    type: 'match',
                    message: "It's a Match!",
                    matchId: match._id.toString(),
                    data: NotificationMapper.toResponse(matchNotification1)
                });

                this._socketService.sendMatch(fromUserId, {
                    type: 'match',
                    message: "It's a Match!",
                    matchId: match._id.toString(),
                    data: NotificationMapper.toResponse(matchNotification2)
                });

                return { isMatch: true, matchId: match._id.toString() };
            }
        }

        return { isMatch: false };
    }

    async hasUserSwipedOn(fromUserId: string, toUserId: string): Promise<boolean> {
        return this._matchRepo.hasUserAlreadySwiped(fromUserId, toUserId);
    }

    async getActivity(userId: string): Promise<{ liked: MatchActionWithUsersDto[]; passed: MatchActionWithUsersDto[]; received: MatchActionWithUsersDto[]; passedBy: MatchActionWithUsersDto[]; viewedYou: MatchActionWithUsersDto[]; }> {

        const limits = await this._userSubService.getUserLimits(userId);

        const liked = await this._matchRepo.getActions({
            fromUserId: userId,
            action: 'like'
        });

        const passed = await this._matchRepo.getActions({
            fromUserId: userId,
            action: 'pass'
        });

        let received: MatchActionWithUsersDto[] = [];
        if (limits.seeWhoLikedYou) {
            received = await this._matchRepo.getActions({
                toUserId: userId,
                action: 'like'
            });
        }

        const passedBy = await this._matchRepo.getActions({
            toUserId: userId,
            action: 'pass'
        });

        let viewedYou: MatchActionWithUsersDto[] = [];
        if (limits.seeWhoViewedProfile) {
            viewedYou = await this._profileViewRepo.getViewsWithUsers(userId, 50);
        }

        return {
            liked,
            passed,
            received,
            passedBy,
            viewedYou
        };
    }


}


