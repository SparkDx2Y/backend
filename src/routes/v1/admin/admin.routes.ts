import { Router } from "express";
import { DI_TYPES } from "../../../di/types";
import type { AdminController } from "../../../controllers/admin/AdminController";
import container from "../../../di";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";
import { requireAdmin } from "../../../middlewares/auth/roleMiddleware";

const router = Router();

const adminController = container.get<AdminController>(DI_TYPES.CONTROLLERS.ADMIN_CONTROLLER);

//* ------------------ Admin Routes ---------------------------
// All routes require authentication and admin role

router.get('/users', authMiddleware, requireAdmin, adminController.getAllUsers);
router.patch('/users/:userId/block-status', authMiddleware, requireAdmin, adminController.updateUserBlockStatus);

export default router;

