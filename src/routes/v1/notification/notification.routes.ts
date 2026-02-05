import { Router } from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import { NotificationController } from "../../../controllers/notification/NotificationController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";

const router = Router();

const notificationController = container.get<NotificationController>(DI_TYPES.CONTROLLERS.NOTIFICATION_CONTROLLER);

router.get("/", authMiddleware, notificationController.getNotifications);
router.get("/unread", authMiddleware, notificationController.getUnreadNotifications);
router.get("/count", authMiddleware, notificationController.getUnreadCount);
router.put("/:notificationId/read", authMiddleware, notificationController.markAsRead);
router.put("/read-all", authMiddleware, notificationController.markAllAsRead);

export default router;
