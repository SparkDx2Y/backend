import { Request, Response, NextFunction } from "express";
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
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            message: "Access denied. Admin privileges required."
        });
    }

    next();
};
