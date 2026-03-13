import type { AdminUserListResponseDto } from "../../dto/response/admin/admin.userList.response";
import { DashboardStatsDto } from "../../dto/response/admin/dashboard-stats.dto";

export interface IAdminService {

    getAllUsers(search: string, page: number, limit: number): Promise<{ users: AdminUserListResponseDto[], total: number }>;
    updateUserBlockStatus(userId: string, isBlocked: boolean): Promise<void>;
    getDashboardStats(from: Date, to: Date): Promise<DashboardStatsDto>;

}

