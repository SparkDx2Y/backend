import { Express } from "express";
import { inject, injectable } from "inversify";
import { IFileService } from "./IFileService";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_FILES_PER_REQUEST, MAX_IMAGE_FILE_SIZE } from "../../constants/file.constants";
import { AppError } from "../../utils/AppError";
import { FILE_ERRORS } from "../../constants/errors/file.errors";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { DI_TYPES } from "../../di/types";
import { IStorageProvider } from "../storage/IStorageProvider";
import { STORAGE_FOLDERS } from "../../constants/storage.constants";


@injectable()
export class FileService implements IFileService {

    constructor(
        @inject(DI_TYPES.PROVIDERS.STORAGE_PROVIDER) private _storageProvider: IStorageProvider
    ) { }

    // ----------------------------------
    // Upload single image
    // ----------------------------------
    async uploadImage(file: Express.Multer.File): Promise<string> {

        this.validateImage(file);

        return this._storageProvider.upload(file, STORAGE_FOLDERS.PROFILE);
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

        return Promise.all(files.map(file => this._storageProvider.upload(file, STORAGE_FOLDERS.PROFILE)));
    }

    /**
    * Validates image 
    */
    private validateImage(file: Express.Multer.File) {

        if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
            throw new AppError(
                FILE_ERRORS.INVALID_FILE_TYPE,
                HTTP_STATUS.BAD_REQUEST
            );
        }

        if (file.size > MAX_IMAGE_FILE_SIZE) {
            throw new AppError(
                FILE_ERRORS.FILE_SIZE_LARGE,
                HTTP_STATUS.BAD_REQUEST
            );
        }
    }

}