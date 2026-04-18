import type { Express } from "express";

import type { ChatMediaType } from "../../types/common";


export interface IFileService {
    uploadImage(file: Express.Multer.File): Promise<string>;
    uploadVideo(file: Express.Multer.File, startTime?: number): Promise<string>;
    uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]>;
    uploadChatMedia(file: Express.Multer.File, type: ChatMediaType): Promise<string>;
}
