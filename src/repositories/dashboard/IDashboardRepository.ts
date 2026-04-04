export interface DashboardRawData {
    totalUsers: number;
    newUsers: number;
    premiumUsers: number;
    expiredSubscriptions: number;
    totalMatches: number;
    newMatches: number;
    revenueAgg: { total: number }[];
    revenueInRangeAgg: { total: number }[];
    revenueByDayAgg: { _id: string; value: number }[];
    newUsersByDayAgg: { _id: string; value: number }[];
    newMatchesByDayAgg: { _id: string; value: number }[];
}

export interface IDashboardRepository {
    getDashboardMetrics(from: Date, to: Date): Promise<DashboardRawData>;
}
