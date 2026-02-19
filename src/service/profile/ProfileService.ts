import { inject, injectable } from "inversify";
import { IProfileService } from "./IProfileService";
import { DI_TYPES } from "../../di/types";
import { IProfileRepository } from "../../repositories/profile/IProfileRepository";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { CompleteProfileDto } from "../../dto/request/profile/complete-profile.dto";
import { UpdateProfileDto } from "../../dto/request/profile/update-profile.dto";
import { ProfileResponseDto } from "../../dto/response/profile/profile-response.dto";
import { ProfileMapper } from "../../mapper/auth/profile.mapper";
import { ProfileCompletionCheckDto } from "../../dto/internal/profile-completion-check.dto";
import { AppError } from "../../utils/AppError";
import { PROFILE_ERRORS } from "../../constants/errors/profile.errors";
import { HTTP_STATUS } from "../../constants/http-status.constants";




@injectable()
export class ProfileService implements IProfileService {

    constructor(
        @inject(DI_TYPES.REPOSITORIES.PROFILE_REPOSITORY)
        private readonly _profileRepo: IProfileRepository,
        @inject(DI_TYPES.REPOSITORIES.USER_REPOSITORY)
        private readonly _userRepo: IUserRepository,
    ) { }

    // ----------------------------------
    // Complete user profile
    // ----------------------------------
    async completeProfile(userId: string, data: CompleteProfileDto): Promise<{ profile: ProfileResponseDto, isCompleted: boolean }> {


        const user = await this._userRepo.findById(userId);

        if (!user) {
            throw new AppError(
                PROFILE_ERRORS.USER_NOT_FOUND,
                HTTP_STATUS.NOT_FOUND
            )
        }
        if (!user.isVerified) {
            throw new AppError(
                PROFILE_ERRORS.USER_NOT_VERIFIED,
                HTTP_STATUS.FORBIDDEN
            )
        }


        const existingProfile = await this._profileRepo.findByUserId(userId);
        if (existingProfile) {
            throw new AppError(
                PROFILE_ERRORS.PROFILE_ALREADY_EXISTS,
                HTTP_STATUS.CONFLICT
            )
        }


        const profile = await this._profileRepo.create({
            userId: userId as any,
            ...data,
            interests: [],
            coverPhoto: null,
            photos: [],
        } as any);

        if (!profile) {
            throw new AppError(
                PROFILE_ERRORS.PROFILE_CREATE_FAILED,
                HTTP_STATUS.INTERNAL_SERVER_ERROR
            )
        }

        // 4. Verify profile is complete 
        const isCompleted = this.checkProfileCompletion(profile);

        return {
            profile: ProfileMapper.toProfileResponse(profile),
            isCompleted
        }
    }

    // ----------------------------------
    // Get profile by user id
    // ----------------------------------

    async getProfileByUserId(userId: string): Promise<ProfileResponseDto | null> {

        const profile = await this._profileRepo.findByUserId(userId);
        return profile ? ProfileMapper.toProfileResponse(profile) : null;

    }

    // ----------------------------------
    // Check if profile is completed
    // ----------------------------------

    async isProfileCompleted(userId: string): Promise<boolean> {
        const profile = await this._profileRepo.findByUserId(userId);
        if (!profile) return false;
        return this.checkProfileCompletion(profile);
    }


    // ----------------------------------
    // Check if interests are selected
    // ----------------------------------

    async isInterestsSelected(userId: string): Promise<boolean> {
        const profile = await this._profileRepo.findByUserId(userId);
        if (!profile) return false;
        return profile.interests && profile.interests.length > 0;
    }

    // ----------------------------------
    // Update profile (settings page)
    // ----------------------------------
   async updateProfile(userId: string,data: UpdateProfileDto): Promise<ProfileResponseDto> {

    const updatedData : any =  {...data}

    const updatedProfile = await this._profileRepo.updateByUserId(
        userId,
        updatedData
    );

    if (!updatedProfile) {
        throw new AppError(
            PROFILE_ERRORS.PROFILE_NOT_FOUND,
            HTTP_STATUS.NOT_FOUND
        );
    }

    return ProfileMapper.toProfileResponse(updatedProfile);
}


    // ----------------------------------
    // Update interests
    // ----------------------------------
async updateInterests(userId: string,interestIds: string[]): Promise<ProfileResponseDto> {

    const updatedProfile = await this._profileRepo.updateByUserId(userId,{ interests: interestIds as any });

    if (!updatedProfile) {
        throw new AppError(
            PROFILE_ERRORS.PROFILE_NOT_FOUND,
            HTTP_STATUS.NOT_FOUND
        );
    }

    return ProfileMapper.toProfileResponse(updatedProfile);
}

    // ----------------------------------
    // Update location
    // ----------------------------------

   async updateLocation(userId: string,latitude: number,longitude: number): Promise<void> {

    const updatedProfile = await this._profileRepo.updateByUserId(
        userId,
        { location: { type: "Point", coordinates: [longitude, latitude] } } 
    );

    if (!updatedProfile) {
        throw new AppError(
            PROFILE_ERRORS.PROFILE_NOT_FOUND,
            HTTP_STATUS.NOT_FOUND
        );
    }
}


    // ----------------------------------
    // Check if location is completed
    // ----------------------------------

    async isLocationCompleted(userId: string): Promise<boolean> {
        const profile = await this._profileRepo.findByUserId(userId);
        if (!profile) return false;
        return Boolean(
            profile.location && Array.isArray(profile.location.coordinates) && profile.location.coordinates.length === 2
        )
    }

    private checkProfileCompletion(profile: ProfileCompletionCheckDto): boolean {
        return Boolean(
            profile.age &&
            profile.gender &&
            profile.interestedIn &&
            profile.profilePhoto
        );
    }
}

