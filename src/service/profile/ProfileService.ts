import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import { IProfileService } from "./IProfileService";
import { DI_TYPES } from "../../di/types";
import { IProfileRepository } from "../../repositories/profile/IProfileRepository";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { IProfile } from "../../models/profile";
import { CompleteProfileDto } from "../../dto/request/profile/complete-profile.dto";
import { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";
import { ProfileMapper } from "../../mapper/auth/profile.mapper";




@injectable()
export class ProfileService implements IProfileService {

    constructor(
        @inject(DI_TYPES.REPOSITORIES.PROFILE_REPOSITORY)
        private readonly _profileRepo: IProfileRepository,
        @inject(DI_TYPES.REPOSITORIES.USER_REPOSITORY)
        private readonly _userRepo: IUserRepository
    ) { }

    // complete profile
    async completeProfile(userId: string, data: CompleteProfileDto): Promise<{ profile: ProfileResponseDto, isCompleted: boolean }> {
        // 1. Verify user exists and is verified
        const user = await this._userRepo.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (!user.isVerified) {
            throw new Error("User is not verified. Please verify your email first.");
        }

        const updateData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined)
        );

        let profile = await this._profileRepo.findByUserId(userId)

        if (!profile) {
            profile = await this._profileRepo.create({
                userId: new mongoose.Types.ObjectId(userId),
                ...updateData
            } as any);
        } else {
            profile = await this._profileRepo.updateById(profile._id.toString(), updateData)
        }

        if (!profile) {
            throw new Error("Failed to create or update profile");
        }

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

    private checkProfileCompletion(profile: IProfile): boolean {
        return Boolean(
            profile.age &&
            profile.gender &&
            profile.photos &&
            profile.photos.length > 0
        );
    }
}

