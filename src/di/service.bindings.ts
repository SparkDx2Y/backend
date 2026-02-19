import { Container } from "inversify";
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
}
