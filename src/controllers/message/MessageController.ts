import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IMessageService } from "../../service/message/IMessageService";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";
import { sendMessageSchema } from "../../dto/request/message/send-message.dto";

@injectable()
export class MessageController {
    constructor(
        @inject(DI_TYPES.SERVICES.MESSAGE_SERVICE)
        private readonly _messageService: IMessageService
    ) { }

    //? Send a message in a match
    sendMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }

            const { matchId, content, type } = sendMessageSchema.parse(req.body);

            const message = await this._messageService.sendMessage(matchId, req.user.id, content, type);
            res.status(HTTP_STATUS.CREATED).json(message);
        } catch (error) {
            next(error);
        }
    };

    //? Get messages for a match
    getMessages = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }

            const { matchId } = req.params;
            if (!matchId) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Match ID is required" });
            }
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

            const messages = await this._messageService.getMessages(matchId, req.user.id, limit);
            res.status(HTTP_STATUS.OK).json(messages);
        } catch (error) {
            next(error);
        }
    };

    //? Get all matches for a user
    getMatches = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }

            const matches = await this._messageService.getMatches(req.user.id);
            res.status(HTTP_STATUS.OK).json(matches);
        } catch (error) {
            next(error);
        }
    };

    //? Mark messages as read
    markAsRead = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }

            const { matchId } = req.params;
            if (!matchId) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Match ID is required" });
            }

            await this._messageService.markMessagesAsRead(matchId, req.user.id);
            res.status(HTTP_STATUS.OK).json({ message: "Messages marked as read" });
        } catch (error) {
            next(error);
        }
    };

    //? Get unread messages count for a user
    getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }

            const count = await this._messageService.getUnreadCount(req.user.id);
            res.status(HTTP_STATUS.OK).json({ count });
        } catch (error) {
            next(error);
        }
    };
}
