import { Profile } from "../models/profile";

export const DI_TYPES = {
    REPOSITORIES: {
        USER_REPOSITORY: Symbol.for('UserRepository'),
        OTP_REPOSITORY: Symbol.for('otpRepository'),
        PROFILE_REPOSITORY: Symbol.for('ProfileRepository')
    },
    SERVICES: {
        AUTH_SERVICE: Symbol.for('AuthService'),
        PROFILE_SERVICE: Symbol.for('ProfileService'),
        FILE_SERVICE: Symbol.for('FileService')
    },
    CONTROLLERS: {
        AUTH_CONTROLLER: Symbol.for('AuthController'),
        PROFILE_CONTROLLER: Symbol.for('ProfileController')
    },
    External: {
        REDIS: Symbol.for('RedisClient')
    }
}