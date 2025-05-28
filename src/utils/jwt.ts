import jwt from 'jsonwebtoken';

export const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'access_secret',
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
  accessTokenExpiresIn: '15m',
  refreshTokenExpiresIn: '7d'
};

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, jwtConfig.accessTokenSecret, {
    expiresIn: '15m'
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, jwtConfig.refreshTokenSecret, {
    expiresIn: '7d'
  });
};

