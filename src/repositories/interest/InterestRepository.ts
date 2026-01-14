import { Interest, IInterest } from "../../models/interest";
import { Types } from "mongoose";
import { IInterestRepository } from "./IInterestRepository";
import { BaseRepository } from "../base/BaseRepository";
import { injectable } from "inversify";

@injectable()
export class InterestRepository extends BaseRepository<IInterest> implements IInterestRepository {

    constructor() {
        super(Interest)
    }

    async findByName(name: string): Promise<IInterest | null> {
        return this.findOne({ name })
    }

    async createInterest(name: string, categoryId: string): Promise<IInterest> {
        const interest = await this.create({ name, categoryId: new Types.ObjectId(categoryId) });
        return (await interest.populate('categoryId')) as IInterest;
    }

    async findActiveByIds(ids: string[]): Promise<IInterest[]> {
        return this.model.find({ _id: { $in: ids }, isActive: true }).populate('categoryId').exec();
    }


    async setActive(id: string, isActive: boolean): Promise<IInterest | null> {
        return this.model.findByIdAndUpdate(id, { isActive }, { new: true }).populate('categoryId').exec();
    }

    async findAll(): Promise<IInterest[]> {
        return this.model.find().populate('categoryId').exec();
    }

    async findById(id: string): Promise<IInterest | null> {
        return this.model.findById(id).populate('categoryId').exec();
    }
}