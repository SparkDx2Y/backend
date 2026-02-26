import type { ISubscriptionPlan } from "../../models/subscription-plan";
import type { IUserSubscription } from "../../models/user-subscription";

export interface ISubscriptionService {

    createPlan(data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan>;

    updatePlan(id: string, data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan | null>;

    getAllPlans(page?: number, limit?: number): Promise<ISubscriptionPlan[] | { plans: ISubscriptionPlan[], pagination: { page: number, limit: number, total: number, totalPages: number } }>;

    getPlanById(id: string): Promise<ISubscriptionPlan | null>;

    togglePlanStatus(id: string): Promise<ISubscriptionPlan | null>;

    getActivePlans(): Promise<ISubscriptionPlan[]>;

}
