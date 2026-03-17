import { Router } from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import type { ProfileController } from "../../../controllers/profile/ProfileController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";

const router = Router();

const profileController =
    container.get<ProfileController>(
        DI_TYPES.CONTROLLERS.PROFILE_CONTROLLER
    );

// -------------------------------
// Profile routes
// -------------------------------

// Complete profile
router.post(
    "/complete",
    authMiddleware,
    profileController.completeProfile
);

// Get my profile
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

// Get interests for selection
router.get(
    "/interests",
    authMiddleware,
    profileController.getInterests
);

// Save user interests
router.post(
    "/interests",
    authMiddleware,
    profileController.updateInterests
);

// update user location
router.put(
    "/location",
    authMiddleware,
    profileController.updateLocation
);

// Get public profile (for other users)
router.get(
    "/:userId",
    authMiddleware,
    profileController.getPublicProfile
);


export default router;
