import type { ISubscriptionPlan } from "../../models/subscription-plan";


export interface ISubscriptionService {

    createPlan(data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan>;

    updatePlan(id: string, data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan | null>;

    getAllPlans(page?: number, limit?: number): Promise<ISubscriptionPlan[] | { plans: ISubscriptionPlan[], pagination: { page: number, limit: number, total: number, totalPages: number } }>;

    getPlanById(id: string): Promise<ISubscriptionPlan | null>;

    togglePlanStatus(id: string): Promise<ISubscriptionPlan | null>;

    getDefaultBasePlan(): Promise<ISubscriptionPlan | null>;

    getActivePlans(): Promise<ISubscriptionPlan[]>;

}
