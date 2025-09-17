export const jwtConfig = {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'access_secret',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d'
} as const;