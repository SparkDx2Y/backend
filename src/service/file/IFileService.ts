import { Express } from "express";

import { ChatMediaType } from "../../types/common";


export interface IFileService {
    uploadImage(file: Express.Multer.File): Promise<string>;
    uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]>;
    uploadChatMedia(file: Express.Multer.File, type: ChatMediaType): Promise<string>;
}
