import { Express } from "express";
import { inject, injectable } from "inversify";
import { IFileService } from "./IFileService";
import { ALLOWED_AUDIO_MIME_TYPES, ALLOWED_IMAGE_MIME_TYPES, ALLOWED_VIDEO_MIME_TYPES, MAX_AUDIO_FILE_SIZE, MAX_FILES_PER_REQUEST, MAX_IMAGE_FILE_SIZE, MAX_VIDEO_FILE_SIZE } from "../../constants/file.constants";
import { ChatMediaType } from "../../types/common";
import { AppError } from "../../utils/AppError";
import { FILE_ERRORS } from "../../constants/errors/file.errors";
import { HTTP_STATUS } from "../../constants/http-status.constants";
import { DI_TYPES } from "../../di/types";
import { IStorageProvider } from "../storage/IStorageProvider";
import { StorageUploadOptions } from "../../types/storage";
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

    async uploadVideo(file: Express.Multer.File, startTime?: number): Promise<string> {
        this.validateVideo(file);

        const options: StorageUploadOptions = {};
        if (startTime !== undefined) {
            options.transformation = [
                { start_offset: startTime, duration: 15, crop: "fill" }
            ];
        }

        return this._storageProvider.upload(file, STORAGE_FOLDERS.PROFILE, options);
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



    async uploadChatMedia(file: Express.Multer.File, type: ChatMediaType): Promise<string> {
        const validator = this.validators[type];
        if (!validator) {
            throw new AppError(FILE_ERRORS.INVALID_FILE_TYPE, HTTP_STATUS.BAD_REQUEST);
        }

        validator(file);

        return this._storageProvider.upload(
            file,
            STORAGE_FOLDERS.CHAT
        );
    }


    // ----------------------------------
    // Validators of chat media  for type image or audio
    // ----------------------------------
    private validators: Record<ChatMediaType, (file: Express.Multer.File) => void> = {
        'image': (file) => this.validateImage(file),
        'audio': (file) => this.validateAudio(file)
    };

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


    /**
     * Validates audio
     */
    private validateAudio(file: Express.Multer.File) {
        // Strip parameters (e.g. ;codecs=opus)
        const mimeType = file.mimetype.split(';')[0] || '';
        if (!ALLOWED_AUDIO_MIME_TYPES.includes(mimeType)) {
            throw new AppError(
                `Invalid audio file type: ${mimeType}`,
                HTTP_STATUS.BAD_REQUEST
            );
        }

        if (file.size > MAX_AUDIO_FILE_SIZE) {
            throw new AppError(
                "Audio file size too large",
                HTTP_STATUS.BAD_REQUEST
            );
        }
    }

    /**
     * Validates video
     */
    private validateVideo(file: Express.Multer.File) {
        if (!ALLOWED_VIDEO_MIME_TYPES.includes(file.mimetype)) {
            throw new AppError(
                FILE_ERRORS.INVALID_FILE_TYPE,
                HTTP_STATUS.BAD_REQUEST
            );
        }

        if (file.size > MAX_VIDEO_FILE_SIZE) {
            throw new AppError(
                "Video file size too large (max 50MB)",
                HTTP_STATUS.BAD_REQUEST
            );
        }
    }
}