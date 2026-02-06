import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtConfig } from "../config/jwtConfig";

export interface RefreshPayload {
  id: string;
  role: string;
}


export const generateToken = (payload: { id: string, role: string, isProfileCompleted: boolean, isInterestsSelected: boolean, isLocationCompleted: boolean }): string => {
  return jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpiresIn,
  });
};


export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
    expiresIn: jwtConfig.refreshTokenExpiresIn
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtConfig.accessTokenSecret) as JwtPayload;
}

export const verifyRefreshToken = (token: string): RefreshPayload => {
  return jwt.verify(token, jwtConfig.refreshTokenSecret) as RefreshPayload;
};


export const generateTempToken = (payload: object) => {
  return jwt.sign(
    { ...payload, type: "TEMP" },
    jwtConfig.tempTokenSecret,
    { expiresIn: jwtConfig.tempTokenExpiresIn }
  );
};

export const verifyTempToken = (token: string) => {
  return jwt.verify(token, jwtConfig.tempTokenSecret) as {
    userId: string;
    type: "TEMP";
  };
};

export const generateResetToken = (userId: string) => {
  return jwt.sign(
    { userId, type: "RESET_PASSWORD" },
    jwtConfig.resetTokenSecret,
    { expiresIn: jwtConfig.resetTokenExpiresIn }
  );
};

export const verifyResetToken = (token: string) => {
  return jwt.verify(token, jwtConfig.resetTokenSecret) as {
    userId: string;
    type: "RESET_PASSWORD";
  };
};
