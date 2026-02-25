import type { IBaseRepository } from "../base/IBaseRepository";
import type { IInterest, IInterestPopulated } from "../../models/interest";



export interface IInterestRepository extends IBaseRepository<IInterest> {
    findByName(name: string): Promise<IInterest | null>;
    createInterest(name: string, categoryId: string): Promise<IInterestPopulated>;
    findActiveByIds(ids: string[]): Promise<IInterestPopulated[]>;
    setActive(id: string, isActive: boolean): Promise<IInterestPopulated | null>;
    findAll(): Promise<IInterestPopulated[]>;
    findByCategoryId(categoryId: string): Promise<IInterestPopulated[]>;

}