import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { Types } from "mongoose";
import { IUserSubscriptionService } from "./IUserSubscriptionService";
import { IUserSubscriptionRepository } from "../../repositories/subscription/IUserSubscriptionRepository";
import { ISubscriptionRepository } from "../../repositories/subscription/ISubscriptionRepository";
import { ISubscriptionFeatures, ISubscriptionPlan } from "../../models/subscription-plan";

@injectable()
export class UserSubscriptionService implements IUserSubscriptionService {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.USER_SUBSCRIPTION_REPOSITORY) private readonly _userSubRepo: IUserSubscriptionRepository,
        @inject(DI_TYPES.REPOSITORIES.SUBSCRIPTION_REPOSITORY) private readonly _planRepo: ISubscriptionRepository
    ) { }

    async getUserLimits(userId: string | Types.ObjectId): Promise<ISubscriptionFeatures> {
        const activeSubscription = await this._userSubRepo.findActiveByUserId(userId);

        if (activeSubscription && activeSubscription.planId) {
            const plan = activeSubscription.planId as unknown as ISubscriptionPlan;
            return plan.features;
        }

        const defaultPlan = await this._planRepo.findDefaultBasePlan();

        if (defaultPlan) {
            return defaultPlan.features;
        }

        return {
            seeWhoLikedYou: false,
            seeWhoViewedProfile: false,
            chatEnabled: false,
            dailyMessageLimit: 0,
            mediaSharingEnabled: false,
            audioEnabled: false,
            videoCallEnabled: false,
            swipeLimit: 0
        };
    }

    async getCurrentPlan(userId: string | Types.ObjectId): Promise<ISubscriptionPlan | null> {
        const activeSubscription = await this._userSubRepo.findActiveByUserId(userId);

        if (activeSubscription && activeSubscription.planId) {
            return activeSubscription.planId as unknown as ISubscriptionPlan;
        }

        return this._planRepo.findDefaultBasePlan();
    }
}
