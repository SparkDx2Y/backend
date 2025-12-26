import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { HTTP_STATUS } from "../constants/http-status.constants";
import { COMMON_ERRORS } from "../constants/errors/common.erros";





export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
        })
    }

    console.error('unhandled Error: ', err);

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: COMMON_ERRORS.SOMETHING_WENT_WRONG
    });
    
}