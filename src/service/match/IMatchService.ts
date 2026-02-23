import { MatchActionWithUsersDto } from "../../dto/response/match/match-history.dto";
import { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";

export interface IMatchService {
    //? Get potential matches for a user (Feed)
    getDiscoverProfiles(userId: string): Promise<ProfileResponseDto[]>;

    //? Perform a swipe action (Swipe)
    swipe(fromUserId: string, toUserId: string, action: 'like' | 'pass'): Promise<{ isMatch: boolean; matchId?: string }>;

    //? Check if a user has already swiped on another user
    hasUserSwipedOn(fromUserId: string, toUserId: string): Promise<boolean>;

    //? Get all swipe actions for a user (Liked, Passed, Received, Passed By)
    getActivity(userId: string): Promise<{ liked: MatchActionWithUsersDto[]; passed: MatchActionWithUsersDto[]; received: MatchActionWithUsersDto[]; passedBy: MatchActionWithUsersDto[]; }>;

}

