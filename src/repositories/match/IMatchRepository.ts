import { IBaseRepository } from "../base/IBaseRepository";
import { IMatchAction } from "../../models/match-action";

export interface IMatchRepository extends IBaseRepository<IMatchAction> {

    //? Check if user has already swiped on another user (Swipe)
    hasUserAlreadySwiped(fromUserId: string, toUserId: string): Promise<boolean>;
    
    //? Get action of a specific user on another user for match checking (Match detection)
    getAction(fromUserId: string, toUserId: string): Promise<IMatchAction | null>;
    
    //? Get IDs of users swiped by a specific user for showing in feed who must be excluded from potential matches.
    getSwipedUserIds(fromUserId: string): Promise<string[]>; 

}
