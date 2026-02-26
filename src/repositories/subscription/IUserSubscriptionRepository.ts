import type { IUserSubscription } from "../../models/user-subscription";
import type { IBaseRepository } from "../base/IBaseRepository";
import type { Types } from "mongoose";

export interface IUserSubscriptionRepository extends IBaseRepository<IUserSubscription> {

    findActiveByUserId(userId: string | Types.ObjectId): Promise<IUserSubscription | null>;
}
