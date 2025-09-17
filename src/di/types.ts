export const DI_TYPES = {
    REPOSITORIES: {
        USER_REPOSITORY: Symbol.for('UserRepository'),
        OTP_REPOSITORY: Symbol.for('otpRepository')
    },
    SERVICES: {
        AUTH_SERVICE: Symbol.for('AuthService')
    },
    CONTROLLERS: {
        AUTH_CONTROLLER: Symbol.for('AuthController')
    },
    External: {
        REDIS: Symbol.for('RedisClient')
    }
}