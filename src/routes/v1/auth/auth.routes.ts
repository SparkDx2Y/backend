import { Router } from "express";
import { DI_TYPES } from "../../../di/types";
import { AuthController } from "../../../controllers/auth/AuthController";
import container from "../../../di";

const router = Router()


const authController = container.get<AuthController>(DI_TYPES.CONTROLLERS.AUTH_CONTROLLER);

//* ------------------ Auth Routes ---------------------------

router.post('/signup', (req,res) =>  authController.signup(req,res))

router.post('/verify-otp', (req,res) =>  authController.verifySignupOtp(req,res))

router.post('/resend-otp', (req,res) => authController.resendSignupOtp(req,res))

router.post('/login', (req,res) => authController.login(req,res))

router.post('/forgot-password', (req,res) => authController.forgotPassword(req,res))

router.post('/forgot-password/verify-otp', (req,res) => authController.forgotPasswordVerifyOtp(req,res))

router.post('/reset-password', (req,res) => authController.resetPassword(req,res))

router.post('/logout', (req,res) => authController.logout(req,res))

router.post('/refresh-token', (req,res) => authController.refreshToken(req,res))

export default router