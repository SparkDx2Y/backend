import { InterestCategory, IInterestCategory } from "../../models/interest-category";
import { IInterestCategoryRepository } from "./IInterestCategoryRepository";
import { BaseRepository } from "../base/BaseRepository";
import { injectable } from "inversify";

@injectable()
export class InterestCategoryRepository extends BaseRepository<IInterestCategory> implements IInterestCategoryRepository {

    constructor() {
        super(InterestCategory)
    }

    async findByName(name: string): Promise<IInterestCategory | null> {
        return this.findOne({ name })
    }

    async setActive(id: string, isActive: boolean): Promise<IInterestCategory | null> {
        return this.updateById(id, { isActive })
    }

}