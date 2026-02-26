import { inject, injectable } from "inversify";
import { ISubscriptionService } from "./ISubscriptionService";
import { DI_TYPES } from "../../di/types";
import { ISubscriptionRepository } from "../../repositories/subscription/ISubscriptionRepository";
import { IUserSubscriptionRepository } from "../../repositories/subscription/IUserSubscriptionRepository";
import { ISubscriptionPlan } from "../../models/subscription-plan";
import { IUserSubscription } from "../../models/user-subscription";
import { SUBSCRIPTION_ERRORS } from "../../constants/errors/subscription.errors";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { AppError } from "../../utils/AppError";

@injectable()
export class SubscriptionService implements ISubscriptionService {
    constructor(
        @inject(DI_TYPES.REPOSITORIES.SUBSCRIPTION_REPOSITORY) private readonly _planRepo: ISubscriptionRepository
    ) { }

    async createPlan(data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan> {
        const existingPlan = await this._planRepo.findByName(data.name!);
        if (existingPlan) {
            throw new AppError(SUBSCRIPTION_ERRORS.PLAN_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
        }

        return this._planRepo.create(data);
    }

    async updatePlan(id: string, data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan | null> {
        const existingPlan = await this._planRepo.findById(id);
        if (!existingPlan) {
            throw new AppError(SUBSCRIPTION_ERRORS.PLAN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        if (data.name) {
            const planWithSameName = await this._planRepo.findByName(data.name);
            if (planWithSameName && planWithSameName._id.toString() !== id) {
                throw new AppError(SUBSCRIPTION_ERRORS.PLAN_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
            }
        }

        return this._planRepo.updateById(id, data);
    }

    async getAllPlans(page?: number, limit?: number): Promise<ISubscriptionPlan[] | { plans: ISubscriptionPlan[], pagination: { page: number, limit: number, total: number, totalPages: number } }> {
        if (page && limit) {
            const { data, total } = await this._planRepo.findWithPagination(page, limit);
            return {
                plans: data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }
        return this._planRepo.find();
    }

    async getPlanById(id: string): Promise<ISubscriptionPlan | null> {
        return this._planRepo.findById(id);
    }

    async getActivePlans(): Promise<ISubscriptionPlan[]> {
        return this._planRepo.findAllActive();
    }

    async togglePlanStatus(id: string): Promise<ISubscriptionPlan | null> {
        const plan = await this._planRepo.findById(id);
        if (!plan) {
            throw new AppError(SUBSCRIPTION_ERRORS.PLAN_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        return this._planRepo.updateById(id, { isActive: !plan.isActive });
    }

}
