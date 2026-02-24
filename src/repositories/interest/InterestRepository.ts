import { Interest, IInterest, IInterestPopulated } from "../../models/interest";
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

    async createInterest(name: string, categoryId: string): Promise<IInterestPopulated> {
        const interest = await this.create({ name, categoryId: new Types.ObjectId(categoryId) });
        return (await interest.populate('categoryId')) as unknown as IInterestPopulated;
    }

    async findActiveByIds(ids: string[]): Promise<IInterestPopulated[]> {
        return this.model.find({ _id: { $in: ids }, isActive: true }).populate('categoryId').exec() as unknown as Promise<IInterestPopulated[]>;
    }


    async setActive(id: string, isActive: boolean): Promise<IInterestPopulated | null> {
        return this.model.findByIdAndUpdate(id, { isActive }, { new: true }).populate('categoryId').exec() as unknown as Promise<IInterestPopulated | null>;
    }

    async findAll(): Promise<IInterestPopulated[]> {
        return this.model.find().populate('categoryId').exec() as unknown as Promise<IInterestPopulated[]>;
    }

    async findById(id: string): Promise<IInterest | null> {
        return this.model.findById(id).populate('categoryId').exec();
    }

    async findByCategoryId(categoryId: string): Promise<IInterestPopulated[]> {
        return this.model.find({ categoryId: new Types.ObjectId(categoryId) }).populate('categoryId').exec() as unknown as Promise<IInterestPopulated[]>;
    }
}