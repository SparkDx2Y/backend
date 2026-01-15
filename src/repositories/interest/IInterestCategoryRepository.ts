import { IBaseRepository } from "../base/IBaseRepository";
import { IInterestCategory } from "../../models/interest-category";

export interface IInterestCategoryRepository extends IBaseRepository<IInterestCategory> {

    findByName(name: string): Promise<IInterestCategory | null>;
    setActive(id: string, isActive: boolean): Promise<IInterestCategory | null>;

}
