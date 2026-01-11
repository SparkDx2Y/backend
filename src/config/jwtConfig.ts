export const jwtConfig = {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'access_secret',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    tempTokenSecret: process.env.JWT_SECRET || 'jwt_secret',
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
    tempTokenExpiresIn: '15m'
} as const;