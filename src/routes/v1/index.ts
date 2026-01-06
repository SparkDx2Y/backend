import { Router } from "express";
import AuthRoutes from "./auth/auth.routes";
import profileRoutes from "./profile/profile.routes";
import fileRoutes from "./fileRoutes";
import matchRoutes from "./match/match.routes";
import adminRoutes from "./admin/admin.routes";


const router = Router()

//? Auth routes
router.use('/auth', AuthRoutes)

//? Profile routes
router.use('/profile', profileRoutes)

//? File routes
router.use('/files', fileRoutes)

//? Match routes
router.use('/match', matchRoutes)

//? Admin routes
router.use('/admin', adminRoutes)

export default router
