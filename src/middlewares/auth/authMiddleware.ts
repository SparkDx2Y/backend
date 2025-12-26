import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../utils/jwtHelper";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { COMMON_ERRORS } from "../../constants/errors/common.erros";


export const authMiddleware = (
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
