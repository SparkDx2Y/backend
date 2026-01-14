import { Profile } from "../models/profile";

export const DI_TYPES = {
    REPOSITORIES: {
        USER_REPOSITORY: Symbol.for('UserRepository'),
        OTP_REPOSITORY: Symbol.for('otpRepository'),
        PROFILE_REPOSITORY: Symbol.for('ProfileRepository'),
        MATCH_REPOSITORY: Symbol.for('MatchRepository'),
        INTEREST_REPOSITORY: Symbol.for('InterestRepository'),
        INTEREST_CATEGORY_REPOSITORY: Symbol.for('InterestCategoryRepository')
    },
    SERVICES: {
        AUTH_SERVICE: Symbol.for('AuthService'),
        PROFILE_SERVICE: Symbol.for('ProfileService'),
        FILE_SERVICE: Symbol.for('FileService'),
        MATCH_SERVICE: Symbol.for('MatchService'),
        ADMIN_SERVICE: Symbol.for('AdminService'),
        ADMIN_INTEREST_SERVICE: Symbol.for('AdminInterestService')
    },
    CONTROLLERS: {
        AUTH_CONTROLLER: Symbol.for('AuthController'),
        PROFILE_CONTROLLER: Symbol.for('ProfileController'),
        FILE_CONTROLLER: Symbol.for('FileController'),
        MATCH_CONTROLLER: Symbol.for('MatchController'),
        ADMIN_CONTROLLER: Symbol.for('AdminController'),
        ADMIN_INTEREST_CONTROLLER: Symbol.for('AdminInterestController')
    },

    External: {
        REDIS: Symbol.for('RedisClient'),
        GOOGLE_CLIENT: Symbol.for('GoogleClient')
    }
}