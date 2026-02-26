import { Router } from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import { UserSubscriptionController } from "../../../controllers/subscription/UserSubscriptionController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";

const router = Router();

const controller = container.get<UserSubscriptionController>(
    DI_TYPES.CONTROLLERS.USER_SUBSCRIPTION_CONTROLLER
);

router.get('/plans', controller.getActivePlans);

export default router;
