import type { ISubscriptionFeatures, ISubscriptionPlan } from "../../models/subscription-plan";
import type { Types } from "mongoose";

export interface IUserSubscriptionService {
    getUserLimits(userId: string | Types.ObjectId): Promise<ISubscriptionFeatures>;
    getCurrentPlan(userId: string | Types.ObjectId): Promise<{ plan: ISubscriptionPlan | null, subscription?: { endDate: Date, status: string } }>;
}
