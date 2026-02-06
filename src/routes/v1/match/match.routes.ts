import { Router } from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import { MatchController } from "../../../controllers/match/MatchController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";
import { onboardingGuard } from "../../../middlewares/onboardingGuard.ts";

const router = Router();

const matchController = container.get<MatchController>(DI_TYPES.CONTROLLERS.MATCH_CONTROLLER);

router.get("/feed", authMiddleware, onboardingGuard, matchController.getFeed);
router.post("/swipe", authMiddleware, onboardingGuard, matchController.swipe);

export default router;
