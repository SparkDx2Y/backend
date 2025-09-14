import { Router } from "express";
import userAuthRoutes from "./user/auth.routes";


const router = Router()

//? user routes
router.use('/auth', userAuthRoutes)

export default router