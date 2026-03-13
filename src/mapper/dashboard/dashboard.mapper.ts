import { DashboardStatsDto, ChartDataPoint } from "../../dto/response/admin/dashboard-stats.dto";
import { DashboardRawData } from "../../repositories/dashboard/IDashboardRepository";

export class DashboardMapper {
    static toDto(raw: DashboardRawData): DashboardStatsDto {
        const chartMap = new Map<string, ChartDataPoint>();

        raw.revenueByDayAgg.forEach(d => {
            chartMap.set(d._id, { date: d._id, revenue: d.value, users: 0, matches: 0 });
        });

        raw.newUsersByDayAgg.forEach(d => {
            const existing = chartMap.get(d._id) || { date: d._id, revenue: 0, users: 0, matches: 0 };
            chartMap.set(d._id, { ...existing, users: d.value });
        });

        raw.newMatchesByDayAgg.forEach(d => {
            const existing = chartMap.get(d._id) || { date: d._id, revenue: 0, users: 0, matches: 0 };
            chartMap.set(d._id, { ...existing, matches: d.value });
        });

        const chartData = Array.from(chartMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        return {
            totalUsers: raw.totalUsers,
            newUsers: raw.newUsers,
            premiumUsers: raw.premiumUsers,
            totalRevenue: raw.revenueAgg[0]?.total ?? 0,
            revenueInRange: raw.revenueInRangeAgg[0]?.total ?? 0,
            totalMatches: raw.totalMatches,
            newMatches: raw.newMatches,
            activeSubscriptions: raw.premiumUsers, 
            expiredSubscriptions: raw.expiredSubscriptions,
            chartData
        };
    }
}
