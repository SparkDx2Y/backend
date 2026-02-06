import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { INotificationService } from "../../service/notification/INotificationService";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";

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
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }

            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

            const notifications = await this._notificationService.getNotifications(req.user.id, limit);
            res.status(HTTP_STATUS.OK).json(notifications);
        } catch (error) {
            next(error);
        }
    };


    //? Get unread count
    getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }

            const count = await this._notificationService.getUnreadCount(req.user.id);
            res.status(HTTP_STATUS.OK).json({ count });
        } catch (error) {
            next(error);
        }
    };

    //? Mark notification as read
    markAsRead = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }

            const { notificationId } = req.params;
            if (!notificationId) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Notification ID is required" });
            }

            await this._notificationService.markAsRead(notificationId, req.user.id);
            res.status(HTTP_STATUS.OK).json({ message: "Notification marked as read" });
        } catch (error) {
            next(error);
        }
    };

    //? Mark all notifications as read
    markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
            }

            await this._notificationService.markAllAsRead(req.user.id);
            res.status(HTTP_STATUS.OK).json({ message: "All notifications marked as read" });
        } catch (error) {
            next(error);
        }
    };
}
