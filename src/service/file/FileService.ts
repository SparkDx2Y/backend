import { Express } from "express";
import { injectable } from "inversify";
import { IFileService } from "./IFileService";
import cloudinary from "../../config/cloudinary";
import { Readable } from "stream";

@injectable()
export class FileService implements IFileService {
    async uploadImage(file: Express.Multer.File): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "spark/profiles",
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error("Upload failed"));
                    resolve(result.secure_url);
                }
            );

            const readableStream = new Readable();
            readableStream.push(file.buffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
    }

    async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
        const uploadPromises = files.map(file => this.uploadImage(file));
        return Promise.all(uploadPromises);
    }
}
