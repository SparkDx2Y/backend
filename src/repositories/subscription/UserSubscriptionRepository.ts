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

    async updateExpiredSubscriptions(): Promise<{ count: number; userIds: string[] }> {
        
        const toExpire = await this.model.find({
            status: "ACTIVE",
            endDate: { $lt: new Date() }
        }).select('userId').lean().exec();

        if (toExpire.length === 0) return { count: 0, userIds: [] };

        const userIds = toExpire.map(s => s.userId.toString());

        
        await this.model.updateMany(
            { status: "ACTIVE", endDate: { $lt: new Date() } },
            { $set: { status: "EXPIRED" } }
        ).exec();

        return { count: toExpire.length, userIds };
    }

    async findExpiringSoon(days: number): Promise<IUserSubscription[]> {
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + days);

        return this.model.find({
            status: "ACTIVE",
            endDate: { $gte: now, $lte: future }
        }).select('userId endDate').lean().exec() as unknown as Promise<IUserSubscription[]>;
    }
}
