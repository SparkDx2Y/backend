export interface MessageResponseDto {
    id: string;
    matchId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'audio' | 'video_call';
    isRead: boolean;
    createdAt: Date;
}

export interface MatchResponseDto {
    id: string;
    users: {
        userId: string;
        name: string;
        profilePhoto?: string;
        isBlocked: boolean;
    }[];
    lastMessageAt?: Date;
    lastMessage?: string;
    lastMessageType?: 'text' | 'image' | 'audio' | 'video_call';
    createdAt: Date;
}
