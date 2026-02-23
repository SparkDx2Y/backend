import { Router } from "express";
import AuthRoutes from "./auth/auth.routes";
import profileRoutes from "./profile/profile.routes";
import fileRoutes from "./fileRoutes";
import matchRoutes from "./match/match.routes";
import notificationRoutes from "./notification/notification.routes";
import messageRoutes from "./message/message.routes";
import adminRoutes from "./admin";
import reportRoutes from "./report/report.routes";

const router = Router()

//? Auth routes
router.use('/auth', AuthRoutes)

//? Profile routes
router.use('/profile', profileRoutes)

//? File routes
router.use('/files', fileRoutes)

//? Match routes
router.use('/match', matchRoutes)

//? Notification routes
router.use('/notifications', notificationRoutes)

//? Message routes
router.use('/messages', messageRoutes)

//? Admin routes
router.use('/admin', adminRoutes)

//? Report routes
router.use('/reports', reportRoutes)

export default router
