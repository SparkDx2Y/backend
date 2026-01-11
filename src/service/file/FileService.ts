import { Express } from "express";
import { injectable } from "inversify";
import { IFileService } from "./IFileService";
import cloudinary from "../../config/cloudinary";
import { Readable } from "stream";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_FILES_PER_REQUEST, MAX_IMAGE_FILE_SIZE } from "../../constants/file.constants";
import { AppError } from "../../utils/AppError";
import { FILE_ERRORS } from "../../constants/errors/file.errors";
import { HTTP_STATUS } from "../../constants/http-status.constants";


@injectable()
export class FileService implements IFileService {

   // ----------------------------------
   // Upload single image
   // ----------------------------------
   async uploadImage(file: Express.Multer.File): Promise<string> {

    this.validateImage(file);

    return this.uploadToCloudinary(file);
   }

   // ----------------------------------
   // Upload multiple images
   // ----------------------------------
   async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {

    if (files.length > MAX_FILES_PER_REQUEST) {
        throw new AppError(
            FILE_ERRORS.TOO_MANY_FILES,
            HTTP_STATUS.BAD_REQUEST
        );
    }

    files.forEach(file => this.validateImage(file));

    return Promise.all(files.map(file => this.uploadToCloudinary(file)));
   }

   /**
   * Validates image 
   */
  private validateImage(file: Express.Multer.File) {

    if(!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
        throw new AppError(
            FILE_ERRORS.INVALID_FILE_TYPE,
            HTTP_STATUS.BAD_REQUEST
        );
    }

    if(file.size > MAX_IMAGE_FILE_SIZE) {
        throw new AppError(
            FILE_ERRORS.FILE_SIZE_LARGE,
            HTTP_STATUS.BAD_REQUEST
        );
    }
  }

  /**
   * Uploads image to cloudinary
   */
  private uploadToCloudinary(file: Express.Multer.File): Promise<string> {

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "spark/profiles",
            },
            (error, result) => {
                if(error || !result) {
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