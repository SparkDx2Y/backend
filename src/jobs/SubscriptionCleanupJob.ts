import cron from 'node-cron';
import { inject, injectable } from 'inversify';
import { DI_TYPES } from '../di/types';
import { IUserSubscriptionRepository } from '../repositories/subscription/IUserSubscriptionRepository';
import { INotificationRepository } from '../repositories/notification/INotificationRepository';
import logger from '../config/logger';

@injectable()
export class SubscriptionCleanupJob {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.USER_SUBSCRIPTION_REPOSITORY)
        private readonly _userSubRepo: IUserSubscriptionRepository,

        @inject(DI_TYPES.REPOSITORIES.NOTIFICATION_REPOSITORY)
        private readonly _notificationRepo: INotificationRepository
    ) {}

    public init() {
        cron.schedule('0 0 * * *', async () => {
            await this.runCleanup();
            await this.runExpiringSoonNotifications();
        });

        this.runCleanup();
        this.runExpiringSoonNotifications();

        logger.info("Subscription Cleanup Job initialized (Running every day at midnight)");
    }

    /**
     * Marks expired subscriptions and sends in-app notifications
     */
    private async runCleanup() {
        try {
            const { count, userIds } = await this._userSubRepo.updateExpiredSubscriptions();

            if (count > 0) {
                logger.info(`Background Job: Successfully expired ${count} subscription(s)`);

               
                const notifications = userIds.map(userId =>
                    this._notificationRepo.create({
                        userId,
                        type: 'subscription_expired',
                    })
                );
                await Promise.all(notifications);
                logger.info(`Background Job: Sent ${count} subscription expiry notification(s)`);
            } else {
                logger.info("Background Job: No subscriptions needed to be expired");
            }
        } catch (error) {
            logger.error("Error in Subscription Cleanup Job:", error);
        }
    }

    /**
     * Sends advance warning notifications for subscriptions expiring within 3 days
     */
    private async runExpiringSoonNotifications() {
        try {
            const expiringSoon = await this._userSubRepo.findExpiringSoon(3);

            if (expiringSoon.length > 0) {
                const notifications = expiringSoon.map(sub =>
                    this._notificationRepo.create({
                        userId: sub.userId.toString(),
                        type: 'subscription_expiring_soon',
                    })
                );
                await Promise.all(notifications);
                logger.info(`Background Job: Sent ${expiringSoon.length} subscription expiring-soon notification(s)`);
            }
        } catch (error) {
            logger.error("Error sending expiring-soon notifications:", error);
        }
    }
}
