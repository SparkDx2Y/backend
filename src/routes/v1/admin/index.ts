import { Router } from "express";
import adminCategoryRoutes from "./categories.routes";
import adminInterestRoutes from "./interests.routes";

const router = Router();

router.use("/categories", adminCategoryRoutes);
router.use("/interests", adminInterestRoutes);

export default router;
