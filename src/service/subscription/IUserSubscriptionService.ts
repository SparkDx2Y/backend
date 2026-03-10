import { ISubscriptionFeatures, ISubscriptionPlan } from "../../models/subscription-plan";
import { Types } from "mongoose";

export interface IUserSubscriptionService {
    getUserLimits(userId: string | Types.ObjectId): Promise<ISubscriptionFeatures>;
    getCurrentPlan(userId: string | Types.ObjectId): Promise<ISubscriptionPlan | null>;
}
