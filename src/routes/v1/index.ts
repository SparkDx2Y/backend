import { Router } from "express";
import AuthRoutes from "./auth/auth.routes";
import profileRoutes from "./profile/profile.routes";
import fileRoutes from "./fileRoutes";

const router = Router()

//? Auth routes
router.use('/auth', AuthRoutes)

//? Profile routes
router.use('/profile', profileRoutes)

//? File routes
router.use('/files', fileRoutes)

export default router