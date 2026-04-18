import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/responseHelper";
import { COMMON_MESSAGES } from "../../constants/common.messages";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IFileService } from "../../service/file/IFileService";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { FILE_ERRORS } from "../../constants/errors/file.errors";
import { uploadChatMediaSchema } from "../../dto/request/message/upload-chat-media.dto";


@injectable()
export class FileController {
    constructor(
        @inject(DI_TYPES.SERVICES.FILE_SERVICE) private readonly _fileService: IFileService
    ) { }

    // ----------------------------------
    // Upload single image
    // ----------------------------------

    uploadSingle = async (req: Request, res: Response, next: NextFunction) => {
        try {

            if (!req.file) {
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, FILE_ERRORS.NO_FILE);
            }

            let url: string;
            if (req.file.mimetype.startsWith('video/')) {
                const startTime = req.body.startTime ? parseFloat(req.body.startTime) : undefined;
                url = await this._fileService.uploadVideo(req.file, startTime);
            } else {
                url = await this._fileService.uploadImage(req.file);
            }

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FILE_UPLOADED, { url });
        } catch (error) {
            next(error)
        }
    };

    // ----------------------------------
    // Upload multiple images
    // ----------------------------------

    uploadMultiple = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, FILE_ERRORS.NO_FILE);
            }

          
            const urls = await this._fileService.uploadMultipleImages(files);

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.FILES_UPLOADED, { urls });

        } catch (error) {
            next(error)
        }
    };

    // ----------------------------------
    // Upload chat media
    // ----------------------------------
    uploadChatMedia = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                return sendResponse(res, HTTP_STATUS.BAD_REQUEST, FILE_ERRORS.NO_FILE);
            }

            const { type } = uploadChatMediaSchema.parse(req.body);

            const url = await this._fileService.uploadChatMedia(req.file, type);

            return sendResponse(res, HTTP_STATUS.OK, COMMON_MESSAGES.MEDIA_UPLOADED, { url });
        } catch (error) {
            next(error);
        }
    };
}