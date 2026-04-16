import type { MatchActionWithUsersDto } from "../../dto/response/match/match-history.dto";
import type { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";
import type { DateSpotResponseDto } from "../../dto/response/match/date-suggestion.dto";

export interface IMatchService {
    
    getDiscoverProfiles(userId: string): Promise<ProfileResponseDto[]>;

    
    swipe(fromUserId: string, toUserId: string, action: 'like' | 'pass'): Promise<{ isMatch: boolean; matchId?: string }>;

    
    hasUserSwipedOn(fromUserId: string, toUserId: string): Promise<boolean>;

   
    getActivity(userId: string): Promise<{ liked: MatchActionWithUsersDto[]; passed: MatchActionWithUsersDto[]; received: MatchActionWithUsersDto[]; passedBy: MatchActionWithUsersDto[]; viewedYou: MatchActionWithUsersDto[]; }>;
    
    suggestDateSpots(userId: string, matchId: string, type?: string): Promise<DateSpotResponseDto[]>;
}
