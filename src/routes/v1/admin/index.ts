import { Router } from "express";
import adminUserRoutes from "./admin.routes";
import adminCategoryRoutes from "./categories.routes";
import adminInterestRoutes from "./interests.routes";
import adminReportRoutes from "./report.routes";

const router = Router();

router.use("/", adminUserRoutes);
router.use("/categories", adminCategoryRoutes);
router.use("/interests", adminInterestRoutes);
router.use("/reports", adminReportRoutes);

export default router;
