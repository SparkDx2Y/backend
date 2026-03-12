import type { DashboardStatsDto } from "../../dto/response/admin/dashboard-stats.dto";

export interface IDashboardRepository {
    getDashboardStats(from: Date, to: Date): Promise<DashboardStatsDto>;
}
