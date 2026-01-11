import { Router } from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import { ProfileController } from "../../../controllers/profile/ProfileController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";

const router = Router();

const profileController =
    container.get<ProfileController>(
        DI_TYPES.CONTROLLERS.PROFILE_CONTROLLER
    );

// -------------------------------
// Profile routes
// -------------------------------

// Complete profile (onboarding – uses temp_token)
router.post(
    "/complete",
    profileController.completeProfile
);

// Get my profile (after login – uses accessToken)
router.get(
    "/profile",
    authMiddleware,
    profileController.getMyProfile
);

// Update my profile (settings)
router.put(
    "/profile",
    authMiddleware,
    profileController.updateProfile
);

export default router;
