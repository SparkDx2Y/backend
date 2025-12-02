import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtConfig } from "../config/jwtConfig";

interface RefreshPayload {
  id: string;
  role: string;
}


export const generateToken = (payload: object): string => {
  return jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpiresIn,
  });
};


export const generateRefreshToken = (payload: object): string => {
    return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
        expiresIn: jwtConfig.refreshTokenExpiresIn
    });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, jwtConfig.accessTokenSecret)
}

export const verifyRefreshToken = (token: string): RefreshPayload  => {
    return jwt.verify(token, jwtConfig.refreshTokenSecret) as RefreshPayload;
  };
  