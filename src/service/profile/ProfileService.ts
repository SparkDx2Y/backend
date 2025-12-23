import { inject, injectable } from "inversify";
import { IProfileService } from "./IProfileService";
import { DI_TYPES } from "../../di/types";
import { IProfileRepository } from "../../repositories/profile/IProfileRepository";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { CompleteProfileDto } from "../../dto/request/profile/complete-profile.dto";
import { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";
import { ProfileMapper } from "../../mapper/auth/profile.mapper";
import { ProfileCompletionCheckDto } from "../../dto/internal/profile-completion-check.dto";




@injectable()
export class ProfileService implements IProfileService {

    constructor(
        @inject(DI_TYPES.REPOSITORIES.PROFILE_REPOSITORY)
        private readonly _profileRepo: IProfileRepository,
        @inject(DI_TYPES.REPOSITORIES.USER_REPOSITORY)
        private readonly _userRepo: IUserRepository
    ) { }

    /**
     * Complete user profile
     * Note: Frontend validation ensures ALL fields are required,
     * so this always creates a complete profile (never partial updates)
     */
    async completeProfile(userId: string, data: CompleteProfileDto): Promise<{ profile: ProfileResponseDto, isCompleted: boolean }> {
        // 1. Verify user exists and is verified
        const user = await this._userRepo.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (!user.isVerified) {
            throw new Error("User is not verified. Please verify your email first.");
        }

        // 2. Check if profile already exists (prevent duplicate creation)
        const existingProfile = await this._profileRepo.findByUserId(userId);
        if (existingProfile) {
            throw new Error("Profile already exists. Please contact support.");
        }

        // 3. Create new profile (all fields required by frontend validation)
        const profile = await this._profileRepo.create({
            userId: userId as any,  // Repository handles ObjectId conversion
            ...data
        } as any);

        if (!profile) {
            throw new Error("Failed to create profile");
        }

        // 4. Verify profile is complete (should always be true due to frontend validation)
        const isCompleted = this.checkProfileCompletion(profile);

        return {
            profile: ProfileMapper.toProfileResponse(profile),
            isCompleted
        }
    }

    // get profile by user id
    async getProfileByUserId(userId: string): Promise<ProfileResponseDto | null> {
        const profile = await this._profileRepo.findByUserId(userId);
        return profile ? ProfileMapper.toProfileResponse(profile) : null;
    }

    async isProfileCompleted(userId: string): Promise<boolean> {
        const profile = await this._profileRepo.findByUserId(userId);
        if (!profile) return false;
        return this.checkProfileCompletion(profile);
    }

    private checkProfileCompletion(profile: ProfileCompletionCheckDto): boolean {
        return Boolean(
            profile.age &&
            profile.gender &&
            profile.interestedIn &&
            profile.photos &&
            profile.photos.length > 0
        );
    }
}

