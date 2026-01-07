import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../utils/jwtHelper";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";
import container from "../../di";
import { IUserRepository } from "../../repositories/user/IUserRepository";
import { DI_TYPES } from "../../di/types";


export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: COMMON_ERRORS.UNAUTHORIZED });
    }

    const decoded = verifyToken(token);

    const userRepo = container.get<IUserRepository>(DI_TYPES.REPOSITORIES.USER_REPOSITORY)

    const isBlocked = await userRepo.isUserBlocked(decoded.id)

      if(isBlocked) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ message: 'Your account has been blocked by Admin. Please contact support.' });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: COMMON_ERRORS.UNAUTHORIZED
    });
  }
};
