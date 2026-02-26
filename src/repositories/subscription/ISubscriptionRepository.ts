import type { ISubscriptionPlan } from "../../models/subscription-plan";
import type { IBaseRepository } from "../base/IBaseRepository";

export interface ISubscriptionRepository extends IBaseRepository<ISubscriptionPlan> {
    findAllActive(): Promise<ISubscriptionPlan[]>;

    findByName(name: string): Promise<ISubscriptionPlan | null>;
    
    findWithPagination(page: number, limit: number): Promise<{ data: ISubscriptionPlan[], total: number }>;
}
