import { inject, injectable } from "inversify";
import { IMatchService } from "./IMatchService";
import { DI_TYPES } from "../../di/types";
import { IMatchRepository } from "../../repositories/match/IMatchRepository";
import { IMatchedUsersRepository } from "../../repositories/match/IMatchedUsersRepository";
import { INotificationRepository } from "../../repositories/notification/INotificationRepository";
import { IProfileRepository } from "../../repositories/profile/IProfileRepository";
import { IProfileViewRepository } from "../../repositories/profile-view/IProfileViewRepository";
import { ProfileResponseDto, DiscoverFeedResponseDto } from "../../dto/response/profile/profile-response.dto";
import { ProfileMapper } from "../../mapper/auth/profile.mapper";
import { AppError } from "../../utils/AppError";
import { HTTP_STATUS } from "../../constants/http-status.constants";

import { ISocketService } from "../socket/ISocketService";
import { MatchActionWithUsersDto } from "../../dto/response/match/match-history.dto";
import { NotificationMapper } from "../../mapper/notification/notification.mapper";
import { NotificationResponseDto } from "../../dto/response/notification/notification-response.dto";

import { IUserSubscriptionService } from "../subscription/IUserSubscriptionService";
import { IDateSuggestionService } from "../date-suggestion/IDateSuggestionService";
import { DateSpotResponseDto } from "../../dto/response/match/date-suggestion.dto";
import { MATCH_ERRORS } from "../../constants/errors/match.errors";

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
        private readonly _userSubService: IUserSubscriptionService,
        @inject(DI_TYPES.SERVICES.DATE_SUGGESTION_SERVICE)
        private readonly _dateSuggestionService: IDateSuggestionService
    ) { }

    // ----------------------------------
    // Get Potential Matches (Feed)
    // ----------------------------------
    async getDiscoverProfiles(userId: string): Promise<DiscoverFeedResponseDto> {

        const userProfile = await this._profileRepo.findByUserId(userId);
        if (!userProfile || !userProfile.interestedIn) {
            return {
                profiles: [],
                metadata: {
                    searchedRadius: 0,
                    expandedSearch: false,
                    totalProfilesFound: 0,
                    searchLevel: 0,
                    hasMoreNearbyUsers: false
                }
            };
        }


        const swipedUserIds = await this._matchRepo.getSwipedUserIds(userId);


        const excludeIds = [...swipedUserIds, userId];

        if (!userProfile.location) {
            throw new AppError("User location not found", HTTP_STATUS.BAD_REQUEST);
        }

        const RADIUS_STEPS = [20, 50, 100, 250, 500, 1000, 5000];
        const TARGET_PROFILES = 20;
        
        let allProfiles: any[] = [];
        let expandedSearch = false;
        let searchLevel = 0;
        let searchedRadius = RADIUS_STEPS[0]!;
        let currentExcludeIds = [...excludeIds];

        for (let i = 0; i < RADIUS_STEPS.length; i++) {
            searchLevel = i;
            searchedRadius = RADIUS_STEPS[i]!;
            
            const minDistanceKm = i === 0 ? 0 : RADIUS_STEPS[i - 1]!; 
            const maxDistanceKm = RADIUS_STEPS[i]!;
            const neededProfiles = TARGET_PROFILES - allProfiles.length;

            const profiles = await this._profileRepo.findPotentialMatches({
                excludeUserIds: currentExcludeIds,
                interestedIn: userProfile.interestedIn,
                userGender: userProfile.gender,
                interests: userProfile.interests.map((interest) => interest._id.toString()),
                location: {
                    longitude: userProfile.location.coordinates[0],
                    latitude: userProfile.location.coordinates[1]
                },
                maxDistanceKm,
                minDistanceKm,
                limit: neededProfiles
            });

            allProfiles.push(...profiles);
            currentExcludeIds.push(...profiles.map(p => p.userId._id.toString()));

            if (i > 0 && profiles.length > 0) {
                expandedSearch = true;
            }

            if (allProfiles.length >= TARGET_PROFILES) {
                break;
            }
        }

        const mappedProfiles = allProfiles.map((profile) => ProfileMapper.toProfileResponse(profile));

        return {
            profiles: mappedProfiles,
            metadata: {
                searchedRadius,
                expandedSearch,
                totalProfilesFound: mappedProfiles.length,
                searchLevel,
                hasMoreNearbyUsers: searchLevel === 0 && mappedProfiles.length >= TARGET_PROFILES
            }
        };
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

    // ----------------------------------
    // Get Activity
    // ----------------------------------
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

    // ----------------------------------
    // Suggest Date Spots
    // ----------------------------------

    async suggestDateSpots(userId: string, matchId: string, type: string = 'cafe'): Promise<DateSpotResponseDto[]> {
       
        const limits = await this._userSubService.getUserLimits(userId);
        if (!limits.dateProposalEnabled) {
            throw new AppError("Date recommendations are a premium feature. Upgrade your plan to unlock midway date spots!", HTTP_STATUS.FORBIDDEN);
        }


        const match = await this._matchedUsersRepo.findMatchById(matchId);
        if (!match) {
            throw new AppError(MATCH_ERRORS.MATCH_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        const userIds = match.users.map(u => u._id.toString());
        const profiles = await Promise.all(userIds.map(id => this._profileRepo.findByUserId(id)));

        const [profile1, profile2] = profiles;
        if (!profile1?.location?.coordinates || !profile2?.location?.coordinates) {
            throw new AppError(MATCH_ERRORS.LOCATION_REQUIRED, HTTP_STATUS.BAD_REQUEST);
        }

        return this._dateSuggestionService.getMidpointSuggestions(
            profile1.location.coordinates[1], 
            profile1.location.coordinates[0], 
            profile2.location.coordinates[1], 
            profile2.location.coordinates[0], 
            type 
        );
    }
}


