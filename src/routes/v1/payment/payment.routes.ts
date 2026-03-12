import { Router } from "express";
import express from "express";
import container from "../../../di";
import { DI_TYPES } from "../../../di/types";
import { PaymentController } from "../../../controllers/payment/PaymentController";
import { authMiddleware } from "../../../middlewares/auth/authMiddleware";

const router = Router();
const paymentController = container.get<PaymentController>(DI_TYPES.CONTROLLERS.PAYMENT_CONTROLLER);

router.post("/webhook", paymentController.handleWebhook);

router.post("/create-checkout-session", authMiddleware, paymentController.createCheckoutSession);

export default router;
