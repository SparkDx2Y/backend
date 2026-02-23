import type { IMessage } from "../../models/Message";
import type { IMatch } from "../../models/Match";
import type { MessageResponseDto, MatchResponseDto } from "../../dto/response/message/message-response.dto";

export class MessageMapper {
    static toMessageResponse(message: IMessage): MessageResponseDto {
        return {
            id: message._id.toString(),
            matchId: message.matchId.toString(),
            senderId: message.senderId.toString(),
            content: message.content,
            type: message.type,
            isRead: message.isRead,
            createdAt: message.createdAt
        };
    }

    static toMatchResponse(match: IMatch, lastMessage?: IMessage | null): MatchResponseDto {
        return {
            id: match._id.toString(),
            users: (match.users as any[]).map((user: any) => ({
                userId: user._id.toString(),
                name: user.name,
                profilePhoto: user.profilePhoto || undefined,
                isBlocked: !!user.isBlocked
            })),
            ...(match.lastMessageAt && { lastMessageAt: match.lastMessageAt }),
            ...(lastMessage && {
                lastMessage: lastMessage.content,
                lastMessageType: lastMessage.type
            }),
            createdAt: match.createdAt
        };
    }
}
