export interface NotificationResponseDto {
    id: string;
    type: 'like' | 'match' | 'message';
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
