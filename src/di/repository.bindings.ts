import { Container } from "inversify";
import { DI_TYPES } from "./types";


//? repositories
import { UserRepository } from '../repositories/user/UserRepository'
import { OtpRepository } from "../repositories/otp/OtpRepository";
import { ProfileRepository } from "../repositories/profile/ProfileRepository";
import { MatchRepository } from "../repositories/match/MatchRepository";
import { MatchedUsersRepository } from "../repositories/match/MatchedUsersRepository";
import { MessageRepository } from "../repositories/message/MessageRepository";
import { NotificationRepository } from "../repositories/notification/NotificationRepository";
import { InterestCategoryRepository } from "../repositories/interest/InterestCategoryRepository";
import { InterestRepository } from "../repositories/interest/InterestRepository";
import { ReportRepository } from "../repositories/report/ReportRepository";

export function bindRepositories(container: Container) {
    container.bind(DI_TYPES.REPOSITORIES.USER_REPOSITORY).to(UserRepository).inSingletonScope()
    container.bind(DI_TYPES.REPOSITORIES.OTP_REPOSITORY).to(OtpRepository).inSingletonScope()
    container.bind(DI_TYPES.REPOSITORIES.PROFILE_REPOSITORY).to(ProfileRepository).inSingletonScope()
    container.bind(DI_TYPES.REPOSITORIES.MATCH_REPOSITORY).to(MatchRepository).inSingletonScope()
    container.bind(DI_TYPES.REPOSITORIES.MATCHED_USERS_REPOSITORY).to(MatchedUsersRepository).inSingletonScope()
    container.bind(DI_TYPES.REPOSITORIES.MESSAGE_REPOSITORY).to(MessageRepository).inSingletonScope()
    container.bind(DI_TYPES.REPOSITORIES.NOTIFICATION_REPOSITORY).to(NotificationRepository).inSingletonScope()
    container.bind(DI_TYPES.REPOSITORIES.INTEREST_CATEGORY_REPOSITORY).to(InterestCategoryRepository).inSingletonScope()
    container.bind(DI_TYPES.REPOSITORIES.INTEREST_REPOSITORY).to(InterestRepository).inSingletonScope()
    container.bind(DI_TYPES.REPOSITORIES.REPORT_REPOSITORY).to(ReportRepository).inSingletonScope()
}
