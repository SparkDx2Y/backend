import { inject, injectable } from "inversify";
import { IAdminService, UserWithProfile } from "./IAdminService";
import { DI_TYPES } from "../../di/types";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { IProfileRepository } from "../../repositories/profile/IProfileRepository";
import { IUser } from "../../models/user";

@injectable()
export class AdminService implements IAdminService {

    constructor(
        @inject(DI_TYPES.REPOSITORIES.USER_REPOSITORY)
        private readonly _userRepo: IUserRepository,
        @inject(DI_TYPES.REPOSITORIES.PROFILE_REPOSITORY)
        private readonly _profileRepo: IProfileRepository
    ) { }

    // ----------------------------------
    // Get all users (admin only)
    // ----------------------------------
    async getAllUsers(): Promise<UserWithProfile[]> {
        // Get all users except admins
        const users = await this._userRepo.find({ role: 'user' });
        
        // Get profiles for all users and map them together
        const usersWithProfiles: UserWithProfile[] = await Promise.all(
            users.map(async (user) => {
                const profile = await this._profileRepo.findByUserId(user._id.toString());
                const userObj = user.toObject();
                
                const profilePhoto: string | null = (profile?.photos && profile.photos.length > 0 && profile.photos[0]) ? profile.photos[0] : null;
                
                return {
                    _id: userObj._id.toString(),
                    name: userObj.name,
                    email: userObj.email,
                    isVerified: userObj.isVerified,
                    role: userObj.role,
                    isBlocked: userObj.isBlocked,
                    createdAt: userObj.createdAt,
                    updatedAt: userObj.updatedAt,
                    profilePhoto
                };
            })
        );

        return usersWithProfiles;
    }

    // ----------------------------------
    // Update user block status
    // ----------------------------------
    async updateUserBlockStatus(userId: string, isBlocked: boolean): Promise<IUser | null> {
        if (isBlocked) {
            return this._userRepo.blockUser(userId);
        } else {
            return this._userRepo.unblockUser(userId);
        }
    }
}

