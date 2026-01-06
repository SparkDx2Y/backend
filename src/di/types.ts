import { Profile } from "../models/profile";

export const DI_TYPES = {
    REPOSITORIES: {
        USER_REPOSITORY: Symbol.for('UserRepository'),
        OTP_REPOSITORY: Symbol.for('otpRepository'),
        PROFILE_REPOSITORY: Symbol.for('ProfileRepository'),
        MATCH_REPOSITORY: Symbol.for('MatchRepository')
    },
    SERVICES: {
        AUTH_SERVICE: Symbol.for('AuthService'),
        PROFILE_SERVICE: Symbol.for('ProfileService'),
        FILE_SERVICE: Symbol.for('FileService'),
        MATCH_SERVICE: Symbol.for('MatchService')
    },
    CONTROLLERS: {
        AUTH_CONTROLLER: Symbol.for('AuthController'),
        PROFILE_CONTROLLER: Symbol.for('ProfileController'),
        FILE_CONTROLLER: Symbol.for('FileController'),
        MATCH_CONTROLLER: Symbol.for('MatchController')
    },

    External: {
        REDIS: Symbol.for('RedisClient')
    }
}