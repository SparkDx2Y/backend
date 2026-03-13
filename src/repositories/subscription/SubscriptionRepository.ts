import { injectable } from "inversify";
import { BaseRepository } from "../base/BaseRepository";
import { ISubscriptionPlan, SubscriptionPlan } from "../../models/subscription-plan";
import { ISubscriptionRepository } from "./ISubscriptionRepository";

@injectable()
export class SubscriptionRepository extends BaseRepository<ISubscriptionPlan> implements ISubscriptionRepository {
    constructor() {
        super(SubscriptionPlan);
    }

    async findAllActive(): Promise<ISubscriptionPlan[]> {
        return this.model.find({ isActive: true }).exec();
    }

    async findByName(name: string): Promise<ISubscriptionPlan | null> {
        return this.model.findOne({ name }).exec();
    }

    async findWithPagination(page: number, limit: number): Promise<{ data: ISubscriptionPlan[], total: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.model.find().skip(skip).limit(limit).exec(),
            this.model.countDocuments().exec()
        ]);
        return { data, total };
    }

    async findDefaultBasePlan(): Promise<ISubscriptionPlan | null> {
        return this.model.findOne({ isDefaultBasePlan: true }).exec();
    }

    async unsetAllDefaultPlans(): Promise<void> {
        await this.model.updateMany({}, { $set: { isDefaultBasePlan: false } }).exec();
    }
}
