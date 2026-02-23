import { Router } from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import type { ReportController } from "../../../controllers/report/ReportController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";

const router = Router();

const reportController = container.get<ReportController>(DI_TYPES.CONTROLLERS.REPORT_CONTROLLER);

router.post("/", authMiddleware, reportController.createReport);

export default router;
