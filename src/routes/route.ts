import { Router } from "express";
import v1Routes from "./v1";

const router = Router()

//? v1 route
router.use('/v1', v1Routes)

export default router