import { injectable } from "inversify";
import { BaseRepository } from "../base/BaseRepository";
import { IUserSubscription, UserSubscription } from "../../models/user-subscription";
import { IUserSubscriptionRepository } from "./IUserSubscriptionRepository";
import { Types } from "mongoose";

@injectable()
export class UserSubscriptionRepository extends BaseRepository<IUserSubscription> implements IUserSubscriptionRepository {
    constructor() {
        super(UserSubscription);
    }

    async findActiveByUserId(userId: string | Types.ObjectId): Promise<IUserSubscription | null> {
        return this.model.findOne({
            userId,
            status: "ACTIVE",
            endDate: { $gt: new Date() }
        }).populate('planId').exec();
    }

    async findAllByUserId(userId: string | Types.ObjectId): Promise<IUserSubscription[]> {
        return this.model.find({ userId }).sort({ createdAt: -1 }).populate('planId').exec();
    }

    async expireSubscription(subscriptionId: string | Types.ObjectId): Promise<void> {
        await this.model.findByIdAndUpdate(subscriptionId, { status: "EXPIRED" }).exec();
    }
}
