import { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";

export interface IMatchService {
    getPotentialMatches(userId: string): Promise<ProfileResponseDto[]>;
    swipe(actorId: string, targetId: string, action: 'like' | 'pass'): Promise<{ isMatch: boolean }>;
}
