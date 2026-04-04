import { inject, injectable } from "inversify";
import { IProfileViewService } from "./IProfileViewService";
import { DI_TYPES } from "../../di/types";
import { IProfileViewRepository } from "../../repositories/profile-view/IProfileViewRepository";
import { INotificationRepository } from "../../repositories/notification/INotificationRepository";
import { ISocketService } from "../../service/socket/ISocketService";
import { NotificationMapper } from "../../mapper/notification/notification.mapper";
import logger from "../../config/logger";
import { IUserSubscriptionService } from "../subscription/IUserSubscriptionService";

@injectable()
export class ProfileViewService implements IProfileViewService {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.PROFILE_VIEW_REPOSITORY)
        private readonly _profileViewRepo: IProfileViewRepository,
        @inject(DI_TYPES.REPOSITORIES.NOTIFICATION_REPOSITORY)
        private readonly _notificationRepo: INotificationRepository,
        @inject(DI_TYPES.SERVICES.SOCKET_SERVICE)
        private readonly _socketService: ISocketService,
        @inject(DI_TYPES.SERVICES.USER_SUBSCRIPTION_SERVICE)
        private readonly _userSubService: IUserSubscriptionService
    ) { }

    async recordView(viewerId: string, viewedId: string): Promise<void> {
        if (viewerId === viewedId) return;

        try {
            const { isNewView } = await this._profileViewRepo.upsertView(viewerId, viewedId);

            if (isNewView) {
               
                await this._notificationRepo.create({
                    userId: viewedId,
                    fromUserId: viewerId,
                    type: 'profile_view'
                });


                const populatedNotifs = await this._notificationRepo.findByUserId(viewedId, 1);
                const latestNotif = populatedNotifs[0];

                if (latestNotif) {
                    const responseDto = NotificationMapper.toResponse(latestNotif);

                    
                    const limits = await this._userSubService.getUserLimits(viewedId);

                    if (!limits.seeWhoViewedProfile) {
                        
                        responseDto.fromUser = {
                            userId: "hidden",
                            name: "Hidden User",
                            profilePhoto: undefined,
                        };

                        this._socketService.sendNotification(viewedId, {
                            type: 'profile_view',
                            message: `Someone viewed your profile. Upgrade to premium to see who it is!`,
                            data: responseDto
                        });
                    } else {
                        
                        this._socketService.sendNotification(viewedId, {
                            type: 'profile_view',
                            message: `${responseDto.fromUser?.name} viewed your profile`,
                            data: responseDto
                        });
                    }
                }
            }
        } catch (error) {
            logger.error("Error recording profile view:", error);
        }
    }
}
