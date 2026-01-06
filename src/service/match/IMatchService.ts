import { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";

export interface IMatchService {
    //? Get potential matches for a user (Feed)
    getDiscoverProfiles(userId: string): Promise<ProfileResponseDto[]>;
    
    //? Perform a swipe action (Swipe)
    swipe(fromUserId: string, toUserId: string, action: 'like' | 'pass'): Promise<{ isMatch: boolean }>;
}
