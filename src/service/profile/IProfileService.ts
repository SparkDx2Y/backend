import type { CompleteProfileDto } from "../../dto/request/profile/complete-profile.dto";
import type { UpdateProfileDto } from "../../dto/request/profile/update-profile.dto";
import type { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";

export interface IProfileService {
    completeProfile(userId: string, data: CompleteProfileDto): Promise<{ profile: ProfileResponseDto, isCompleted: boolean }>;

    getProfileByUserId(userId: string): Promise<ProfileResponseDto | null>;

    isProfileCompleted(userId: string): Promise<boolean>;
    isInterestsSelected(userId: string): Promise<boolean>;

    updateProfile(userId: string, data: UpdateProfileDto): Promise<ProfileResponseDto>;
    updateInterests(userId: string, interestIds: string[]): Promise<ProfileResponseDto>;

    updateLocation(userId: string, latitude: number, longitude: number): Promise<void>;
    isLocationCompleted(userId: string): Promise<boolean>;
}