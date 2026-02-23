import type { IMatchAction } from "../../models/match-action";
import type { MatchActionWithUsersDto } from "../../dto/response/match/match-history.dto";

export interface IMatchRepository {

    createSwipe(data: { fromUserId: string; toUserId: string; action: 'like' | 'pass' }): Promise<IMatchAction>;

    //? Check if user has already swiped on another user (Swipe)
    hasUserAlreadySwiped(fromUserId: string, toUserId: string): Promise<boolean>;

    //? Get action of a specific user on another user for match checking (Match detection)
    getAction(fromUserId: string, toUserId: string): Promise<IMatchAction | null>;

    //? Get IDs of users swiped by a specific user for showing in feed who must be excluded from potential matches.
    getSwipedUserIds(fromUserId: string): Promise<string[]>;

    //? Get all swipe actions for a user (Liked, Passed, Received, Passed By)
    getActions(filter: { fromUserId?: string; toUserId?: string; action?: 'like' | 'pass'; }): Promise<MatchActionWithUsersDto[]>;


}
