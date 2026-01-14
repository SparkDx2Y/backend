import { Router } from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import { AdminInterestController } from "../../../controllers/admin/interest/AdminInterestController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";
import { requireAdmin } from "../../../middlewares/auth/roleMiddleware";

const router = Router();

const controller = container.get<AdminInterestController>(
    DI_TYPES.CONTROLLERS.ADMIN_INTEREST_CONTROLLER
);

// =====================
// CATEGORY ROUTES
// =====================
// Base path: /api/v1/admin/categories

router.post('/', authMiddleware, requireAdmin, controller.createCategory);
router.get('/', authMiddleware, requireAdmin, controller.getAllCategories);
router.put('/:id', authMiddleware, requireAdmin, controller.updateCategory);
router.patch('/:id/active', authMiddleware, requireAdmin, controller.setActiveCategory);

export default router;