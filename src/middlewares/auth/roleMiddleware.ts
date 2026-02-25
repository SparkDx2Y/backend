import type { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/responseHelper";
import { HTTP_STATUS } from "../../constants/http-status.constants";

/**
 * Middleware to restrict access to admin users only.
 * Should be used AFTER authMiddleware.
 */
export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user || req.user.role !== 'admin') {
        return sendResponse(res, HTTP_STATUS.FORBIDDEN, "Access denied. Admin privileges required.");
    }

    next();
};
