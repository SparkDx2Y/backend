import { Router } from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import type { MessageController } from "../../../controllers/message/MessageController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";

const router = Router();

const messageController = container.get<MessageController>(DI_TYPES.CONTROLLERS.MESSAGE_CONTROLLER);

router.post("/", authMiddleware, messageController.sendMessage);
router.get("/matches", authMiddleware, messageController.getMatches);
router.get("/count", authMiddleware, messageController.getUnreadCount);
router.get("/date-proposals", authMiddleware, messageController.getDateProposals);
router.get("/:matchId", authMiddleware, messageController.getMessages);
router.put("/:matchId/read", authMiddleware, messageController.markAsRead);
router.delete("/:messageId", authMiddleware, messageController.deleteMessage);
router.post("/proposal/:messageId", authMiddleware, messageController.respondToDateProposal);

export default router;
