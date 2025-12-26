import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { DI_TYPES } from "../../di/types";
import { IFileService } from "../../service/file/IFileService";


@injectable()
export class FileController {
    constructor(
        @inject(DI_TYPES.SERVICES.FILE_SERVICE) private readonly _fileService: IFileService
    ) {}

    // ----------------------------------
    // Upload single image
    // ----------------------------------

  uploadSingle = async (req: Request, res: Response) => {
    try {
        
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const url = await this._fileService.uploadImage(req.file);

        return res.status(200).json({ url });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

    // ----------------------------------
    // Upload multiple images
    // ----------------------------------

    uploadMultiple = async (req: Request, res: Response) => {
        try {

            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                return res.status(400).json({ message: "No files uploaded" });
            }

            // Upload all files
            const urls = await this._fileService.uploadMultipleImages(files);

            return res.status(200).json({ urls });
            
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    };


}

































































// @injectable()
// export class FileController {
//     constructor(
//         @inject(DI_TYPES.SERVICES.FILE_SERVICE) private _fileService: IFileService
//     ) { }

//     //* // // // // // //   uploadSingle  // // // // // // // *//

//     uploadSingle = async (req: Request, res: Response) => {
//         try {
//             // Input validation
//             if (!req.file) {
//                 return res.status(400).json({ message: "No file uploaded" });
//             }

//             // File type validation
//             const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
//             if (!allowedMimeTypes.includes(req.file.mimetype)) {
//                 return res.status(400).json({
//                     message: `Invalid file type. Only ${allowedMimeTypes.join(', ')} are allowed`
//                 });
//             }

//             // File size validation (5MB)
//             const maxSize = 5 * 1024 * 1024;
//             if (req.file.size > maxSize) {
//                 return res.status(400).json({
//                     message: "File too large. Maximum size is 5MB"
//                 });
//             }

//             // Upload file
//             const url = await this._fileService.uploadImage(req.file);

//             return res.status(200).json({ url });
//         } catch (error: any) {
//             return res.status(500).json({ message: error.message });
//         }
//     };

//     //* // // // // // //   uploadMultiple  // // // // // // // *//

//     uploadMultiple = async (req: Request, res: Response) => {
//         try {
//             // Input validation
//             if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
//                 return res.status(400).json({ message: "No files uploaded" });
//             }

//             const files = req.files as Express.Multer.File[];

//             // Max 6 per request
//             if (files.length > 6) {
//                 return res.status(400).json({
//                     message: "Maximum 6 photos allowed per request"
//                 });
//             }

//             // File type and size validation for each file
//             const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
//             const maxSize = 5 * 1024 * 1024;

//             for (const file of files) {
//                 if (!allowedMimeTypes.includes(file.mimetype)) {
//                     return res.status(400).json({
//                         message: `Invalid file type for ${file.originalname}. Only images are allowed`
//                     });
//                 }

//                 if (file.size > maxSize) {
//                     return res.status(400).json({
//                         message: `File ${file.originalname} is too large. Maximum size is 5MB`
//                     });
//                 }
//             }

//             // Upload all files
//             const urls = await this._fileService.uploadMultipleImages(files);

//             return res.status(200).json({ urls });
//         } catch (error: any) {
//             return res.status(500).json({ message: error.message });
//         }
//     };
// }
