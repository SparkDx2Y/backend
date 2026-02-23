import { Router } from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import type { InterestController } from "../../../controllers/admin/interest/InterestController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";
import { requireAdmin } from "../../../middlewares/auth/roleMiddleware";

const router = Router();

const adminInterestController = container.get<InterestController>(
    DI_TYPES.CONTROLLERS.INTEREST_CONTROLLER
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
