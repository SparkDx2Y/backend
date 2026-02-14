export interface MessageResponseDto {
    id: string;
    matchId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'audio';
    isRead: boolean;
    createdAt: Date;
}

export interface MatchResponseDto {
    id: string;
    users: {
        userId: string;
        name: string;
        profilePhoto?: string;
    }[];
    lastMessageAt?: Date;
    createdAt: Date;
}
