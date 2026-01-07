import { inject, injectable } from "inversify";
import { IAdminService} from "./IAdminService";
import { DI_TYPES } from "../../di/types";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { AdminUserListResponseDto } from "../../dto/response/admin/admin.userList.response";

@injectable()
export class AdminService implements IAdminService {

    constructor(
        @inject(DI_TYPES.REPOSITORIES.USER_REPOSITORY)
        private readonly _userRepo: IUserRepository
    ) { }

    // ----------------------------------
    // Get all users (admin only)
    // ----------------------------------
    async getAllUsers(search = '', page = 1, limit = 10): Promise<{ users: AdminUserListResponseDto[], total: number }> {
        return this._userRepo.findUsersForAdmin(search, page, limit)
    }

    // ----------------------------------
    // Update user block status
    // ----------------------------------
    async updateUserBlockStatus(userId: string, isBlocked: boolean): Promise<void> {
        if (isBlocked) {
            await this._userRepo.blockUser(userId);
        } else {
            await this._userRepo.unblockUser(userId);
        }
    }
}

