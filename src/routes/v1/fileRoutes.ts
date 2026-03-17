import { Router } from "express";
import multer from "multer";
import container from "../../di";
import { DI_TYPES } from "../../di/types";
import type { FileController } from "../../controllers/file/FileController";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get controller instance from DI container
const fileController = container.get<FileController>(DI_TYPES.CONTROLLERS.FILE_CONTROLLER);

// Routes
router.post("/upload", upload.single("file"), fileController.uploadSingle);
router.post("/upload-multiple", upload.array("files", 6), fileController.uploadMultiple);
router.post("/upload-chat-media", upload.single("file"), fileController.uploadChatMedia);

export default router;

