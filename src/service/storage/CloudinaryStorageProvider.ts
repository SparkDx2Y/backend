import { injectable } from "inversify";
import { Express } from "express";
import { IStorageProvider } from "./IStorageProvider";
import cloudinary from "../../config/cloudinary";
import { AppError } from "../../utils/AppError";
import { FILE_ERRORS } from "../../constants/errors/file.errors";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { Readable } from "stream";


@injectable()
export class CloudinaryStorageProvider implements IStorageProvider {

    async upload(file: Express.Multer.File, folder: string): Promise<string> {
        return new Promise((resolve, reject) => {

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "auto"
                },

                (error, result) => {
                    if (error || !result) {
                        return reject(
                            new AppError(
                                FILE_ERRORS.UPLOAD_FAILED,
                                HTTP_STATUS.INTERNAL_SERVER_ERROR
                            )
                        );
                    }

                    resolve(result.secure_url);
                }
            );

            const readableStream = new Readable();
            readableStream.push(file.buffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
    }
}
