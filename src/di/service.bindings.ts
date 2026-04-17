import type { Container } from "inversify";
import { DI_TYPES } from "./types";
import { AuthService } from "../service/auth/AuthService";
import { ProfileService } from "../service/profile/ProfileService";
import { FileService } from "../service/file/FileService";
import { MatchService } from "../service/match/MatchService";
import { MessageService } from "../service/message/MessageService";
import { NotificationService } from "../service/notification/NotificationService";
import { AdminService } from "../service/admin/AdminService";
import { InterestService } from "../service/interest/InterestService";
import { SocketServiceWrapper } from "../service/socket/SocketServiceWrapper";
import { CloudinaryStorageProvider } from "../service/storage/CloudinaryStorageProvider";
import { ReportService } from "../service/report/ReportService";
import { ProfileViewService } from "../service/profile-view/ProfileViewService";
import { SubscriptionService } from "../service/subscription/SubscriptionService";
import { UserSubscriptionService } from "../service/subscription/UserSubscriptionService";
import { PaymentService } from "../service/payment/PaymentService";
import { DateSuggestionService } from "../service/date-suggestion/DateSuggestionService";
import { SubscriptionCleanupJob } from "../jobs/SubscriptionCleanupJob";
import { DateReminderJob } from "../jobs/DateReminderJob";

export function bindServices(container: Container) {
    container.bind(DI_TYPES.SERVICES.AUTH_SERVICE).to(AuthService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.PROFILE_SERVICE).to(ProfileService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.FILE_SERVICE).to(FileService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.MATCH_SERVICE).to(MatchService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.MESSAGE_SERVICE).to(MessageService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.NOTIFICATION_SERVICE).to(NotificationService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.ADMIN_SERVICE).to(AdminService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.INTEREST_SERVICE).to(InterestService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.SOCKET_SERVICE).to(SocketServiceWrapper).inSingletonScope();
    container.bind(DI_TYPES.PROVIDERS.STORAGE_PROVIDER).to(CloudinaryStorageProvider).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.REPORT_SERVICE).to(ReportService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.PROFILE_VIEW_SERVICE).to(ProfileViewService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.SUBSCRIPTION_SERVICE).to(SubscriptionService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.USER_SUBSCRIPTION_SERVICE).to(UserSubscriptionService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.PAYMENT_SERVICE).to(PaymentService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.DATE_SUGGESTION_SERVICE).to(DateSuggestionService).inSingletonScope();

    // Jobs
    container.bind(DI_TYPES.JOBS.SUBSCRIPTION_CLEANUP_JOB).to(SubscriptionCleanupJob).inSingletonScope();
    container.bind(DI_TYPES.JOBS.DATE_REMINDER_JOB).to(DateReminderJob).inSingletonScope();
}
