import { IMessage } from "../../models/Message";
import { IMatch } from "../../models/Match";
import { MessageResponseDto, MatchResponseDto } from "../../dto/response/message/message-response.dto";

export class MessageMapper {
    static toMessageResponse(message: IMessage): MessageResponseDto {
        return {
            id: message._id.toString(),
            matchId: message.matchId.toString(),
            senderId: message.senderId.toString(),
            content: message.content,
            isRead: message.isRead,
            createdAt: message.createdAt
        };
    }

    static toMatchResponse(match: IMatch): MatchResponseDto {
        return {
            id: match._id.toString(),
            users: (match.users as any[]).map((user: any) => ({
                userId: user._id.toString(),
                name: user.name,
                profilePhoto: user.profilePhoto || undefined
            })),
            ...(match.lastMessageAt && { lastMessageAt: match.lastMessageAt }),
            createdAt: match.createdAt
        };
    }
}
