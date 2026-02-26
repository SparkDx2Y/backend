export interface NotificationResponseDto {
    id: string;
    type: 'like' | 'match' | 'message' | 'report_resolved' | 'report_dismissed' | 'profile_view';
    fromUser: {
        userId: string;
        name: string;
        profilePhoto?: string;
    };
    matchId?: string;
    messageId?: string;
    isRead: boolean;
    createdAt: Date;
}
