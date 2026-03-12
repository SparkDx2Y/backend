import { inject, injectable } from "inversify";
import { IAdminService } from "./IAdminService";
import { DI_TYPES } from "../../di/types";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { IDashboardRepository } from "../../repositories/dashboard/IDashboardRepository";
import { AdminUserListResponseDto } from "../../dto/response/admin/admin.userList.response";
import { DashboardStatsDto } from "../../dto/response/admin/dashboard-stats.dto";

@injectable()
export class AdminService implements IAdminService {

    constructor(
        @inject(DI_TYPES.REPOSITORIES.USER_REPOSITORY)
        private readonly _userRepo: IUserRepository,

        @inject(DI_TYPES.REPOSITORIES.DASHBOARD_REPOSITORY)
        private readonly _dashboardRepo: IDashboardRepository
    ) { }

    async getAllUsers(search = '', page = 1, limit = 10): Promise<{ users: AdminUserListResponseDto[], total: number }> {
        return this._userRepo.findUsersForAdmin(search, page, limit);
    }

    async updateUserBlockStatus(userId: string, isBlocked: boolean): Promise<void> {
        if (isBlocked) {
            await this._userRepo.blockUser(userId);
        } else {
            await this._userRepo.unblockUser(userId);
        }
    }

    async getDashboardStats(from: Date, to: Date): Promise<DashboardStatsDto> {
        return this._dashboardRepo.getDashboardStats(from, to);
    }
}
