import { IBaseRepository } from "../base/IBaseRepository";
import { IInterest } from "../../models/interest";



export interface IInterestRepository extends IBaseRepository<IInterest> {
    findByName(name: string): Promise<IInterest | null>;
    createInterest(name: string, categoryId: string): Promise<IInterest>;
    findActiveByIds(ids: string[]): Promise<IInterest[]>;
    findActiveGrouped(): Promise<{ _id: string; categoryName: string; interests: { _id: string; name: string }[] }[]>;
    setActive(id: string, isActive: boolean): Promise<IInterest | null>;
    findAll(): Promise<IInterest[]>;

}