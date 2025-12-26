import { Express } from "express";
import { injectable } from "inversify";
import { IFileService } from "./IFileService";
import cloudinary from "../../config/cloudinary";
import { Readable } from "stream";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_FILES_PER_REQUEST, MAX_IMAGE_FILE_SIZE } from "../../constants/file.constants";


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
        throw new Error("Too many files");
    }

    files.forEach(file => this.validateImage(file));

    return Promise.all(files.map(file => this.uploadToCloudinary(file)));
   }

   /**
   * Validates image 
   */
  private validateImage(file: Express.Multer.File) {

    if(!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
        throw new Error(`Inalid file type for ${file.originalname}`);
    }

    if(file.size > MAX_IMAGE_FILE_SIZE) {
        throw new Error( `File ${file.originalname} exceeds 5MB size limit`);
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

}