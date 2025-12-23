import { Router } from "express";
import multer from "multer";
import container from "../di";
import { DI_TYPES } from "../di/types";
import { IFileService } from "../service/file/IFileService";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileService = container.get<IFileService>(DI_TYPES.SERVICES.FILE_SERVICE);
        const url = await fileService.uploadImage(req.file);

        return res.status(200).json({ url });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

router.post("/upload-multiple", upload.array("files", 6), async (req, res) => {
    try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const fileService = container.get<IFileService>(DI_TYPES.SERVICES.FILE_SERVICE);
        const urls = await fileService.uploadMultipleImages(req.files as Express.Multer.File[]);

        return res.status(200).json({ urls });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;
