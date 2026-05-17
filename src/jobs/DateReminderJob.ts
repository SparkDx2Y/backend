import cron from 'node-cron';
import { inject, injectable } from 'inversify';
import { DI_TYPES } from '../di/types';
import { IMessageRepository } from '../repositories/message/IMessageRepository';
import { IMatchedUsersRepository } from '../repositories/match/IMatchedUsersRepository';
import { ISocketService } from '../service/socket/ISocketService';
import { INotificationRepository } from '../repositories/notification/INotificationRepository';
import { NotificationMapper } from '../mapper/notification/notification.mapper';
import { MessageMapper } from '../mapper/message/message.mapper';
import logger from '../config/logger';

@injectable()
export class DateReminderJob {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.MESSAGE_REPOSITORY)
        private readonly _messageRepo: IMessageRepository,

        @inject(DI_TYPES.REPOSITORIES.MATCHED_USERS_REPOSITORY)
        private readonly _matchRepo: IMatchedUsersRepository,

        @inject(DI_TYPES.REPOSITORIES.NOTIFICATION_REPOSITORY)
        private readonly _notificationRepo: INotificationRepository,

        @inject(DI_TYPES.SERVICES.SOCKET_SERVICE)
        private readonly _socketService: ISocketService
    ) {}

    public init() {
        cron.schedule('* * * * *', async () => {
            await this.runReminder();
        });

        logger.info("Date Reminder Job initialized (Running every minute)");
    }

    private async runReminder() {
        try {
            const now = new Date();
            now.setSeconds(0, 0);

            const startTarget = new Date(now.getTime() + 60 * 60 * 1000); 
            const endTarget = new Date(startTarget.getTime() + 60 * 1000); 

            const upcomingDates = await this._messageRepo.findMessagesForReminder(startTarget, endTarget);

            if (upcomingDates.length > 0) {
                logger.info(`Background Job: Found ${upcomingDates.length} date(s) starting in 1 hour. Triggering reminders...`);

                for (const msg of upcomingDates) {
                    const match = await this._matchRepo.findMatchById(msg.matchId.toString());
                    
                    if (match) {
                        const messageDto = MessageMapper.toMessageResponse(msg);
                        
                        match.users.forEach(user => {
                            const otherUser = match.users.find(u => u._id.toString() !== user._id.toString());
                            
                            this._notificationRepo.create({
                                userId: user._id.toString(),
                                type: 'date_reminder',
                                fromUserId: otherUser?._id.toString(),
                                matchId: match._id.toString(),
                            }).then(dbNotification => {
                                this._socketService.sendNotification(user._id.toString(), {
                                    type: 'date_reminder',
                                    message: 'Your date is rapidly approaching!',
                                    data: NotificationMapper.toResponse(dbNotification)
                                });
                            }).catch(e => logger.error('Failed to create date_reminder DB notification', e));

                            // Send Socket Event
                            this._socketService.sendMessage(user._id.toString(), {
                                type: 'date_reminder_1hr',
                                matchId: msg.matchId.toString(),
                                message: messageDto,
                                partnerName: otherUser ? otherUser.name : 'your match'
                            });
                        });
                    }
                }
            }
        } catch (error) {
            logger.error("Error in Date Reminder Job:", error);
        }
    }
}
