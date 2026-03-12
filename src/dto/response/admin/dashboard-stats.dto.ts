export interface ChartDataPoint {
    date: string;
    revenue: number;
    users: number;
    matches: number;
}

export interface DashboardStatsDto {
    totalUsers: number;
    newUsers: number;          
    premiumUsers: number;      
    totalRevenue: number;      
    revenueInRange: number;    
    totalMatches: number;
    newMatches: number;       
    activeSubscriptions: number;
    expiredSubscriptions: number;

    chartData: ChartDataPoint[];
}
