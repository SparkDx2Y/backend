export interface DashboardRawData {
    totalUsers: number;
    newUsers: number;
    premiumUsers: number;
    expiredSubscriptions: number;
    totalMatches: number;
    newMatches: number;
    revenueAgg: any[];
    revenueInRangeAgg: any[];
    revenueByDayAgg: any[];
    newUsersByDayAgg: any[];
    newMatchesByDayAgg: any[];
}

export interface IDashboardRepository {
    getDashboardMetrics(from: Date, to: Date): Promise<DashboardRawData>;
}
