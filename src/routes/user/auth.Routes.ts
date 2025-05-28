import express, { RequestHandler } from 'express'
import { UserRepository } from '../../repositories/UserRepository'
import { OtpRepository } from '../../repositories/otpRepository'
import { AuthService } from '../../services/AuthService'
import { AuthController } from '../../controllers/user/AuthController'

const userRepo = new UserRepository()
const otpRep = new OtpRepository()
const authService = new AuthService(userRepo, otpRep)
const authController = new AuthController(authService)

const router = express.Router()

router.post('/signup', authController.signup)
router.post('/otp/verify', authController.verifyOtp)
router.post('/login', authController.login)
router.post('/logout', authController.logout);
router.post('/otp/resend', authController.resendOtp)




export default router