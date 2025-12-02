import { Router } from "express";
import { DI_TYPES } from "../../../di/types";
import { AuthController } from "../../../controllers/auth/AuthController";
import container from "../../../di";

const router = Router()


const authController = container.get<AuthController>(DI_TYPES.CONTROLLERS.AUTH_CONTROLLER);

//* ------------------ Auth Routes ---------------------------

router.post('/signup', authController.signup)

router.post('/verify-otp', authController.verifySignupOtp)

router.post('/resend-otp', authController.resendSignupOtp)

router.post('/login', authController.login)

router.post('/forgot-password', authController.forgotPassword)

router.post('/forgot-password/verify-otp', authController.forgotPasswordVerifyOtp)

router.post('/reset-password', authController.resetPassword)

router.post('/logout', authController.logout)

router.post('/refresh-token', authController.refreshToken)

export default router