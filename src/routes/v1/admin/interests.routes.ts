import { Router } from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import { AdminInterestController } from "../../../controllers/admin/interest/AdminInterestController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";
import { requireAdmin } from "../../../middlewares/auth/roleMiddleware";

const router = Router();

const adminInterestController = container.get<AdminInterestController>(
    DI_TYPES.CONTROLLERS.ADMIN_INTEREST_CONTROLLER
);

// =====================
// INTEREST ROUTES
// =====================
// Base path: /api/v1/admin/interests

router.post('/', authMiddleware, requireAdmin, adminInterestController.createInterest);
router.get('/', authMiddleware, requireAdmin, adminInterestController.getAllInterests);
router.put('/:id', authMiddleware, requireAdmin, adminInterestController.updateInterest);
router.patch('/:id/active', authMiddleware, requireAdmin, adminInterestController.setActiveInterest);

export default router;
