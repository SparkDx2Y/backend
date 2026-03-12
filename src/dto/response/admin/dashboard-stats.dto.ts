export interface DailyDataPoint {
    date: string;
    value: number;
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

    revenueByDay: DailyDataPoint[];    
    newUsersByDay: DailyDataPoint[];   
    newMatchesByDay: DailyDataPoint[]; 
}
