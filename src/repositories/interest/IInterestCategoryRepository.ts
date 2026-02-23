import type { IBaseRepository } from "../base/IBaseRepository";
import type { IInterestCategory } from "../../models/interest-category";

export interface IInterestCategoryRepository extends IBaseRepository<IInterestCategory> {

    findByName(name: string): Promise<IInterestCategory | null>;
    setActive(id: string, isActive: boolean): Promise<IInterestCategory | null>;

}
