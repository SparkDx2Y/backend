import { Container } from "inversify";
import { DI_TYPES } from "./types";
import { AuthService } from "../service/auth/AuthService";
import { ProfileService } from "../service/profile/ProfileService";
import { FileService } from "../service/file/FileService";
import { MatchService } from "../service/match/MatchService";
import { AdminService } from "../service/admin/AdminService";


export function bindServices(container: Container) {
    container.bind(DI_TYPES.SERVICES.AUTH_SERVICE).to(AuthService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.PROFILE_SERVICE).to(ProfileService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.FILE_SERVICE).to(FileService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.MATCH_SERVICE).to(MatchService).inSingletonScope();
    container.bind(DI_TYPES.SERVICES.ADMIN_SERVICE).to(AdminService).inSingletonScope();
}
