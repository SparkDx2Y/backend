import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/responseHelper";
import { COMMON_MESSAGES } from "../../constants/common.messages";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { INotificationService } from "../../service/notification/INotificationService";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";
import { NOTIFICATION_ERRORS } from "../../constants/errors/notification.errors";

@injectable()
export class NotificationController {
    constructor(
        @inject(DI_TYPES.SERVICES.NOTIFICATION_SERVICE)
        private readonly _notificationService: INotificationService
    ) { }

    //? Get all notifications for a user
    getNotifications = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

            const notifications = await this._notificationService.getNotifications(req.user.id, page, limit);
            sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.NOTIFICATIONS_FETCHED, notifications);
        } catch (error) {
            next(error);
        }
    };


    //? Get unread count
    getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const count = await this._notificationService.getUnreadCount(req.user.id);
            sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.UNREAD_COUNT_FETCHED, { count });
        } catch (error) {
            next(error);
        }
    };

    //? Mark notification as read
    markAsRead = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            const { notificationId } = req.params;
            if (!notificationId) {
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, NOTIFICATION_ERRORS.NOTIFICATION_ID_REQUIRED);
            }

            await this._notificationService.markAsRead(notificationId, req.user.id);
            sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.NOTIFICATION_MARKED_AS_READ);
        } catch (error) {
            next(error);
        }
    };

    //? Mark all notifications as read
    markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, COMMON_ERRORS.UNAUTHORIZED);
            }

            await this._notificationService.markAllAsRead(req.user.id);
            sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.ALL_NOTIFICATIONS_MARKED_AS_READ);
        } catch (error) {
            next(error);
        }
    };
}
