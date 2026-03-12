import cron from 'node-cron';
import { inject, injectable } from 'inversify';
import { DI_TYPES } from '../di/types';
import { IUserSubscriptionRepository } from '../repositories/subscription/IUserSubscriptionRepository';
import logger from '../config/logger';

@injectable()
export class SubscriptionCleanupJob {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.USER_SUBSCRIPTION_REPOSITORY)
        private readonly _userSubRepo: IUserSubscriptionRepository
    ) {}

    /**
     * Initializes the cron job to run every day at midnight
     */
    public init() {
        cron.schedule('0 0 * * *', async () => {
            await this.runCleanup();
        });

        this.runCleanup();
        
        logger.info("Subscription Cleanup Job initialized (Running every day at midnight)");
    }

    private async runCleanup() {
        try {
            const count = await this._userSubRepo.updateExpiredSubscriptions();
            
            if (count > 0) {
                logger.info(`Background Job: Successfully expired ${count} subscription(s)`);
            } else {
                logger.info("Background Job: No subscriptions needed to be expired");
            }
        } catch (error) {
            logger.error("Error in Subscription Cleanup Job:", error);
        }
    }
}
