import { Router } from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import type { SubscriptionController } from "../../../controllers/admin/subscription/SubscriptionController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";
import { requireAdmin } from "../../../middlewares/auth/roleMiddleware";

const router = Router();

const controller = container.get<SubscriptionController>(
    DI_TYPES.CONTROLLERS.SUBSCRIPTION_CONTROLLER
);


router.post('/', authMiddleware, requireAdmin, controller.createPlan);
router.get('/', authMiddleware, requireAdmin, controller.getAllPlans);
router.get('/:id', authMiddleware, requireAdmin, controller.getPlanById);
router.put('/:id', authMiddleware, requireAdmin, controller.updatePlan);
router.patch('/:id/toggle', authMiddleware, requireAdmin, controller.togglePlanStatus);

export default router;
