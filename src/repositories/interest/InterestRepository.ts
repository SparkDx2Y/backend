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
        return this.create({ name, categoryId: new Types.ObjectId(categoryId) });
    }

    async findActiveByIds(ids: string[]): Promise<IInterest[]> {
        return this.find({ _id: { $in: ids }, isActive: true })
    }

    async findActiveGrouped(): Promise<{ _id: string; categoryName: string; interests: { _id: string; name: string }[] }[]> {
        return this.model.aggregate([
            { $match: { isActive: true } },
            {
                $lookup: {
                    from: "interestcategories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            { $match: { "category.isActive": true } },
            {
                $group: {
                    _id: "$category._id",
                    categoryName: { $first: "$category.name" },
                    interests: {
                        $push: {
                            _id: "$_id",
                            name: "$name",
                        },
                    },
                },
            },
        ]) as any;
    }

    async setActive(id: string, isActive: boolean): Promise<IInterest | null> {
        return this.updateById(id, { isActive })
    }

    async findAll(): Promise<IInterest[]> {
        return this.find()
    }

}