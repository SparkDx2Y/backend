import type { MessageType, IMessageMetadata } from "../../../types/message";

export interface MessageResponseDto {
    id: string;
    matchId: string;
    senderId: string;
    content: string;
    type: MessageType;
    metadata?: IMessageMetadata;
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
    lastMessageType?: MessageType;
    createdAt: Date;
}
