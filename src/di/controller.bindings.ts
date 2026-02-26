import type { Container } from "inversify";
import { DI_TYPES } from "./types";
import { AuthController } from "../controllers/auth/AuthController";
import { ProfileController } from "../controllers/profile/ProfileController";
import { FileController } from "../controllers/file/FileController";
import { MatchController } from "../controllers/match/MatchController";
import { MessageController } from "../controllers/message/MessageController";
import { NotificationController } from "../controllers/notification/NotificationController";
import { AdminController } from "../controllers/admin/AdminController";
import { InterestController } from "../controllers/admin/interest/InterestController";
import { ReportController } from "../controllers/report/ReportController";
import { SubscriptionController } from "../controllers/admin/subscription/SubscriptionController";
import { UserSubscriptionController } from "../controllers/subscription/UserSubscriptionController";


export function bindControllers(container: Container) {
    container.bind(DI_TYPES.CONTROLLERS.AUTH_CONTROLLER).to(AuthController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.PROFILE_CONTROLLER).to(ProfileController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.FILE_CONTROLLER).to(FileController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.MATCH_CONTROLLER).to(MatchController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.MESSAGE_CONTROLLER).to(MessageController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.NOTIFICATION_CONTROLLER).to(NotificationController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.ADMIN_CONTROLLER).to(AdminController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.INTEREST_CONTROLLER).to(InterestController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.REPORT_CONTROLLER).to(ReportController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.SUBSCRIPTION_CONTROLLER).to(SubscriptionController).inSingletonScope()
    container.bind(DI_TYPES.CONTROLLERS.USER_SUBSCRIPTION_CONTROLLER).to(UserSubscriptionController).inSingletonScope()
}
