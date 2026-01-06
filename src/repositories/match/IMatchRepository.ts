import { IBaseRepository } from "../base/IBaseRepository";
import { IMatchAction } from "../../models/match-action";

export interface IMatchRepository extends IBaseRepository<IMatchAction> {
    hasUserActedOn(actorId: string, targetId: string): Promise<boolean>;
    getAction(actorId: string, targetId: string): Promise<IMatchAction | null>;
    getUserHistory(actorId: string): Promise<string[]>; // Returns IDs of people already swiped
}
