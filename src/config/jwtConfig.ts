export const jwtConfig = {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'access_secret',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    tempTokenSecret: process.env.JWT_SECRET || 'jwt_secret',
    resetTokenSecret: process.env.JWT_RESET_SECRET || 'reset_secret',
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
    tempTokenExpiresIn: '5m',
    resetTokenExpiresIn: '5m'
} as const;