import type { Express } from "express";
import { StorageUploadOptions } from "../../types/storage";

export interface IStorageProvider {
    upload(file: Express.Multer.File, folder: string, options?: StorageUploadOptions): Promise<string>;
}