import type { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/responseHelper";
import { AppError } from "../utils/AppError";
import { HTTP_STATUS } from "../constants/http-status.constants";
import { COMMON_ERRORS } from "../constants/errors/common.erros";
import logger from "../config/logger";




import { z } from "zod";

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) => {

    if (err instanceof AppError) {
        return sendResponse(res, err.statusCode, err.message);
    }

    if (err instanceof z.ZodError) {
        const message = err.issues[0]?.message || "Validation failed";
        return sendResponse(res, HTTP_STATUS.BAD_REQUEST, message);
    }

    logger.error('unhandled Error: ', err);
    return sendResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, COMMON_ERRORS.SOMETHING_WENT_WRONG);

}