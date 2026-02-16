import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/responseHelper";
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
        return sendResponse(res, err.statusCode, err.message);
    }

    console.error('unhandled Error: ', err);
    return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, COMMON_ERRORS.SOMETHING_WENT_WRONG);

}