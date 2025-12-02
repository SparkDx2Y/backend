import { Router } from "express";
import AuthRoutes from "./auth/auth.routes";


const router = Router()

//? Auth routes
router.use('/auth', AuthRoutes) 

export default router