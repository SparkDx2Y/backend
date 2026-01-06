import { Router } from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import { MatchController } from "../../../controllers/match/MatchController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";

const router = Router();

const matchController = container.get<MatchController>(DI_TYPES.CONTROLLERS.MATCH_CONTROLLER);

router.get("/feed", authMiddleware, matchController.getFeed);
router.post("/swipe", authMiddleware, matchController.swipe);

export default router;
