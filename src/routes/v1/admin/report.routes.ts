import { Router } from "express";
import { DI_TYPES } from "../../../di/types";
import type { ReportController } from "../../../controllers/report/ReportController";
import container from "../../../di";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";
import { requireAdmin } from "../../../middlewares/auth/roleMiddleware";

const router = Router();

const reportController = container.get<ReportController>(DI_TYPES.CONTROLLERS.REPORT_CONTROLLER);

//* ------------------ Admin Report Routes ---------------------------

router.get("/", authMiddleware, requireAdmin, reportController.getReports);
router.patch("/:reportId/status", authMiddleware, requireAdmin, reportController.updateReportStatus);

export default router;
